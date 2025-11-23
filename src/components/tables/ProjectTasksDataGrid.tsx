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
import { TaskListSquarePerson24Regular } from "@fluentui/react-icons";
import { tasksApi } from '../apis/tasks';
import { taskColumns } from './taskColumns';
import type { TaskResponse } from '../apis/tasks';
import { usersApi } from '../apis/users';
import type { User } from '../apis/auth';

import type { Task } from '../../types/MyTasksTypes';

interface ProjectTasksDataGridProps {
    projectId: string;
    onRowClick?: (task: Task) => void;
    onAddClick?: () => void;
    onFetchComplete?: (tasks: Task[]) => void;
    refreshSignal?: number;
}

function ProjectTasksDataGrid({ projectId, onRowClick, onAddClick, onFetchComplete, refreshSignal }: ProjectTasksDataGridProps) {
    const styles = mainLayoutStyles();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const { register: searchRegister, watch: searchWatch } = useForm<{ search: string }>({ defaultValues: { search: '' } });
    const searchValue = searchWatch('search');

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const fetched = await tasksApi.getTasksByProject(projectId);

            let fetchedTasksArray: unknown[] = [];
            if (Array.isArray(fetched)) fetchedTasksArray = fetched;
            else if (fetched && typeof fetched === 'object' && 'data' in fetched && Array.isArray((fetched as Record<string, unknown>).data)) fetchedTasksArray = (fetched as { data: unknown[] }).data;
            else if (fetched && typeof fetched === 'object' && 'tasks' in fetched && Array.isArray((fetched as Record<string, unknown>).tasks)) fetchedTasksArray = (fetched as { tasks: unknown[] }).tasks;
            else {
                console.error('Unexpected tasks response shape, expected an array. Response:', fetched);
                setTasks([]);
                return;
            }

            const transformedTasks: Task[] = (fetchedTasksArray as TaskResponse[]).map((task: TaskResponse) => {
                const taskId = task._id || (task as { id?: string })?.id || '';

                // Handle assignedTo
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
                    category: task.category,
                    categoryId: task.category,
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
                        user: c.authorId,
                        text: c.text || c.content || undefined,
                        content: c.content || undefined,
                        createdAt: c.createdAt
                    }))
                } as Task;
            });

            // Fetch related users for tasks
            const userIds = new Set<string>();
            transformedTasks.forEach(task => {
                task.assignedTo.forEach(id => { if (id) userIds.add(id); });
                if (task.createdBy) userIds.add(task.createdBy);
                task.comments.forEach(comment => { if (comment.authorId) userIds.add(comment.authorId); });
            });

            const userPromises = Array.from(userIds).map(id => usersApi.getUserById(id).catch(() => null));
            const users = await Promise.all(userPromises);
            const userMap = new Map<string, User | undefined>();
            Array.from(userIds).forEach((id, idx) => { userMap.set(id, users[idx] ?? undefined); });

            transformedTasks.forEach(task => {
                task.assignedToUsers = [];
                task.assignedTo.forEach(id => {
                    if (userMap.has(id)) {
                        const u = userMap.get(id);
                        if (u) task.assignedToUsers!.push(u);
                    }
                });
                if (task.createdBy && userMap.has(task.createdBy)) task.createdByUser = userMap.get(task.createdBy);
                task.comments.forEach(comment => { if (comment.authorId && userMap.has(comment.authorId)) comment.authorUser = userMap.get(comment.authorId); });
            });

            setTasks(transformedTasks);
            onFetchComplete?.(transformedTasks);
        } catch (error) {
            console.error('Failed to fetch project tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [projectId, onFetchComplete]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
        if (typeof refreshSignal === 'number') fetchTasks();
    }, [refreshSignal, fetchTasks]);

    function handleRowClickLocal(task: Task) { onRowClick?.(task); }

    const filteredTasks = useMemo(() => {
        if (!searchValue) return tasks;
        const q = searchValue.toLowerCase();
        return tasks.filter(task =>
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
                    <Label>Project Tasks</Label>
                </div>
                <div className={mergeClasses(styles.flexRowFit, styles.alignCenter, styles.gap)}>
                    <Button appearance="primary" onClick={() => onAddClick?.()}>Add Task</Button>
                    <Input placeholder="Search tasks..." type="search" style={{ minWidth: 200 }} {...searchRegister('search')} />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spinner />
                    Loading tasks...
                </div>
            ) : (
                <DataGrid items={filteredTasks} columns={taskColumns}>
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
                                <DataGridRow key={String(rowId)} onClick={() => handleRowClickLocal(task)} style={{ cursor: 'pointer' }}>
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

export default ProjectTasksDataGrid;
