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
import { tasksApi, type TaskResponse, type CreateTaskData } from '../apis/tasks';
import { projectsApi, type ProjectMember, type Project } from '../apis/projects';
import type { User } from '../apis/auth';

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
    const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] = useState(false);
    const [assignableUsersError, setAssignableUsersError] = useState<string | null>(null);
    const [editTaskOpen, setEditTaskOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isLoadingEditTask, setIsLoadingEditTask] = useState(false);
    const [editTaskError, setEditTaskError] = useState<string | null>(null);
    const [editProject, setEditProject] = useState<Project | null>(null);
    type EditFormType = CreateFormType & { categoryId?: string };
    const [editForm, setEditForm] = useState<EditFormType | null>(null);

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
        id: task.id || task._id || '',
        title: task.title,
        description: task.description,
        priority: task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) as Task['priority'] : undefined,
        status: task.status,
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
                console.log('📦 Raw Categories:', categories);
                console.log('📋 Raw Tasks:', tasks);
                setFetchedCategories(categories);

                // Direct mapping: for each category, find tasks where task.categoryId === category.id
                const columnsFromCategories: Column[] = categories.map(category => {
                    const columnTasks = tasks.filter(task => {
                        const match = task.categoryId === category.id;
                        console.log(`🔍 Task "${task.title}" (catId: ${task.categoryId}) → Category "${category.categoryName}" (id: ${category.id})? ${match}`);
                        return match;
                    }).map(mapTaskResponse);

                    console.log(`📊 Column "${category.categoryName}" has ${columnTasks.length} tasks`);

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

                const cols = [...columnsFromCategories];
                if (uncategorized.length) {
                    cols.push({ id: 'uncategorized', title: 'Uncategorized', tasks: uncategorized });
                }

                console.log('✅ Final columns with task counts:', cols.map(c => `${c.title}: ${c.tasks.length}`));
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

    const handleAddTask = async (columnId: string) => {
        console.log('Open create task for column:', columnId);
        const column = columns.find(c => c.id === columnId);

        setCreateForm(prev => ({
            ...prev,
            projectId: projectId || prev.projectId,
            createdBy: user?.id || prev.createdBy,
            category: column?.title || prev.category,
        }));

        if (projectId) {
            setIsLoadingAssignableUsers(true);
            setAssignableUsersError(null);
            try {
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
            } catch (err) {
                console.error('Failed to load project members', err);
                const message = (err as Error)?.message || 'Failed to load project members';
                setAssignableUsersError(message);
                setAssignableUsers([]);
            } finally {
                setIsLoadingAssignableUsers(false);
            }
        } else {
            setAssignableUsers([]);
        }

        setCreateTaskOpen(true);
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
                status: createForm.status,
                startDate: createForm.startDate,
                endDate: createForm.endDate,
                createdBy: createForm.createdBy,
                comments: createForm.comments || undefined,
                projectId: createForm.projectId || undefined,
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
            ) : (
                <div className={styles.kanbanBoard}>
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            onAddTask={handleAddTask}
                            onTaskClick={handleTaskClick}
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
                    }}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        // TODO: Implement edit task submission
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
                />
            )}
        </DndContext>
    );
}
