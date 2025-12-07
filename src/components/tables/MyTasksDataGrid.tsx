
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridHeaderCell,
    DataGridBody,
    DataGridCell,
    mergeClasses,
    Label,
    Spinner,
} from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { Button, Input } from '@fluentui/react-components';
import type { Task } from '../../types/MyTasksTypes';
import { TaskListSquarePerson24Regular } from "@fluentui/react-icons";
import { subTasksApi, type SubTaskResponse } from '../apis/subtasks';
import { taskColumns } from './taskColumns';
import { usersApi } from '../apis/users';


interface MyTasksDataGridProps {
    onRowClick?: (task: Task) => void;
    onAddClick?: () => void;
    onFetchComplete?: (tasks: Task[]) => void;
    refreshSignal?: number;
}

function MyTasksDataGrid({ onRowClick, onAddClick, onFetchComplete, refreshSignal }: MyTasksDataGridProps) {
    const styles = mainLayoutStyles();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);



    const { register: searchRegister, watch: searchWatch } = useForm<{ search: string }>({ defaultValues: { search: '' } });
    const searchValue = searchWatch('search');


    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            // Use the subtasks API to get tasks for the authenticated user
            const fetched = await subTasksApi.getMySubTasks();

            // Transform API response to match local Task type
            const transformedTasks: Task[] = fetched.map((task: SubTaskResponse) => {
                return {
                    _id: task.id,
                    projectId: task.projectId,
                    category: task.category || '',
                    categoryId: task.categoryId || '',
                    assignedTo: task.assignedTo || [],
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority || 'Medium',
                    status: 'To Do', // SubTask doesn't have status, default to 'To Do'
                    startDate: task.startDate || '',
                    endDate: task.endDate || '',
                    createdBy: task.createdBy || '',
                    createdAt: task.createdAt || '',
                    comments: (task.comments || []).map(c => ({
                        authorId: c.authorId,
                        user: c.authorId,
                        text: c.content || undefined,
                        content: c.content || undefined,
                        createdAt: c.createdAt
                    })),
                };
            });

            // Fetch user details for assignedTo, createdBy, and comment authors
            // Collect unique user IDs
            const userIds = new Set<string>();
            transformedTasks.forEach(task => {
                task.assignedTo.forEach(id => {
                    if (id) userIds.add(id);
                });
                if (task.createdBy) userIds.add(task.createdBy);
                task.comments.forEach(comment => {
                    if (comment.authorId) userIds.add(comment.authorId);
                });
            });

            // Fetch all users in parallel
            const userPromises = Array.from(userIds).map(id =>
                usersApi.getUserById(id).catch(err => {
                    console.error(`Failed to fetch user ${id}:`, err);
                    return null;
                })
            );
            const users = await Promise.all(userPromises);

            // Create a map of userId -> User
            const userMap = new Map();
            users.forEach((user, index) => {
                if (user) {
                    userMap.set(Array.from(userIds)[index], user);
                }
            });

            // Attach user objects to tasks and comments
            transformedTasks.forEach(task => {
                task.assignedToUsers = [];
                task.assignedTo.forEach(id => {
                    if (userMap.has(id)) {
                        task.assignedToUsers!.push(userMap.get(id));
                    }
                });

                if (task.createdBy && userMap.has(task.createdBy)) {
                    task.createdByUser = userMap.get(task.createdBy);
                }
                task.comments.forEach(comment => {
                    if (comment.authorId && userMap.has(comment.authorId)) {
                        comment.authorUser = userMap.get(comment.authorId);
                    }
                });
            });

            setTasks(transformedTasks);
            onFetchComplete?.(transformedTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [onFetchComplete]);

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (typeof refreshSignal === 'number') {
            fetchTasks();
        }
    }, [refreshSignal, fetchTasks]);


    function handleRowClickLocal(task: Task) {
        console.log('Row clicked:', task);
        onRowClick?.(task);
    }

    // Filter tasks by search
    const filteredTasks = useMemo(() => {
        if (!searchValue) return tasks;
        const q = searchValue.toLowerCase();
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(q) ||
                task.description.toLowerCase().includes(q) ||
                task.assignedToUsers?.some(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q))
        );
    }, [tasks, searchValue]);

    return (
        <div className={mergeClasses(styles.flexColFill, styles.hFull, styles.wFull)} style={{ minHeight: 0, maxHeight: '100%', width: '100%' }}>
            <div className={mergeClasses(styles.flexRowFit, styles.spaceBetween)}>
                <div className={mergeClasses(styles.flexRowFit, styles.alignCenter, styles.gap)}>
                    <TaskListSquarePerson24Regular />
                    <Label>My Tasks</Label>
                </div>
                <div className={mergeClasses(styles.flexRowFit, styles.alignCenter, styles.gap)}>
                    <Button appearance="primary" onClick={() => {
                        onAddClick?.();
                    }}>
                        Add Task
                    </Button>
                    <Input
                        placeholder="Search tasks..."
                        type="search"
                        style={{ minWidth: 200 }}
                        {...searchRegister('search')}
                    />

                </div>
            </div>
            {/* TaskDialog is intentionally moved up to parent */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spinner />
                    Loading tasks...
                </div>
            ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <Label style={{ fontSize: 24, fontWeight: 600 }}>No tasks assigned yet</Label>

                </div>
            ) : (
                <div className={styles.dataGridScrollable}>
                    <DataGrid
                        items={filteredTasks}
                        columns={taskColumns}
                        style={{ overflowY: 'auto' }}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody>
                            {(row) => {
                                const { item, rowId } = row;
                                const task = item as Task;
                                return (
                                    <DataGridRow
                                        key={String(rowId)}
                                        onClick={() => handleRowClickLocal(task)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {({ renderCell }) => (
                                            <DataGridCell>{renderCell(task)}</DataGridCell>
                                        )}
                                    </DataGridRow>
                                );
                            }}
                        </DataGridBody>
                    </DataGrid>
                </div>
            )}
        </div>
    );
}

export default MyTasksDataGrid;

