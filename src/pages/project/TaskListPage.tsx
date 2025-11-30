import { Card, tokens } from '@fluentui/react-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProjectTasksDataGrid from '../../components/tables/ProjectTasksDataGrid';
import { mainLayoutStyles } from '../../components/styles/Styles';
import TaskDialog from '../../components/dialogs/TaskDialog';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import { tasksApi } from '../../components/apis/tasks';
import { projectsApi, type Project } from '../../components/apis/projects';
import { categoriesApi, type Category } from '../../components/apis/categories';
import type { Task } from '../../types/MyTasksTypes';

export default function TaskListPage() {
    const { projectName } = useParams<{ projectName: string }>();
    const titleSlug = projectName ? decodeURIComponent(projectName) : '';
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const s = mainLayoutStyles();
    const navigate = useNavigate();
    const { user } = useUser();

    // Dialog state + form state
    const [open, setOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: user?.id ? [user.id] : [] as string[],
        createdBy: user?.id || '',
        category: '',
        projectId: '',
        comments: '',
    });

    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    useEffect(() => {
        let active = true;
        const loadProject = async () => {
            setLoading(true);
            setError(null);
            try {
                const all = await projectsApi.getAllProjects();
                if (!active) return;
                const findSlug = (name: string) => encodeURIComponent(name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
                const matched = all.find(p => findSlug(p.projectName) === (titleSlug ? titleSlug.replace(/-/g, '-') : ''));
                if (matched) {
                    setProject(matched);
                    // Load categories for this project
                    if (matched.id) {
                        setIsLoadingCategories(true);
                        categoriesApi.getCategoriesByProject(matched.id)
                            .then(cats => { if (active) setCategories(cats); })
                            .catch(err => console.error('Failed to load categories:', err))
                            .finally(() => { if (active) setIsLoadingCategories(false); });
                    }
                } else {
                    setError('Project not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load project');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProject();
        return () => { active = false; };
    }, [titleSlug]);

    const onAddClick = () => {
        setDialogMode('add');
        setForm(prev => ({ ...prev, assignedTo: user?.id ? [user.id] : [], createdBy: user?.id || '', projectId: project?.id || '' }));
        setOpen(true);
        fetchAssignableUsers();
    };

    // Helper to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateValue: string | null | undefined): string => {
        if (!dateValue) return '';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const onRowClick = (task: Task) => {
        setDialogMode('edit');
        setEditingTaskId(task._id);
        setSelectedTask(task);
        setForm({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            status: task.status || 'To Do',
            startDate: formatDateForInput(task.startDate),
            endDate: formatDateForInput(task.endDate),
            assignedTo: task.assignedTo || [],
            createdBy: task.createdBy || '',
            category: task.category || task.categoryId || '',
            projectId: project?.id || '',
            comments: '',
        });
        setOpen(true);
        fetchAssignableUsers(task.assignedTo);
    };

    async function fetchAssignableUsers(assignedToIds?: string[]) {
        setIsLoadingAssignableUsers(true);
        try {
            let unique: User[] = [];

            if (project?.id) {
                try {
                    // Use the dedicated project members endpoint
                    const projectMembers = await projectsApi.getProjectMembers(project.id);
                    // Convert ProjectMember[] to User[] (they have compatible structures)
                    unique = projectMembers.map(member => ({
                        id: member.id,
                        userName: member.userName,
                        firstName: member.firstName,
                        middleName: member.middleName,
                        lastName: member.lastName,
                        email: member.email,
                        userIMG: member.userIMG,
                    } as User));
                } catch (projectErr) {
                    console.error('Failed to fetch project members:', projectErr);
                }
            }

            // If no project members were found, fetch all users as fallback
            if (unique.length === 0) {
                try {
                    const allUsers = await usersApi.getAllUsers();
                    unique = allUsers;
                } catch (usersErr) {
                    console.error('Failed to fetch all users:', usersErr);
                }
            }

            // Add current user if not already in the list
            if (user && !unique.some((u) => u.id === user.id)) unique.push(user);

            // Add any assigned users that might not be in the current member list (for existing tasks)
            if (assignedToIds && assignedToIds.length > 0) {
                const missingIds = assignedToIds.filter(id => !unique.some(u => u.id === id));
                if (missingIds.length > 0) {
                    const missingUsers = await Promise.all(missingIds.map(id => usersApi.getUserById(id).catch(() => null)));
                    missingUsers.forEach(u => {
                        if (u) unique.push(u);
                    });
                }
            }

            setAssignableUsers(unique);
        } catch (err) {
            console.error('Failed to fetch users for task creation:', err);
        } finally {
            setIsLoadingAssignableUsers(false);
        }
    } async function handleAddTask(e: React.FormEvent) {
        e.preventDefault();
        setForm(prev => ({ ...prev, projectId: project?.id || prev.projectId }));
        try {
            await tasksApi.createTask({
                category: form.category,
                projectId: project?.id || form.projectId,
                assignedTo: form.assignedTo,
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
                startDate: form.startDate,
                endDate: form.endDate,
                createdBy: user?.id || '',
                comments: form.comments,
            });
            setOpen(false);
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Failed to create task', err);
        }
    }

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingTaskId) return;
        try {
            await tasksApi.updateTask(editingTaskId, {
                category: form.category,
                projectId: project?.id || form.projectId,
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
        } catch (err) {
            console.error('Failed to update task', err);
        }
    }

    async function handleDeleteTask() {
        if (!editingTaskId) return;
        if (!confirm('Delete this task?')) return;
        try {
            await tasksApi.deleteTask(editingTaskId);
            setOpen(false);
            setEditingTaskId(null);
            setDialogMode('add');
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    }

    if (loading) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>Loading project...</div></Card>);
    if (error || !project) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>{error ?? 'Project not found'}</div></Card>);

    return (
        <Card className={`${s.artifCard} ${s.wFull} ${s.layoutPadding}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>{project.projectName} - Tasks</h1>
                <div>
                    <button onClick={() => navigate(`/home/project/${encodeURIComponent(project.projectName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))}/tasks`)} style={{ display: 'none' }}>refresh</button>
                </div>
            </div>

            <ProjectTasksDataGrid projectId={project.id} onAddClick={onAddClick} onRowClick={onRowClick} refreshSignal={refreshKey} />

            <TaskDialog
                open={open}
                onOpenChange={(v) => { setOpen(v); if (!v) { setDialogMode('add'); setEditingTaskId(null); setSelectedTask(null); } }}
                form={form}
                onInputChange={(e) => {
                    const { name, value } = e.target as unknown as { name: string; value: unknown };
                    setForm(prev => ({ ...prev, [name]: value }));
                }}
                onSubmit={dialogMode === 'add' ? handleAddTask : handleEditSubmit}
                onDeleteClick={handleDeleteTask}
                isSubmitting={false}
                submitError={null}
                dialogMode={dialogMode}
                createdByUser={selectedTask ? selectedTask.createdByUser : undefined}
                comments={selectedTask ? selectedTask.comments : []}
                taskId={editingTaskId || undefined}
                onAddComment={async (text) => { if (!editingTaskId || !user?.id) return; await tasksApi.addComment(editingTaskId, { authorId: user.id, text }); setRefreshKey(k => k + 1); }}
                isAddingComment={false}
                commentError={null}
                assignableUsers={assignableUsers}
                isLoadingAssignableUsers={isLoadingAssignableUsers}
                assignableUsersError={null}
                currentUser={user}
                projects={[project]}
                isLoadingProjects={false}
                projectsError={null}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                categoriesError={null}
                hideProjectField={true}
            />
        </Card>
    );
}
