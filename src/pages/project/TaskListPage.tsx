import { Card, tokens, mergeClasses, DataGrid, DataGridHeader, DataGridRow, DataGridHeaderCell, DataGridBody, DataGridCell, TableCellLayout, createTableColumn, Button, Spinner, TabList, Tab } from '@fluentui/react-components';
import type { TableColumnDefinition, SelectTabEvent, SelectTabData } from '@fluentui/react-components';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import { projectsApi, type Project } from '../../components/apis/projects';
import { categoriesApi, type Category } from '../../components/apis/categories';
import { mainTasksApi, type MainTaskResponse } from '../../components/apis/maintasks';
import { subTasksApi, type SubTaskResponse } from '../../components/apis/subtasks';
import CreateMainTaskDialog from '../../components/dialogs/CreateMainTaskDialog';
import EditMainTaskDialog from '../../components/dialogs/EditMainTaskDialog';
import EditTaskDialog from '../../components/dialogs/EditTaskDialog';
import { Add24Regular } from '@fluentui/react-icons';

export default function TaskListPage() {
    const { projectName } = useParams<{ projectName: string }>();
    const titleSlug = projectName ? decodeURIComponent(projectName) : '';
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const s = mainLayoutStyles();
    const { user } = useUser();

    // Filter state
    const [activeTab, setActiveTab] = useState<'mainTasks' | 'subTasks'>('mainTasks');

    // MainTask state
    const [mainTasks, setMainTasks] = useState<MainTaskResponse[]>([]);
    const [loadingMainTasks, setLoadingMainTasks] = useState(true);
    const [subTaskCounts, setSubTaskCounts] = useState<Record<string, number>>({});

    // SubTask state
    const [subTasks, setSubTasks] = useState<SubTaskResponse[]>([]);
    const [loadingSubTasks, setLoadingSubTasks] = useState(false);

    // Dialog state
    const [createMainTaskOpen, setCreateMainTaskOpen] = useState(false);
    const [editMainTaskOpen, setEditMainTaskOpen] = useState(false);
    const [selectedMainTask, setSelectedMainTask] = useState<MainTaskResponse | null>(null);
    const [mainTaskForm, setMainTaskForm] = useState({ title: '', description: '' });
    const [isSubmittingMainTask, setIsSubmittingMainTask] = useState(false);

    // SubTask dialog state
    const [editSubTaskOpen, setEditSubTaskOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<SubTaskResponse | null>(null);
    const [subTaskForm, setSubTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Low',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: [] as string[],
        createdBy: '',
        category: '',
        categoryId: '',
        projectId: ''
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
                    // Load categories and users for this project
                    if (matched.id) {
                        setIsLoadingCategories(true);
                        categoriesApi.getCategoriesByProject(matched.id)
                            .then(cats => { if (active) setCategories(cats); })
                            .catch(err => console.error('Failed to load categories:', err))
                            .finally(() => { if (active) setIsLoadingCategories(false); });

                        fetchAssignableUsers();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleSlug]);

    useEffect(() => {
        if (project?.id) {
            loadMainTasks();
            if (activeTab === 'subTasks') {
                loadSubTasks();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, activeTab]);

    const loadMainTasks = async () => {
        if (!project?.id) return;
        try {
            setLoadingMainTasks(true);
            const tasks = await mainTasksApi.getMainTasks();
            setMainTasks(tasks);

            // Load SubTask counts for each MainTask
            const counts: Record<string, number> = {};
            await Promise.all(
                tasks.map(async (task) => {
                    try {
                        const subTasks = await mainTasksApi.getSubTasksForMainTask(task.id);
                        counts[task.id] = subTasks.length;
                    } catch {
                        counts[task.id] = 0;
                    }
                })
            );
            setSubTaskCounts(counts);
        } catch (err) {
            console.error('Failed to load main tasks:', err);
        } finally {
            setLoadingMainTasks(false);
        }
    };

    const loadSubTasks = async () => {
        if (!project?.id) return;
        try {
            setLoadingSubTasks(true);
            const tasks = await subTasksApi.getSubTasksByProject(project.id);
            setSubTasks(tasks);
        } catch (err) {
            console.error('Failed to load subtasks:', err);
        } finally {
            setLoadingSubTasks(false);
        }
    };

    const handleAddMainTask = () => {
        setMainTaskForm({ title: '', description: '' });
        setCreateMainTaskOpen(true);
    };

    const handleMainTaskRowClick = (mainTask: MainTaskResponse) => {
        setSelectedMainTask(mainTask);
        setMainTaskForm({
            title: mainTask.title,
            description: mainTask.description || ''
        });
        setEditMainTaskOpen(true);
    };

    const handleSubTaskRowClick = (subTask: SubTaskResponse) => {
        setSelectedSubTask(subTask);
        setSubTaskForm({
            title: subTask.title || '',
            description: subTask.description || '',
            priority: subTask.priority || 'Low',
            status: 'To Do',
            startDate: subTask.startDate ? new Date(subTask.startDate).toISOString().split('T')[0] : '',
            endDate: subTask.endDate ? new Date(subTask.endDate).toISOString().split('T')[0] : '',
            assignedTo: subTask.assignedTo || [],
            createdBy: subTask.createdBy || '',
            category: subTask.category || '',
            categoryId: subTask.categoryId || '',
            projectId: subTask.projectId
        });
        setEditSubTaskOpen(true);
    };

    const handleMainTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainTaskForm.title.trim()) return;

        try {
            setIsSubmittingMainTask(true);
            await mainTasksApi.createMainTask({
                title: mainTaskForm.title,
                description: mainTaskForm.description,
            });
            setCreateMainTaskOpen(false);
            setMainTaskForm({ title: '', description: '' });
            loadMainTasks();
        } catch (err) {
            console.error('Failed to create main task:', err);
        } finally {
            setIsSubmittingMainTask(false);
        }
    };

    async function fetchAssignableUsers() {
        setIsLoadingAssignableUsers(true);
        try {
            let unique: User[] = [];

            if (project?.id) {
                try {
                    const projectMembers = await projectsApi.getProjectMembers(project.id);
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

            if (unique.length === 0) {
                try {
                    const allUsers = await usersApi.getAllUsers();
                    unique = allUsers;
                } catch (usersErr) {
                    console.error('Failed to fetch all users:', usersErr);
                }
            }

            if (user && !unique.some((u) => u.id === user.id)) unique.push(user);
            setAssignableUsers(unique);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoadingAssignableUsers(false);
        }
    }

    // DataGrid columns for MainTasks
    const mainTaskColumns: TableColumnDefinition<MainTaskResponse>[] = [
        createTableColumn<MainTaskResponse>({
            columnId: 'title',
            compare: (a, b) => a.title.localeCompare(b.title),
            renderHeaderCell: () => 'Title',
            renderCell: (item) => <TableCellLayout>{item.title}</TableCellLayout>,
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'description',
            renderHeaderCell: () => 'Description',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '-'}
                </TableCellLayout>
            ),
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'subTasks',
            renderHeaderCell: () => 'SubTasks',
            renderCell: (item) => (
                <TableCellLayout>{subTaskCounts[item.id] || 0}</TableCellLayout>
            ),
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'createdAt',
            compare: (a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'Created',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                </TableCellLayout>
            ),
        }),
    ];

    // DataGrid columns for SubTasks
    const subTaskColumns: TableColumnDefinition<SubTaskResponse>[] = [
        createTableColumn<SubTaskResponse>({
            columnId: 'title',
            compare: (a, b) => (a.title || '').localeCompare(b.title || ''),
            renderHeaderCell: () => 'Title',
            renderCell: (item) => <TableCellLayout>{item.title || '-'}</TableCellLayout>,
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'description',
            renderHeaderCell: () => 'Description',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '-'}
                </TableCellLayout>
            ),
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'priority',
            compare: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
            renderHeaderCell: () => 'Priority',
            renderCell: (item) => <TableCellLayout>{item.priority || '-'}</TableCellLayout>,
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'category',
            renderHeaderCell: () => 'Category',
            renderCell: (item) => <TableCellLayout>{item.category || '-'}</TableCellLayout>,
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'assignedTo',
            renderHeaderCell: () => 'Assigned',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.assignedTo && item.assignedTo.length > 0
                        ? `${item.assignedTo.length} member${item.assignedTo.length !== 1 ? 's' : ''}`
                        : '-'}
                </TableCellLayout>
            ),
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'createdAt',
            compare: (a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'Created',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                </TableCellLayout>
            ),
        }),
    ];

    if (loading) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>Loading project...</div></Card>);
    if (error || !project) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>{error ?? 'Project not found'}</div></Card>);

    return (
        <Card className={mergeClasses(s.artifCard, s.wFull, s.layoutPadding)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalL }}>
                <h1 style={{ margin: 0 }}>{project.projectName} - Tasks</h1>
                {activeTab === 'mainTasks' && (
                    <Button
                        appearance="primary"
                        icon={<Add24Regular />}
                        onClick={handleAddMainTask}
                    >
                        Add Main Task
                    </Button>
                )}
            </div>

            <TabList
                selectedValue={activeTab}
                onTabSelect={(_: SelectTabEvent, data: SelectTabData) => {
                    setActiveTab(data.value as 'mainTasks' | 'subTasks');
                }}
                style={{ marginBottom: tokens.spacingVerticalL }}
            >
                <Tab value="mainTasks">Main Tasks</Tab>
                <Tab value="subTasks">SubTasks</Tab>
            </TabList>

            {activeTab === 'mainTasks' ? (
                loadingMainTasks ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
                        <Spinner label="Loading main tasks..." />
                    </div>
                ) : mainTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL, color: tokens.colorNeutralForeground3 }}>
                        No main tasks yet. Create one to get started!
                    </div>
                ) : (
                    <DataGrid
                        items={mainTasks}
                        columns={mainTaskColumns}
                        sortable
                        size="small"
                        style={{ minWidth: '100%' }}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody<MainTaskResponse>>
                            {({ item, rowId }) => (
                                <DataGridRow<MainTaskResponse>
                                    key={rowId}
                                    onClick={() => handleMainTaskRowClick(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {({ renderCell }) => (
                                        <DataGridCell>{renderCell(item)}</DataGridCell>
                                    )}
                                </DataGridRow>
                            )}
                        </DataGridBody>
                    </DataGrid>
                )
            ) : (
                loadingSubTasks ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
                        <Spinner label="Loading subtasks..." />
                    </div>
                ) : subTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL, color: tokens.colorNeutralForeground3 }}>
                        No subtasks in this project yet.
                    </div>
                ) : (
                    <DataGrid
                        items={subTasks}
                        columns={subTaskColumns}
                        sortable
                        size="small"
                        style={{ minWidth: '100%' }}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody<SubTaskResponse>>
                            {({ item, rowId }) => (
                                <DataGridRow<SubTaskResponse>
                                    key={rowId}
                                    onClick={() => handleSubTaskRowClick(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {({ renderCell }) => (
                                        <DataGridCell>{renderCell(item)}</DataGridCell>
                                    )}
                                </DataGridRow>
                            )}
                        </DataGridBody>
                    </DataGrid>
                )
            )}

            <CreateMainTaskDialog
                open={createMainTaskOpen}
                onOpenChange={setCreateMainTaskOpen}
                form={mainTaskForm}
                onInputChange={(e) => {
                    const { name, value } = e.target;
                    setMainTaskForm(prev => ({ ...prev, [name]: value }));
                }}
                onSubmit={handleMainTaskSubmit}
                isSubmitting={isSubmittingMainTask}
                submitError={null}
                currentUser={user}
                projectId={project.id}
                assignableUsers={assignableUsers}
                isLoadingAssignableUsers={isLoadingAssignableUsers}
                assignableUsersError={null}
                projects={[project]}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                onSubTaskCreated={loadMainTasks}
            />

            {selectedMainTask && (
                <EditMainTaskDialog
                    open={editMainTaskOpen}
                    onOpenChange={setEditMainTaskOpen}
                    form={mainTaskForm}
                    onInputChange={(e) => {
                        const { name, value } = e.target;
                        setMainTaskForm(prev => ({ ...prev, [name]: value }));
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                    }}
                    onDeleteClick={async () => {
                        if (!confirm('Delete this main task and all its subtasks?')) return;
                        try {
                            await mainTasksApi.deleteMainTask(selectedMainTask.id);
                            setEditMainTaskOpen(false);
                            loadMainTasks();
                        } catch (err) {
                            console.error('Failed to delete main task:', err);
                        }
                    }}
                    currentUser={user}
                    mainTaskId={selectedMainTask.id}
                    createdAt={selectedMainTask.createdAt}
                    subTaskIds={selectedMainTask.subTaskIds}
                    projectId={project.id}
                    onSubTaskClick={(subTask) => {
                        console.log('SubTask clicked:', subTask);
                    }}
                    assignableUsers={assignableUsers}
                    isLoadingAssignableUsers={isLoadingAssignableUsers}
                    assignableUsersError={null}
                    projects={[project]}
                    categories={categories}
                    isLoadingCategories={isLoadingCategories}
                    onSubTaskCreated={() => {
                        loadMainTasks();
                        if (activeTab === 'subTasks') loadSubTasks();
                    }}
                />
            )}

            {selectedSubTask && (
                <EditTaskDialog
                    open={editSubTaskOpen}
                    onOpenChange={setEditSubTaskOpen}
                    form={subTaskForm}
                    onInputChange={(e) => {
                        const { name, value } = e.target;
                        setSubTaskForm(prev => ({ ...prev, [name]: value }));
                    }}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.updateSubTask(selectedSubTask.id, {
                                title: subTaskForm.title,
                                description: subTaskForm.description,
                                priority: subTaskForm.priority,
                                projectId: subTaskForm.projectId,
                                mainTaskId: selectedSubTask.mainTaskId,
                                category: subTaskForm.category,
                                categoryId: subTaskForm.categoryId,
                                createdBy: subTaskForm.createdBy,
                                assignedTo: subTaskForm.assignedTo,
                                startDate: subTaskForm.startDate,
                                endDate: subTaskForm.endDate,
                            });
                            setEditSubTaskOpen(false);
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update subtask:', err);
                        }
                    }}
                    onDeleteClick={async () => {
                        if (!selectedSubTask?.id) return;
                        if (!confirm('Delete this subtask?')) return;
                        try {
                            await subTasksApi.deleteSubTask(selectedSubTask.id);
                            setEditSubTaskOpen(false);
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to delete subtask:', err);
                        }
                    }}
                    assignableUsers={assignableUsers}
                    isLoadingAssignableUsers={isLoadingAssignableUsers}
                    projects={[project]}
                    currentUser={user}
                    categories={categories}
                    isLoadingCategories={isLoadingCategories}
                    taskId={selectedSubTask.id}
                    comments={selectedSubTask.comments?.map(c => ({
                        authorId: c.authorId,
                        content: c.content,
                        createdAt: c.createdAt
                    })) || []}
                    onAddComment={async (text: string) => {
                        if (!selectedSubTask?.id || !user?.id) return;
                        try {
                            await subTasksApi.addComment(selectedSubTask.id, {
                                authorId: user.id,
                                text: text
                            });
                            const updated = await subTasksApi.getSubTaskById(selectedSubTask.id);
                            setSelectedSubTask(updated);
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to add comment:', err);
                            throw err;
                        }
                    }}
                    onCategoryChange={async (categoryId: string) => {
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { categoryId });
                            const category = categories.find(c => c.id === categoryId);
                            setSubTaskForm(prev => ({
                                ...prev,
                                categoryId: categoryId,
                                category: category?.categoryName || ''
                            }));
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to change category:', err);
                        }
                    }}
                />
            )}
        </Card>
    );
}
