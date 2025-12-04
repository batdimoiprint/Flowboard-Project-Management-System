
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
import { tasksApi } from '../apis/tasks';
import { taskColumns } from './taskColumns';
import type { TaskResponse } from '../apis/tasks';
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
            // Use the new endpoint which returns tasks for the authenticated user
            const fetched = await tasksApi.getMyTasks();
            // console.log('Fetched tasks raw response from API:', fetched);


            let fetchedTasksArray: unknown[] = [];
            if (Array.isArray(fetched)) {
                fetchedTasksArray = fetched;
            } else if (fetched && typeof fetched === 'object' && 'data' in fetched && Array.isArray((fetched as Record<string, unknown>).data)) {
                fetchedTasksArray = (fetched as { data: unknown[] }).data;
            } else if (fetched && typeof fetched === 'object' && 'tasks' in fetched && Array.isArray((fetched as Record<string, unknown>).tasks)) {
                fetchedTasksArray = (fetched as { tasks: unknown[] }).tasks;
            } else {
                // Unexpected shape — avoid crashing and surface the error in console
                console.error('Unexpected tasks response shape, expected an array. Response:', fetched);
                setTasks([]);
                return;
            }

            console.log('Normalized tasks array sample:', fetchedTasksArray[0]);

            // Transform API response to match local Task type
            const transformedTasks: Task[] = (fetchedTasksArray as TaskResponse[]).map((task: TaskResponse) => {
                console.log('Transforming task:', task);
                console.log('Task _id:', task._id);

                // Handle both _id and id from API
                const taskId = task._id || (task as { id?: string })?.id || '';
                console.log('Using taskId:', taskId);

                // Handle assignedTo which might be string (legacy) or array (new)
                let assignedToArray: string[] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawAssignedTo = (task as any).assignedTo;
                if (Array.isArray(rawAssignedTo)) {
                    assignedToArray = rawAssignedTo;
                } else if (typeof rawAssignedTo === 'string') {
                    assignedToArray = [rawAssignedTo];
                }

                return {
                    _id: taskId,
                    projectId: task.projectId, // Include projectId for category loading
                    category: task.category, // API uses 'category'
                    categoryId: task.categoryId || '', // Use actual categoryId from API
                    assignedTo: assignedToArray,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    createdBy: task.createdBy,
                    createdAt: task.createdAt,
                    comments: task.comments.map(c => ({
                        authorId: c.authorId,
                        user: c.authorId, // Map authorId to user for backward compatibility
                        text: c.text || c.content || undefined, // Support both 'text' and 'content' fields
                        content: c.content || undefined,
                        createdAt: c.createdAt
                    })),
                };
            });
            console.log('Transformed tasks:', transformedTasks);

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
        <>
            <div className={mergeClasses(styles.flexRowFill, styles.spaceBetween)}>
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
            ) : (

                <DataGrid
                    items={filteredTasks}
                    columns={taskColumns}
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

            )}
        </>
    );
}

export default MyTasksDataGrid;

