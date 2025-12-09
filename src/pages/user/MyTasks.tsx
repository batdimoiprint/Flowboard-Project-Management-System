import { Card, mergeClasses } from '@fluentui/react-components'
import MyTasksDataGrid from '../../components/tables/MyTasksDataGrid'
import { mainLayoutStyles } from '../../components/styles/Styles'
import TaskDialog from '../../components/dialogs/TaskDialog'
import { useUser } from '../../hooks/useUser'
import { subTasksApi, type UpdateSubTaskData } from '../../components/apis/subtasks'
import { projectsApi, type Project } from '../../components/apis/projects'
import { categoriesApi, type Category } from '../../components/apis/categories'
import { usersApi } from '../../components/apis/users'
import type { User } from '../../components/apis/auth'
import type { Task } from '../../types/MyTasksTypes'
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
        assignedTo: user?.id ? [user.id] : [] as string[],
        createdBy: user?.id || '',
        category: '',
        categoryId: '',
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isChangingCategory, setIsChangingCategory] = useState(false);

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
            assignedTo: user?.id ? [user.id] : [],
            createdBy: user?.id || '',
            category: '',
            categoryId: '',
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

        setForm({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'Medium',
            status: task.status || 'To Do',
            startDate: formatDateForInput(task.startDate),
            endDate: formatDateForInput(task.endDate),
            assignedTo: task.assignedTo || [],
            createdBy: task.createdBy || '',
            category: task.category || '',
            categoryId: task.categoryId || '',
            projectId: task.projectId || '',
            comments: '',
        });
        setOpen(true);
        // Pass the task's projectId directly since setForm is async and form.projectId won't be updated yet
        const taskProjectId = task.projectId || '';
        fetchAssignableUsers(task.assignedTo, taskProjectId);
        fetchProjects();
        // Fetch categories for the task's project immediately
        if (taskProjectId) {
            fetchCategoriesByProject(taskProjectId);
        }
    }

    async function fetchCategoriesByProject(projectId: string) {
        setIsLoadingCategories(true);
        try {
            const cats = await categoriesApi.getCategoriesByProject(projectId);
            setCategories(cats);
        } catch (err) {
            console.error('Failed to load categories:', err);
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    }

    async function fetchAssignableUsers(assignedToIds?: string[], taskProjectId?: string) {
        setIsLoadingAssignableUsers(true);
        setAssignableUsersError(null);
        try {
            let unique: User[] = [];

            // If a project is selected, fetch only project members
            // Use taskProjectId if provided (for edit mode), otherwise fall back to form.projectId
            const projectId = taskProjectId || form.projectId || selectedTask?.projectId;
            if (projectId) {
                try {
                    // Use the dedicated project members endpoint
                    const projectMembers = await projectsApi.getProjectMembers(projectId);
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
                    // Fall through to fetch all users
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

            // Ensure current user is included
            if (user && !unique.some(u => u.id === user.id)) unique.push(user);

            // Add any assigned users that might not be in the current member list (for existing tasks)
            const assignedTo = assignedToIds || (selectedTask && selectedTask.assignedTo);
            if (assignedTo && assignedTo.length > 0) {
                const missingIds = assignedTo.filter(id => !unique.some(u => u.id === id));
                if (missingIds.length > 0) {
                    const missingUsers = await Promise.all(missingIds.map(id => usersApi.getUserById(id).catch(() => null)));
                    missingUsers.forEach(u => { if (u) unique.push(u); });
                }
            }

            setAssignableUsers(unique);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unable to load users.';
            setAssignableUsersError(errorMessage);
        } finally {
            setIsLoadingAssignableUsers(false);
        }
    }

    async function handleFieldUpdate(fieldName: string, value: unknown) {
        if (!editingTaskId) return;

        // If the new value is empty, skip calling the backend to avoid 'No valid updatable fields provided.'
        if (value === '' || (Array.isArray(value) && value.length === 0)) return;

        try {
            // Build a safe typed payload for the patch API
            const updates: Partial<UpdateSubTaskData> = {};

            if (fieldName === 'title' && typeof value === 'string') {
                updates.title = value;
            } else if (fieldName === 'description' && typeof value === 'string') {
                updates.description = value;
            } else if (fieldName === 'priority' && typeof value === 'string') {
                updates.priority = value;
            } else if (fieldName === 'status' && typeof value === 'string') {
                updates.status = value;
            } else if (fieldName === 'categoryId' && typeof value === 'string') {
                updates.categoryId = value;
            } else if (fieldName === 'assignedTo' && Array.isArray(value)) {
                updates.assignedTo = value as string[];
            } else if (fieldName === 'startDate' && typeof value === 'string') {
                updates.startDate = value;
            } else if (fieldName === 'endDate' && typeof value === 'string') {
                updates.endDate = value;
            } else {
                // unsupported field — skip
                return;
            }

            await subTasksApi.patchSubTask(editingTaskId, updates);
            // refresh data grid
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Failed to patch subtask:', err);
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target as unknown as { name: string; value: unknown };
        setForm((prev) => {
            // Clear category when project changes
            if (name === 'projectId') {
                return { ...prev, projectId: typeof value === 'string' ? value : '', category: '' };
            }
            return { ...prev, [name]: value };
        });

        if (dialogMode === 'edit' && editingTaskId) {
            const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const isSelect = (target.tagName ?? '').toUpperCase() === 'SELECT';
            const isDate = 'type' in target && (target as HTMLInputElement).type === 'date';
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
                title: form.title,
                projectId: form.projectId,
                description: form.description,
                priority: form.priority,
                category: form.category,
                categoryId: form.categoryId,
                createdBy: user?.id || '',
                assignedTo: form.assignedTo.length > 0 ? form.assignedTo : (user?.id ? [user.id] : []),
                startDate: form.startDate,
                endDate: form.endDate,
            };
            await subTasksApi.createSubTask(taskData);
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
            await subTasksApi.updateSubTask(editingTaskId, {
                title: form.title,
                description: form.description,
                priority: form.priority,
                projectId: form.projectId,
                category: form.category,
                categoryId: form.categoryId,
                createdBy: form.createdBy,
                assignedTo: form.assignedTo,
                startDate: form.startDate,
                endDate: form.endDate,
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

    // Load categories when projectId changes (for add mode)
    useEffect(() => {
        if (form.projectId && dialogMode === 'add') {
            fetchCategoriesByProject(form.projectId);
        } else if (!form.projectId) {
            setCategories([]);
        }
    }, [form.projectId, dialogMode]);

    // When categories are loaded, try to match categoryId from category name if not set
    useEffect(() => {
        if (categories.length > 0 && form.category && !form.categoryId) {
            const matchedCategory = categories.find(c => c.categoryName === form.category);
            if (matchedCategory) {
                setForm(prev => ({ ...prev, categoryId: matchedCategory.id }));
            }
        }
    }, [categories, form.category, form.categoryId]);

    // Reload assignable users when project changes (only when dialog is open)
    useEffect(() => {
        if (open && dialogMode === 'add' && form.projectId) {
            fetchAssignableUsers(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.projectId, open, dialogMode]);

    async function handleDeleteTask() {
        if (!editingTaskId) return;
        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (!confirmDelete) return;
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await subTasksApi.deleteSubTask(editingTaskId);
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
            await subTasksApi.addComment(editingTaskId, { authorId: user.id, text });
            setRefreshKey(k => k + 1);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
            setCommentError(errorMessage);
        } finally {
            setIsAddingComment(false);
        }
    }

    async function handleCategoryChange(categoryId: string) {
        if (!editingTaskId) return;
        setIsChangingCategory(true);
        try {
            await subTasksApi.patchSubTask(editingTaskId, { categoryId });
            // Find the category name from the categories list
            const category = categories.find(c => c.id === categoryId);
            // Update the form with new category info
            setForm(prev => ({
                ...prev,
                categoryId: categoryId,
                category: category?.categoryName || ''
            }));
            setRefreshKey(k => k + 1);
        } catch (err: unknown) {
            console.error('Failed to change category:', err);
            setSubmitError(err instanceof Error ? err.message : 'Failed to change category');
        } finally {
            setIsChangingCategory(false);
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
            <div className={mergeClasses(s.flexColFill, s.hFull, s.wFull)} style={{ minHeight: '70vh' }}>
                <Card className={mergeClasses(s.componentBorder, s.flexColFill, s.hFull, s.wFull)} style={{ height: '100%', maxHeight: '100%' }}>
                    <MyTasksDataGrid onRowClick={handleRowClick} onAddClick={handleAddClick} refreshSignal={refreshKey} />
                </Card>
            </div>

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
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                categoriesError={null}
                hideProjectField={false}
                onCategoryChange={handleCategoryChange}
                isChangingCategory={isChangingCategory}
            />
        </>
    )
}
