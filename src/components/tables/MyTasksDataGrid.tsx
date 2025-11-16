
import React from 'react';
import { useForm } from 'react-hook-form';
import {
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridHeaderCell,
    DataGridBody,
    DataGridCell,
    createTableColumn,
    mergeClasses,
    Label,
    Spinner,
} from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import { Button, Input, Avatar, Badge } from '@fluentui/react-components';
import TaskDialog from '../dialogs/TaskDialog';
import type { Task } from '../../types/MyTasksTypes';
import { TaskListSquarePerson24Regular } from "@fluentui/react-icons";
import { tasksApi } from '../apis/tasks';
import type { TaskResponse } from '../apis/tasks';
import { usersApi } from '../apis/users';
import { useUser } from '../../hooks/useUser';

// Utility function to format date to yyyy-MM-dd for HTML date inputs
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // Extract just the date part (yyyy-MM-dd) from ISO string or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const columns: TableColumnDefinition<Task>[] = [
    createTableColumn<Task>({
        columnId: 'title',
        renderHeaderCell: () => 'Task Name',
        renderCell: (item) => item.title,
    }),
    createTableColumn<Task>({
        columnId: 'status',
        renderHeaderCell: () => 'Status',
        renderCell: (item) => (
            <Badge
                appearance="outline"
                size="extra-large"
                color={
                    item.status === 'To Do' ? 'brand' :
                        item.status === 'In Progress' ? 'warning' :
                            item.status === 'Done' ? 'success' :
                                'informative'
                }
            >
                {item.status}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'priority',
        renderHeaderCell: () => 'Priority',
        renderCell: (item) => (
            <Badge
                appearance="outline"
                size="extra-large"
                color={
                    item.priority === 'Important' ? 'brand' :
                        item.priority === 'Medium' ? 'warning' :
                            item.priority === 'Done' ? 'success' :
                                'informative'
                }
            >
                {item.priority}
            </Badge>
        ),
    }),
    createTableColumn<Task>({
        columnId: 'createdBy',
        renderHeaderCell: () => 'Created By',
        renderCell: (item) => item.createdByUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    name={`${item.createdByUser.firstName} ${item.createdByUser.lastName}`}
                    size={32}

                    color='blue'
                    image={{ src: item.createdByUser.userIMG || undefined }}
                />
                {`${item.createdByUser.firstName} ${item.createdByUser.lastName}`}
            </div>
        ) : item.createdBy,
    }),
    createTableColumn<Task>({
        columnId: 'assignedTo',
        renderHeaderCell: () => 'Assigned To',
        renderCell: (item) => item.assignedToUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    name={`${item.assignedToUser.firstName} ${item.assignedToUser.lastName}`}
                    size={32}
                    color='blue'
                    image={{ src: item.assignedToUser.userIMG || undefined }}
                />
                {`${item.assignedToUser.firstName} ${item.assignedToUser.lastName}`}
            </div>
        ) : item.assignedTo,
    }),
    createTableColumn<Task>({
        columnId: 'createdAt',
        renderHeaderCell: () => 'Created At',
        renderCell: (item) => {
            if (!item.createdAt) return '';
            const date = new Date(item.createdAt);
            if (isNaN(date.getTime())) return item.createdAt;
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',

            });
        },
    }),
    createTableColumn<Task>({
        columnId: 'endDate',
        renderHeaderCell: () => 'Due Date',
        renderCell: (item) => {
            if (!item.endDate) return '';
            const date = new Date(item.endDate);
            if (isNaN(date.getTime())) return item.endDate;
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',

            });
        },
    }),

];

