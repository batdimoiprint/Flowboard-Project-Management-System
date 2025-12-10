import { useEffect, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { mainLayoutStyles } from '../styles/Styles';
import KanbanColumn, { type Column } from './KanbanColumn';
import KanbanCard, { type Task } from './KanbanCard';
import { useUser } from '../../hooks/useUser';
import { Button, Input } from '@fluentui/react-components';
import type { ChangeEvent } from 'react';
import { categoriesApi, type Category } from '../apis/categories';
import CreateTaskDialog from '../dialogs/CreateTaskDialog';
import EditTaskDialog from '../dialogs/EditTaskDialog';
import CreateMainTaskDialog from '../dialogs/CreateMainTaskDialog';
import { tasksApi, type TaskResponse, type CreateTaskData } from '../apis/tasks';
import { mainTasksApi } from '../apis/maintasks';
import { projectsApi, type ProjectMember, type Project } from '../apis/projects';
import type { User } from '../apis/auth';
import { subTasksApi, type UpdateSubTaskData } from '../apis/subtasks';

interface KanbanBoardProps {
    projectId?: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
    const styles = mainLayoutStyles();

    const [columns, setColumns] = useState<Column[]>([]);
    const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeFromColumn, setActiveFromColumn] = useState<string | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const [isLoadingAssignableUsers] = useState(false);
    const [assignableUsersError] = useState<string | null>(null);
    const [editTaskOpen, setEditTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isLoadingEditTask, setIsLoadingEditTask] = useState(false);
    const [editTaskError, setEditTaskError] = useState<string | null>(null);
    const [editProject, setEditProject] = useState<Project | null>(null);
    type EditFormType = CreateFormType & { categoryId?: string };
    const [editForm, setEditForm] = useState<EditFormType | null>(null);

    // MainTask dialog state
    const [createMainTaskOpen, setCreateMainTaskOpen] = useState(false);
    const [mainTaskForm, setMainTaskForm] = useState({ title: '', description: '' });
    const [isSubmittingMainTask, setIsSubmittingMainTask] = useState(false);
    const [mainTaskSubmitError, setMainTaskSubmitError] = useState<string | null>(null);

    type CreateFormType = {
        title: string;
        description: string;
        priority: string;
        status: string;
        startDate: string;
        endDate: string;
        assignedTo: string[];
        createdBy: string;
        category: string;
        projectId?: string | null;
        comments?: string | undefined;
    };

    const [createForm, setCreateForm] = useState<CreateFormType>({
        title: '',
        description: '',
        priority: 'Low',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: [] as string[],
        createdBy: '',
        category: '',
        projectId: projectId || '',
        comments: '' as string | undefined,
    });
    // Single user source
    const { user } = useUser();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const mapTaskResponse = (task: TaskResponse): Task => ({
        id: task.id || '',
        title: task.title,
        description: task.description,
        priority: task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) as Task['priority'] : undefined,
        status: 'To Do', // SubTasks don't have status, default to 'To Do'
        startDate: task.startDate,
        endDate: task.endDate,
        dueDate: task.endDate,
        assignee: task.assignedTo?.[0],
        assignedTo: task.assignedTo,
    });

    useEffect(() => {
        if (!projectId) {
            setColumns([]);
            return;
        }

        setLoading(true);
        setError(null);

        Promise.all([
            categoriesApi.getCategoriesByProject(projectId),
            tasksApi.getTasksByProject(projectId),
        ])
            .then(([categories, tasks]) => {

                setFetchedCategories(categories);

                // Direct mapping: for each category, find tasks where task.categoryId === category.id
                const columnsFromCategories: Column[] = categories.map(category => {
                    const columnTasks = tasks.filter(task => {
                        const match = task.categoryId === category.id;

                        return match;
                    }).map(mapTaskResponse);


                    return {
                        id: category.id,
                        title: category.categoryName,
                        tasks: columnTasks,
                    };
                });

                // Find uncategorized tasks (no categoryId)
                const uncategorized = tasks
                    .filter(t => !t.categoryId)
                    .map(mapTaskResponse);

                const cols = uncategorized.length
                    ? [{ id: 'uncategorized', title: 'Uncategorized', tasks: uncategorized }, ...columnsFromCategories]
                    : [...columnsFromCategories];

                setColumns(cols);
            })
            .catch((e: unknown) => {
                const message = (e as Error)?.message || 'Failed to load kanban data';
                console.error(message, e);
                setError(message);
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    const findColumn = (id: string) => {
        return columns.find(col => col.id === id);
    };

    const findTaskColumn = (taskId: string) => {
        return columns.find(col => col.tasks.some(task => task.id === taskId));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeColumn = findTaskColumn(active.id as string);
        const task = activeColumn?.tasks.find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
            setActiveFromColumn(activeColumn?.id || null);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeColumn = findTaskColumn(activeId);
        const overColumn = findColumn(overId) || findTaskColumn(overId);

        if (!activeColumn || !overColumn) return;
        if (activeColumn.id === overColumn.id) return;

        setColumns(cols => {
            const activeItems = activeColumn.tasks;
            const overItems = overColumn.tasks;

            const activeIndex = activeItems.findIndex(t => t.id === activeId);
            const overIndex = overItems.findIndex(t => t.id === overId);

            let newIndex: number;
            if (overId in cols.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})) {
                // Dropping over a column
                newIndex = overItems.length;
            } else {
                // Dropping over a task
                newIndex = overIndex >= 0 ? overIndex : overItems.length;
            }

            return cols.map(col => {
                if (col.id === activeColumn.id) {
                    return {
                        ...col,
                        tasks: col.tasks.filter(t => t.id !== activeId),
                    };
                }
                if (col.id === overColumn.id) {
                    const newTasks = [...col.tasks];
                    newTasks.splice(newIndex, 0, activeItems[activeIndex]);
                    return {
                        ...col,
                        tasks: newTasks,
                    };
                }
                return col;
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        setActiveFromColumn(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findTaskColumn(activeId);
        const overColumn = findTaskColumn(overId);

        if (!activeColumn || !overColumn) return;
        const activeIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
        const overIndex = overColumn.tasks.findIndex(t => t.id === overId);

        // Reorder within same column
        if (activeColumn.id === overColumn.id && activeIndex !== overIndex) {
            setColumns(cols =>
                cols.map(col => {
                    if (col.id === activeColumn.id) {
                        return {
                            ...col,
                            tasks: arrayMove(col.tasks, activeIndex, overIndex),
                        };
                    }
                    return col;
                })
            );
            return;
        }

        // Persist category change if dropped to a new column
        if (projectId && activeFromColumn && overColumn.id !== activeFromColumn) {
            console.log(`🔄 Task ${activeId} moved from column ${activeFromColumn} to ${overColumn.id}`);
            void tasksApi.patchTaskCategory(activeId, overColumn.id).catch(err => {
                console.error('Failed to update task category', err);
            });
        }
    };

    const handleAddTask = (columnId: string) => {
        // Open MainTask creation dialog
        const column = columns.find(c => c.id === columnId);
        setMainTaskForm({
            title: column?.title ? `${column.title} Task` : '',
            description: ''
        });
        setCreateMainTaskOpen(true);
    };

    const handleMainTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMainTaskForm(prev => ({ ...prev, [name]: value }));
    };

    const handleMainTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainTaskForm.title.trim()) return;

        setIsSubmittingMainTask(true);
        setMainTaskSubmitError(null);

        try {
            const newMainTask = await mainTasksApi.createMainTask({
                title: mainTaskForm.title,
                description: mainTaskForm.description,
                projectId: projectId
            });

            console.log('Created MainTask:', newMainTask);

            // Reset form and close dialog
            setMainTaskForm({ title: '', description: '' });
            setCreateMainTaskOpen(false);

            // TODO: Refresh the kanban board to show the new MainTask as a column
            // This would require restructuring the board to use MainTasks as columns
        } catch (error) {
            setMainTaskSubmitError((error as Error).message || 'Failed to create main task');
        } finally {
            setIsSubmittingMainTask(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCreateFormInput = (e: any) => {
        const { name, value } = e.target;
        // key ensures proper typing
        const key = name as keyof CreateFormType;
        const safeValue = Array.isArray(value) ? value : value;
        setCreateForm(prev => ({ ...prev, [key]: safeValue } as CreateFormType));
    };

    const handleCreateTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingTask(true);
            const payload: CreateTaskData = {
                assignedTo: createForm.assignedTo,
                title: createForm.title,
                description: createForm.description,
                priority: createForm.priority,
                startDate: createForm.startDate,
                endDate: createForm.endDate,
                createdBy: createForm.createdBy,
                projectId: (createForm.projectId && createForm.projectId !== '') ? createForm.projectId : projectId || '',
                category: createForm.category,
            };

            const created = await tasksApi.createTask(payload);
            // Map created task and add to column
            const newTask = mapTaskResponse(created as TaskResponse);
            setColumns(cols => {
                const targetIdx = cols.findIndex(c => c.id === (created.categoryId || created.category));
                if (targetIdx >= 0) {
                    const updated = [...cols];
                    updated[targetIdx] = { ...updated[targetIdx], tasks: [...updated[targetIdx].tasks, newTask] };
                    return updated;
                }
                // fallback: match by title
                const titleIdx = cols.findIndex(c => c.title === created.category || c.title === newTask.assignee);
                if (titleIdx >= 0) {
                    const updated = [...cols];
                    updated[titleIdx] = { ...updated[titleIdx], tasks: [...updated[titleIdx].tasks, newTask] };
                    return updated;
                }
                // If no matching category, push to uncategorized column or create it
                const unc = cols.find(c => c.id === 'uncategorized');
                if (unc) {
                    return cols.map(c => c.id === 'uncategorized' ? { ...c, tasks: [...c.tasks, newTask] } : c);
                }
                return [...cols, { id: 'uncategorized', title: 'Uncategorized', tasks: [newTask] }];
            });
        } catch (err) {
            console.error('Failed to create task', err);
            setError((err as Error)?.message || 'Failed to create task');
        } finally {
            setIsSubmittingTask(false);
            setCreateTaskOpen(false);
        }
    };

    const handleAddCategory = async () => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        const name = newCategoryName?.trim();
        if (!name) return;

        try {
            setLoading(true);
            const created = await categoriesApi.createCategory({
                projectId,
                categoryName: name,
                createdBy: user?.id || '',
            });

            setColumns(cols => [...cols, { id: created.id, title: created.categoryName, tasks: [] }]);
            setNewCategoryName('');
            setIsAddingColumn(false);
        } catch (e: unknown) {
            const msg = (e as Error)?.message || 'Failed to create category';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (categoryId: string, newTitle: string) => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        try {
            await categoriesApi.updateCategory(categoryId, {
                categoryName: newTitle,
                projectId,
                createdBy: user?.id || '',
            });

            // Update column title in state
            setColumns(cols => cols.map(col =>
                col.id === categoryId ? { ...col, title: newTitle } : col
            ));
        } catch (e: unknown) {
            const msg = (e as Error)?.message || 'Failed to update category';
            setError(msg);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        try {
            setLoading(true);
            await categoriesApi.deleteCategory(categoryId);

            // Remove column from state
            setColumns(cols => cols.filter(col => col.id !== categoryId));
        } catch (e: unknown) {
            const msg = (e as Error)?.message || 'Failed to delete category';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldUpdate = async (taskId: string, fieldName: string, value: unknown) => {
        if (!taskId) return;

        // If the new value is empty, skip calling the backend
        if (value === '' || (Array.isArray(value) && value.length === 0)) return;

        try {
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
                return;
            }

            await subTasksApi.patchSubTask(taskId, updates);

            // Update local state to reflect changes
            setColumns(cols => cols.map(col => ({
                ...col,
                tasks: col.tasks.map(t => {
                    if (t.id === taskId) {
                        return {
                            ...t,
                            ...(fieldName === 'title' && { title: value as string }),
                            ...(fieldName === 'description' && { description: value as string }),
                            ...(fieldName === 'priority' && { priority: value as Task['priority'] }),
                            ...(fieldName === 'status' && { status: value as string }),
                            ...(fieldName === 'assignedTo' && { assignedTo: value as string[] }),
                            ...(fieldName === 'startDate' && { startDate: value as string }),
                            ...(fieldName === 'endDate' && { endDate: value as string }),
                        };
                    }
                    return t;
                })
            })));

            // Update edit form if it's the currently selected task
            if (selectedTask?.id === taskId) {
                setEditForm(prev => prev ? { ...prev, [fieldName]: value } : prev);
            }
        } catch (err) {
            console.error('Failed to update task field:', err);
            setEditTaskError((err as Error)?.message || 'Failed to update task');
        }
    };

    const handleTaskClick = async (task: Task) => {
        console.log('Task clicked:', task);
        setSelectedTask(task);
        setIsLoadingEditTask(true);
        setEditTaskError(null);
        setEditProject(null);

        // Prefill edit form from task
        const taskColumn = findTaskColumn(task.id);
        setEditForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'Low',
            status: task.status || 'To Do',
            startDate: task.startDate || '',
            endDate: task.endDate || '',
            assignedTo: task.assignedTo || [],
            createdBy: user?.id || '',
            category: taskColumn?.title || '',
            categoryId: taskColumn?.id || undefined,
            projectId: projectId || '',
            comments: '',
        });

        try {
            // Fetch full task details and members if we have a project
            if (projectId) {
                const members = await projectsApi.getProjectMembers(projectId);
                const mappedUsers: User[] = members.map((member: ProjectMember) => ({
                    id: member.id,
                    userName: member.userName,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    middleName: member.middleName ?? '',
                    contactNumber: '',
                    birthDate: '',
                    userIMG: member.userIMG ?? null,
                    email: member.email,
                    createdAt: '',
                    secondaryContactNumber: null,
                }));
                setAssignableUsers(mappedUsers);

                // Fetch project details to show project name in edit dialog
                const project = await projectsApi.getProjectById(projectId);
                setEditProject(project);
            }
        } catch (err) {
            console.error('Failed to load task details', err);
            const message = (err as Error)?.message || 'Failed to load task details';
            setEditTaskError(message);
        } finally {
            setIsLoadingEditTask(false);
            setEditTaskOpen(true);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {error && (
                <div style={{ color: 'var(--colorPaletteRedForeground3)' }}>{error}</div>
            )}

            {loading ? (
                <div style={{ color: 'var(--colorNeutralForeground3)' }}>Loading kanban…</div>
            ) : columns.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    gap: '16px',
                    color: 'var(--colorNeutralForeground3)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '18px', fontWeight: 500 }}>
                        Nothing here yet
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        Get started by creating your first column
                    </div>
                    <Button appearance="primary" onClick={() => setIsAddingColumn(true)}>
                        + Create Column
                    </Button>
                    {isAddingColumn && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            width: '300px',
                            marginTop: '16px',
                            padding: '16px',
                            border: '1px solid var(--colorNeutralStroke1)',
                            borderRadius: '8px'
                        }}>
                            <Input
                                placeholder="Column name"
                                value={newCategoryName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <Button appearance="primary" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>Save</Button>
                                <Button appearance="subtle" onClick={() => { setIsAddingColumn(false); setNewCategoryName(''); }}>Cancel</Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.kanbanBoard}>
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            onAddTask={handleAddTask}
                            onTaskClick={handleTaskClick}
                            onDeleteColumn={handleDeleteCategory}
                            onUpdateColumn={handleUpdateCategory}
                        />
                    ))}
                    <div className={styles.kanbanAddColumn}>
                        {isAddingColumn ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <Input placeholder="Column name" value={newCategoryName} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <Button appearance="primary" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>Save</Button>
                                    <Button appearance="subtle" onClick={() => { setIsAddingColumn(false); setNewCategoryName(''); }}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <Button appearance="subtle" onClick={() => setIsAddingColumn(true)}>+ Add column</Button>
                        )}
                    </div>
                </div>
            )}

            <DragOverlay>
                {activeTask ? (
                    <div style={{ cursor: 'grabbing' }}>
                        <KanbanCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
            <CreateTaskDialog
                open={createTaskOpen}
                onOpenChange={(open) => setCreateTaskOpen(open)}
                form={createForm}
                onInputChange={handleCreateFormInput}
                onSubmit={handleCreateTaskSubmit}
                assignableUsers={assignableUsers}
                isLoadingAssignableUsers={isLoadingAssignableUsers}
                assignableUsersError={assignableUsersError}
                projects={[]}
                isLoadingProjects={false}
                categories={fetchedCategories}
                isLoadingCategories={loading}
                categoriesError={null}
                hideProjectField={false}
                currentUser={user}
                isSubmitting={isSubmittingTask}
                submitError={error}
            />
            {selectedTask && editForm && (
                <EditTaskDialog
                    open={editTaskOpen}
                    onOpenChange={setEditTaskOpen}
                    form={editForm}
                    onInputChange={(e) => {
                        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                        const key = name as keyof EditFormType;
                        setEditForm(prev => prev ? { ...prev, [key]: value } : prev);

                        // Immediately update for selects and dates
                        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                        const isSelect = target.tagName === 'SELECT';
                        const isDate = 'type' in target && (target as HTMLInputElement).type === 'date';

                        if (isSelect || isDate) {
                            handleFieldUpdate(selectedTask.id, name, value);
                        }
                    }}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setEditTaskOpen(false);
                    }}
                    assignableUsers={assignableUsers}
                    isLoadingAssignableUsers={isLoadingEditTask}
                    assignableUsersError={editTaskError}
                    projects={editProject ? [editProject] : projectId ? [{ id: projectId, projectName: projectId, description: '', teamMembers: [] }] : []}
                    currentUser={user}
                    categories={fetchedCategories}
                    isLoadingCategories={loading}
                    categoriesError={null}
                    taskId={selectedTask.id}
                    onCategoryChange={async (categoryId: string) => {
                        await handleFieldUpdate(selectedTask.id, 'categoryId', categoryId);
                        // Update category name in form
                        const category = fetchedCategories.find(c => c.id === categoryId);
                        if (category) {
                            setEditForm(prev => prev ? { ...prev, categoryId, category: category.categoryName } : prev);
                        }
                    }}
                />
            )}

            {/* MainTask Creation Dialog */}
            <CreateMainTaskDialog
                open={createMainTaskOpen}
                onOpenChange={setCreateMainTaskOpen}
                form={mainTaskForm}
                onInputChange={handleMainTaskInputChange}
                onSubmit={handleMainTaskSubmit}
                currentUser={user}
                isSubmitting={isSubmittingMainTask}
                submitError={mainTaskSubmitError}
                projectId={projectId}
            />
        </DndContext>
    );
}
