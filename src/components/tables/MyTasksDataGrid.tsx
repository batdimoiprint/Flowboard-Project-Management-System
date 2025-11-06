
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
} from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import { useMyTasksDataGridStyles } from '../styles/Styles';
import { Button, Input } from '@fluentui/react-components';
import TaskDialog from '../dialogs/TaskDialog';
import type { Task } from '../../types/MyTasksTypes';
import { TaskListSquarePerson24Regular } from "@fluentui/react-icons";
import { tasksApi } from '../apis/tasks';
import { useUser } from '../../context/userContext';

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
        renderCell: (item) => item.status,
    }),
    createTableColumn<Task>({
        columnId: 'priority',
        renderHeaderCell: () => 'Priority',
        renderCell: (item) => item.priority,
    }),
    createTableColumn<Task>({
        columnId: 'createdBy',
        renderHeaderCell: () => 'Created By',
        renderCell: (item) => item.createdBy,
    }),
    createTableColumn<Task>({
        columnId: 'assignedTo',
        renderHeaderCell: () => 'Assigned To',
        renderCell: (item) => item.assignedTo,
    }),
    createTableColumn<Task>({
        columnId: 'createdAt',
        renderHeaderCell: () => 'Created At',
        renderCell: (item) => item.createdAt,
    }),
    createTableColumn<Task>({
        columnId: 'endDate',
        renderHeaderCell: () => 'Due Date',
        renderCell: (item) => item.endDate,
    }),

];

function MyTasksDataGrid() {
    const { user } = useUser();
    const styles = useMyTasksDataGridStyles();
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
            const fetchedTasks = await tasksApi.getTasks();
            console.log('Fetched tasks from API:', fetchedTasks);
            console.log('First task sample:', fetchedTasks[0]);

            // Transform API response to match local Task type
            const transformedTasks: Task[] = fetchedTasks.map(task => {
                console.log('Transforming task:', task);
                console.log('Task _id:', task._id);

                // Handle both _id and id from API
                const taskId = task._id || (task as any).id;
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
                        text: c.text,
                        createdAt: c.createdAt
                    })),
                };
            });
            console.log('Transformed tasks:', transformedTasks);
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
            const updates: any = {};
            updates[fieldName] = value;

            // Call PATCH API to update just this field
            console.log('Sending PATCH request with:', updates);
            const updatedTask = await tasksApi.patchTask(editingTaskId, updates);
            console.log('PATCH response:', updatedTask);

            // Refresh tasks from server to get the latest data
            await fetchTasks();

            console.log('Tasks refreshed after PATCH');
        } catch (error: any) {
            console.error('Failed to update task field:', error);
            setSubmitError(error.response?.data?.message || error.message || 'Failed to update task');
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
                assignedTo: user?.id || '',
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
            const createdTask = await tasksApi.createTask(taskData);

            // Transform API response to match local Task type
            const newTask: Task = {
                _id: createdTask._id,
                category: createdTask.category,
                categoryId: createdTask.category, // Map category to categoryId for backward compatibility
                assignedTo: createdTask.assignedTo,
                title: createdTask.title,
                description: createdTask.description,
                priority: createdTask.priority,
                status: createdTask.status,
                startDate: createdTask.startDate,
                endDate: createdTask.endDate,
                createdBy: createdTask.createdBy,
                createdAt: createdTask.createdAt,
                comments: createdTask.comments.map(c => ({
                    authorId: c.authorId,
                    user: c.authorId, // Map authorId to user for backward compatibility
                    text: c.text,
                    createdAt: c.createdAt
                })),
            };

            // Add to local state
            setTasks((prev) => [newTask, ...prev]);

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
        } catch (error: any) {
            setSubmitError(error.response?.data?.message || error.message || 'Failed to create task');
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
        } catch (error: any) {
            console.error('Delete error:', error);
            setSubmitError(error.response?.data?.message || error.message || 'Failed to delete task');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleRowClick(task: Task) {
        console.log('handleRowClick called with task:', task);
        console.log('Task ID:', task._id);

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
            comments: Array.isArray(task.comments) && task.comments.length > 0 ? task.comments.map(c => c.text).join('\n') : '',
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
            <div className={styles.headerRow}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <TaskListSquarePerson24Regular />
                    <h2 className={styles.title}>My Tasks</h2>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
            />
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
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

