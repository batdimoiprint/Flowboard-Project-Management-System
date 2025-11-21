import { Card } from '@fluentui/react-components'
import MyTasksDataGrid from '../../components/tables/MyTasksDataGrid'
import { mainLayoutStyles } from '../../components/styles/Styles'
import TaskDialog from '../../components/dialogs/TaskDialog'
import { useUser } from '../../hooks/useUser'
import { tasksApi } from '../../components/apis/tasks'
import { projectsApi, type Project } from '../../components/apis/projects'
import { usersApi } from '../../components/apis/users'
import type { User } from '../../components/apis/auth'
import type { Task } from '../../types/MyTasksTypes'
import type { CreateTaskData } from '../../components/apis/tasks'
import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'


export default function MyTasks() {
    const s = mainLayoutStyles()
    const { user } = useUser();

    const [open, setOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: user?.id || '',
        createdBy: user?.id || '',
        category: '',
        projectId: '',
        comments: '',
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] = useState(false);
    const [assignableUsersError, setAssignableUsersError] = useState<string | null>(null);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);

    // Called by DataGrid when adding button clicked
    function handleAddClick() {
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
            projectId: '',
            comments: '',
        });
        setOpen(true);
        setSelectedTask(null);
        fetchAssignableUsers(undefined);
        fetchProjects();
    }

    // Called when DataGrid row is clicked
    function handleRowClick(task: Task) {
        setDialogMode('edit');
        setEditingTaskId(task._id);
        setSelectedTask(task);
        setForm({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            status: task.status || 'To Do',
            startDate: task.startDate || '',
            endDate: task.endDate || '',
            assignedTo: task.assignedTo || '',
            createdBy: task.createdBy || '',
            category: task.category || task.categoryId || '',
            projectId: (task as Task & { projectId?: string }).projectId || '',
            comments: '',
        });
        setOpen(true);
        fetchAssignableUsers(task.assignedTo);
        fetchProjects();
    }

    async function fetchAssignableUsers(assignedToId?: string) {
        setIsLoadingAssignableUsers(true);
        setAssignableUsersError(null);
        try {
            const fetched = await usersApi.getAllUsers();
            // Ensure current user and assignedTo user are included
            const unique = fetched.slice();
            if (user && !unique.some(u => u.id === user.id)) unique.push(user);
            const assignedTo = assignedToId || (selectedTask && selectedTask.assignedTo);
            if (assignedTo && !unique.some(u => u.id === assignedTo)) {
                const assigned = await usersApi.getUserById(assignedTo).catch(() => null);
                if (assigned) unique.push(assigned);
            }
            setAssignableUsers(unique);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unable to load users.';
            setAssignableUsersError(errorMessage);
        } finally {
            setIsLoadingAssignableUsers(false);
        }
    }

    async function handleFieldUpdate(fieldName: string, value: string) {
        if (!editingTaskId) return;

        // If the new value is empty, skip calling the backend to avoid 'No valid updatable fields provided.'
        if (value === '') return;

        try {
            await tasksApi.patchTask(editingTaskId, { [fieldName]: value } as Partial<CreateTaskData>);
            // refresh data grid
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Failed to patch task:', err);
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (dialogMode === 'edit' && editingTaskId) {
            const isSelect = e.target.tagName === 'SELECT';
            const isDate = (e.target as HTMLInputElement).type === 'date';
            if (isSelect || isDate) {
                handleFieldUpdate(name, value);
            } else {
                if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = setTimeout(() => {
                    handleFieldUpdate(name, value);
                }, 800);
            }
        }
    }

    async function handleAddTask(e: FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const taskData = {
                category: form.category,
                projectId: form.projectId,
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
            await tasksApi.createTask(taskData);
            setOpen(false);
            setRefreshKey(k => k + 1);
        } catch (error: unknown) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleEditSubmit(e: FormEvent) {
        e.preventDefault();
        if (!editingTaskId) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await tasksApi.updateTask(editingTaskId, {
                category: form.category,
                projectId: form.projectId,
                assignedTo: form.assignedTo,
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
                startDate: form.startDate,
                endDate: form.endDate,
                createdBy: form.createdBy,
                comments: form.comments,
            });
            setOpen(false);
            setEditingTaskId(null);
            setDialogMode('add');
            setRefreshKey(k => k + 1);
        } catch (error: unknown) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to update task');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function fetchProjects() {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
            const fetched = await projectsApi.getProjectsForSelect();
            const normalized = fetched.map(p => ({ ...p, id: p.id || (p as Project & { _id?: string })._id || p.id }));
            setProjects(normalized);
        } catch (err: unknown) {
            setProjectsError(err instanceof Error ? err.message : 'Unable to load projects.');
        } finally {
            setIsLoadingProjects(false);
        }
    }

    // Preload projects on mount for faster dropdown display
    useEffect(() => {
        fetchProjects();
    }, [user?.id]);

    async function handleDeleteTask() {
        if (!editingTaskId) return;
        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (!confirmDelete) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await tasksApi.deleteTask(editingTaskId);
            setOpen(false);
            setEditingTaskId(null);
            setDialogMode('add');
            setRefreshKey(k => k + 1);
        } catch (error: unknown) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to delete task');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleAddComment(text: string) {
        if (!editingTaskId || !user?.id) return;
        setIsAddingComment(true);
        setCommentError(null);
        try {
            await tasksApi.addComment(editingTaskId, { authorId: user.id, text });
            setRefreshKey(k => k + 1);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
            setCommentError(errorMessage);
        } finally {
            setIsAddingComment(false);
        }
    }

    function onDialogClose(v: boolean) {
        setOpen(v);
        if (!v) {
            setDialogMode('add');
            setEditingTaskId(null);
            setSubmitError(null);
            setSelectedTask(null);
        }
    }

    return (
        <>
            <Card className={s.componentBorder}>
                <MyTasksDataGrid onRowClick={handleRowClick} onAddClick={handleAddClick} refreshSignal={refreshKey} />
            </Card>

            <TaskDialog
                open={open}
                onOpenChange={(v) => onDialogClose(v)}
                form={form}
                onInputChange={handleInputChange}
                onSubmit={dialogMode === 'add' ? handleAddTask : handleEditSubmit}
                onDeleteClick={handleDeleteTask}
                isSubmitting={isSubmitting}
                submitError={submitError}
                dialogMode={dialogMode}
                createdByUser={selectedTask ? selectedTask.createdByUser : undefined}
                comments={selectedTask ? selectedTask.comments : []}
                taskId={editingTaskId || undefined}
                onAddComment={handleAddComment}
                isAddingComment={isAddingComment}
                commentError={commentError}
                assignableUsers={assignableUsers}
                isLoadingAssignableUsers={isLoadingAssignableUsers}
                assignableUsersError={assignableUsersError}
                currentUser={user}
                projects={projects}
                isLoadingProjects={isLoadingProjects}
                projectsError={projectsError}
            />
        </>
    )
}