function MyTasksDataGrid() {
    const { user } = useUser();
    const styles = mainLayoutStyles();
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>("add");
    const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
    const updateTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Form state for add/edit
    const [form, setForm] = React.useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: user?.id || '',
        createdBy: user?.id || '',
        category: '', // Changed from categoryId to match API
        comments: '',
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);

    // Search form
    const { register: searchRegister, watch: searchWatch } = useForm<{ search: string }>({ defaultValues: { search: '' } });
    const searchValue = searchWatch('search');

    // Debug: Monitor editingTaskId changes
    React.useEffect(() => {
        console.log('editingTaskId changed to:', editingTaskId);
    }, [editingTaskId]);

    // Fetch tasks on component mount
    React.useEffect(() => {
        fetchTasks();
    }, []);

    // Fetch tasks function (can be called to refresh)
    async function fetchTasks() {
        try {
            setLoading(true);
            const fetched = await tasksApi.getTasks();
            console.log('Fetched tasks raw response from API:', fetched);

            // Normalize different possible response shapes
            // common shapes: Task[] | { data: Task[] } | { tasks: Task[] }
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

                return {
                    _id: taskId,
                    category: task.category, // API uses 'category'
                    categoryId: task.category, // Map category to categoryId for backward compatibility
                    assignedTo: task.assignedTo,
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
                if (task.assignedTo) userIds.add(task.assignedTo);
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
                if (task.assignedTo && userMap.has(task.assignedTo)) {
                    task.assignedToUser = userMap.get(task.assignedTo);
                }
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
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        setForm((prev) => ({ ...prev, [name]: value }));

        // If in edit mode, automatically update the task
        if (dialogMode === 'edit' && editingTaskId) {
            const isSelect = e.target.tagName === 'SELECT';
            const isDate = (e.target as HTMLInputElement).type === 'date';

            // For select dropdowns and date inputs, update immediately
            if (isSelect || isDate) {
                console.log(`Select/Date changed: ${name} = ${value}`);
                handleFieldUpdate(name, value);
            } else {
                // For text inputs and textareas, debounce the update (wait 800ms after user stops typing)
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                }
                updateTimeoutRef.current = setTimeout(() => {
                    console.log(`Text input debounced: ${name} = ${value}`);
                    handleFieldUpdate(name, value);
                }, 800);
            }
        }
    }

    // Handle real-time field updates when editing
    async function handleFieldUpdate(fieldName: string, value: string) {
        if (!editingTaskId) {
            console.log('No editingTaskId for field update');
            return;
        }

        console.log(`Updating field: ${fieldName} with value: ${value} for task: ${editingTaskId}`);

        try {
            const updates: Partial<{
                title: string;
                description: string;
                priority: string;
                status: string;
                category: string;
                startDate: string;
                endDate: string;
                assignedTo: string;
            }> = {};
            updates[fieldName as keyof typeof updates] = value;

            // Call PATCH API to update just this field
            console.log('Sending PATCH request with:', updates);
            const updatedTask = await tasksApi.patchTask(editingTaskId, updates);
            console.log('PATCH response:', updatedTask);

            // Refresh tasks from server to get the latest data
            await fetchTasks();

            console.log('Tasks refreshed after PATCH');
        } catch (error: unknown) {
            console.error('Failed to update task field:', error);
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message || 'Failed to update task'
                : 'Failed to update task';
            setSubmitError(errorMessage);
        }
    }

    async function handleAddTask(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Ensure assignedTo and createdBy are set to current user's ID
            const taskData = {
                category: form.category,
                assignedTo: form.assignedTo || user?.id || '',
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
                startDate: form.startDate,
                endDate: form.endDate,
                createdBy: user?.id || '',
                comments: form.comments,
            };

            // Call the API to create the task
            await tasksApi.createTask(taskData);

            // Refresh tasks from server to get the latest data with user details
            await fetchTasks();

            // Reset form and close dialog
            setOpen(false);
            setForm({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'To Do',
                startDate: '',
                endDate: '',
                assignedTo: user?.id || '',
                createdBy: user?.id || '',
                category: '', // Changed from categoryId
                comments: '',
            });
            setDialogMode('add');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message || 'Failed to create task'
                : 'Failed to create task';
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteTask() {
        console.log('handleDeleteTask called, editingTaskId:', editingTaskId);

        if (!editingTaskId) {
            console.log('No editingTaskId, returning early');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (!confirmDelete) {
            console.log('Delete cancelled by user');
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            console.log('Calling deleteTask API with id:', editingTaskId);
            // Call the API to delete the task
            await tasksApi.deleteTask(editingTaskId);
            console.log('Task deleted successfully');

            // Refresh tasks from server
            await fetchTasks();

            // Close dialog and reset state
            setOpen(false);
            setEditingTaskId(null);
            setDialogMode('add');
            setForm({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'To Do',
                startDate: '',
                endDate: '',
                assignedTo: user?.id || '',
                createdBy: user?.id || '',
                category: '',
                comments: '',
            });

            console.log('Tasks refreshed after delete');
        } catch (error: unknown) {
            console.error('Delete error:', error);
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message || 'Failed to delete task'
                : 'Failed to delete task';
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleRowClick(task: Task) {
        console.log('handleRowClick called with task:', task);
        console.log('Task ID:', task.createdBy);

        setDialogMode('edit');
        setEditingTaskId(task._id);

        console.log('Set editingTaskId to:', task._id);

        setForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            startDate: formatDateForInput(task.startDate),
            endDate: formatDateForInput(task.endDate),
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            category: task.category || task.categoryId || '', // Use category from API, fallback to categoryId
            comments: '', // Comments will be passed separately as an array
        });
        setOpen(true);
    }

    // Filter tasks by search
    const filteredTasks = React.useMemo(() => {
        if (!searchValue) return tasks;
        const q = searchValue.toLowerCase();
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(q) ||
                task.description.toLowerCase().includes(q) ||
                task.assignedTo.toLowerCase().includes(q)
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
                        setDialogMode('add');
                        setForm({
                            title: '',
                            description: '',
                            priority: 'Medium',
                            status: 'To Do',
                            startDate: '',
                            endDate: '',
                            assignedTo: user?.id || '',
                            createdBy: user?.id || '',
                            category: '', // Changed from categoryId
                            comments: '',
                        });

                        setOpen(true);
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
            <TaskDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) {
                        setDialogMode('add');
                        setEditingTaskId(null);
                        setSubmitError(null); // Clear error when closing
                    }
                }}
                form={form}
                onInputChange={handleInputChange}
                onSubmit={dialogMode === 'add' ? handleAddTask : (e) => { e.preventDefault(); setOpen(false); }}
                onDeleteClick={handleDeleteTask}
                isSubmitting={isSubmitting}
                submitError={submitError}
                dialogMode={dialogMode}
                createdByUser={dialogMode === 'edit' ? tasks.find(t => t._id === editingTaskId)?.createdByUser : undefined}
                assignedToUser={dialogMode === 'edit' ? tasks.find(t => t._id === editingTaskId)?.assignedToUser : undefined}
                comments={dialogMode === 'edit' ? tasks.find(t => t._id === editingTaskId)?.comments : []}
                taskId={editingTaskId || undefined}
                onCommentAdded={fetchTasks}
            />
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spinner/>
                    Loading tasks...
                </div>
            ) : (
                <DataGrid
                    items={filteredTasks}
                    columns={columns}
                    style={{ marginTop: 24 }}
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
                                    onClick={() => handleRowClick(task)}
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

