import { Card, tokens, mergeClasses, DataGrid, DataGridHeader, DataGridRow, DataGridHeaderCell, DataGridBody, DataGridCell, createTableColumn, Button, Spinner, TabList, Tab, Avatar, Badge, makeStyles, Dropdown, Option, Input } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import type { TableColumnDefinition, SelectTabEvent, SelectTabData } from '@fluentui/react-components';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { useUser } from '../../hooks/useUser';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import { projectsApi, type Project } from '../../components/apis/projects';
import { categoriesApi, type Category } from '../../components/apis/categories';
import { mainTasksApi, type MainTaskResponse } from '../../components/apis/maintasks';
import { subTasksApi, type SubTaskResponse } from '../../components/apis/subtasks';
import CreateMainTaskDialog from '../../components/dialogs/CreateMainTaskDialog';
import CreateTaskDialog from '../../components/dialogs/CreateTaskDialog';
import EditTaskDialog from '../../components/dialogs/EditTaskDialog';
import { Add24Regular } from '@fluentui/react-icons';


const useGridStyles = makeStyles({
    grid: {
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    headerCell: {
        backgroundColor: tokens.colorNeutralBackground2,
        color: tokens.colorNeutralForeground1,
        fontWeight: tokens.fontWeightSemibold,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        letterSpacing: '0.01em',
    },
    cell: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    },
});

const priorityPillStyles: Record<string, { bg: string; color: string; border: string }> = {
    Important: {
        bg: tokens.colorPaletteRedBackground3,
        color: tokens.colorPaletteRedForeground2,
        border: tokens.colorPaletteRedBorderActive,
    },
    Medium: {
        bg: tokens.colorPaletteGoldBackground2,
        color: tokens.colorPaletteGoldForeground2,
        border: tokens.colorPaletteGoldBorderActive,
    },
    Low: {
        bg: tokens.colorPaletteTealBackground2,
        color: tokens.colorPaletteTealForeground2,
        border: tokens.colorPaletteTealBorderActive,
    },
};

const getPillColors = (value: string, map: Record<string, { bg: string; color: string; border: string }>) => {
    const fallback = {
        bg: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground2,
        border: tokens.colorNeutralStroke2,
    };
    return map[value] ?? fallback;
};

// Helper to convert Date to YYYY-MM-DD string using local timezone
function formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function TaskListPage() {
    const { projectName } = useParams<{ projectName: string }>();
    const titleSlug = projectName ? decodeURIComponent(projectName) : '';
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const s = mainLayoutStyles();
    const gridStyles = useGridStyles();
    const { user } = useUser();

    // Filter state
    const [activeTab, setActiveTab] = useState<'mainTasks' | 'subTasks'>('mainTasks');

    // MainTask state
    const [mainTasks, setMainTasks] = useState<MainTaskResponse[]>([]);
    const [loadingMainTasks, setLoadingMainTasks] = useState(true);
    const [subTaskCounts, setSubTaskCounts] = useState<Record<string, number>>({});

    // SubTask state
    const [loadingSubTasks, setLoadingSubTasks] = useState(false);
    const [subTasksWithUsers, setSubTasksWithUsers] = useState<(SubTaskResponse & { assignedToUsers?: User[] })[]>([]);

    // SubTask filters (status, priority, category, mainTask)
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const [filterPriority, setFilterPriority] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string[]>([]);
    const [filterMainTaskId, setFilterMainTaskId] = useState<string | null>(null);

    // Dialog state
    const [createMainTaskOpen, setCreateMainTaskOpen] = useState(false);
    const [selectedMainTask, setSelectedMainTask] = useState<MainTaskResponse | null>(null);
    const [mainTaskForm, setMainTaskForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
    const [isSubmittingMainTask, setIsSubmittingMainTask] = useState(false);

    // SubTask dialog state
    const [editSubTaskOpen, setEditSubTaskOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<SubTaskResponse | null>(null);
    type SubTaskFormType = {
        title: string;
        description: string;
        priority: string;
        status: string;
        startDate: string;
        endDate: string;
        assignedTo: string[];
        createdBy: string;
        category: string;
        categoryId: string;
        projectId: string;
        mainTaskId: string;
    };

    const [subTaskForm, setSubTaskForm] = useState<SubTaskFormType>({
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
        projectId: '',
        mainTaskId: ''
    });
    const [createSubTaskOpen, setCreateSubTaskOpen] = useState(false);
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false);
    const [subTaskSubmitError, setSubTaskSubmitError] = useState<string | null>(null);

    const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
    const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Debounce timeouts for title and description
    const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const descriptionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mainTaskDescDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Inline edit state for main task description
    const [isEditingMainTaskDesc, setIsEditingMainTaskDesc] = useState(false);
    const mainTaskDescInputRef = useRef<HTMLInputElement | null>(null);

    // Main task editing state
    const [mainTaskDescValue, setMainTaskDescValue] = useState('');
    const [mainTaskStartDate, setMainTaskStartDate] = useState<string | null>(null);
    const [mainTaskEndDate, setMainTaskEndDate] = useState<string | null>(null);

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
                    console.log('Project matched:', matched, 'ID:', matched.id);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleSlug]);

    // Fetch assignable users when project is loaded
    useEffect(() => {
        if (project?.id) {
            console.log('Project state updated, fetching assignable users with ID:', project.id);
            fetchAssignableUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.id]);

    useEffect(() => {
        if (project?.id) {
            loadMainTasks();
            if (activeTab === 'subTasks') {
                loadSubTasks();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, activeTab]);

    // Update selectedMainTask when filterMainTaskId changes
    useEffect(() => {
        if (filterMainTaskId) {
            const task = mainTasks.find(t => t.id === filterMainTaskId);
            if (task) {
                setSelectedMainTask(task);
                setMainTaskDescValue(task.description || '');
                // Convert dates to YYYY-MM-DD format for DatePicker
                setMainTaskStartDate(task.startDate ? formatDateToString(new Date(task.startDate)) : null);
                setMainTaskEndDate(task.endDate ? formatDateToString(new Date(task.endDate)) : null);
            }
        } else {
            setSelectedMainTask(null);
            setMainTaskDescValue('');
            setMainTaskStartDate(null);
            setMainTaskEndDate(null);
        }
    }, [filterMainTaskId, mainTasks]);

    const loadMainTasks = async () => {
        if (!project?.id) return;
        try {
            setLoadingMainTasks(true);
            const tasks = await mainTasksApi.getMainTasksByProject(project.id);
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

            // Fetch user details for assignedTo
            const userIds = new Set<string>();
            tasks.forEach(task => {
                task.assignedTo?.forEach(id => {
                    if (id) userIds.add(id);
                });
            });

            const userPromises = Array.from(userIds).map(id =>
                usersApi.getUserById(id).catch(err => {
                    console.error(`Failed to fetch user ${id}:`, err);
                    return null;
                })
            );
            const users = await Promise.all(userPromises);

            const userMap = new Map<string, User>();
            users.forEach((user, index) => {
                if (user) {
                    userMap.set(Array.from(userIds)[index], user);
                }
            });

            const tasksWithUsers = tasks.map(task => ({
                ...task,
                assignedToUsers: task.assignedTo?.map(id => userMap.get(id)).filter(Boolean) as User[] | undefined,
            }));

            setSubTasksWithUsers(tasksWithUsers);
        } catch (err) {
            console.error('Failed to load subtasks:', err);
        } finally {
            setLoadingSubTasks(false);
        }
    };

    const handleAddMainTask = () => {
        setMainTaskForm({ title: '', description: '', startDate: '', endDate: '' });
        setCreateMainTaskOpen(true);
    };

    const handleMainTaskRowClick = (mainTask: MainTaskResponse) => {
        setSelectedMainTask(mainTask);
        setFilterMainTaskId(mainTask.id);
        setActiveTab('subTasks');
    };

    const handleSubTaskRowClick = (subTask: SubTaskResponse) => {
        setSelectedSubTask(subTask);
        setSubTaskForm({
            title: subTask.title || '',
            description: subTask.description || '',
            priority: subTask.priority || 'Low',
            status: subTask.status || 'To Do',
            startDate: subTask.startDate ? formatDateToString(new Date(subTask.startDate)) : '',
            endDate: subTask.endDate ? formatDateToString(new Date(subTask.endDate)) : '',
            assignedTo: subTask.assignedTo || [],
            createdBy: subTask.createdBy || '',
            category: subTask.category || '',
            categoryId: subTask.categoryId || '',
            projectId: subTask.projectId,
            mainTaskId: subTask.mainTaskId || ''
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
                projectId: project?.id,
                startDate: mainTaskForm.startDate || null,
                endDate: mainTaskForm.endDate || null,
            });
            setCreateMainTaskOpen(false);
            setMainTaskForm({ title: '', description: '', startDate: '', endDate: '' });
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

            console.log('fetchAssignableUsers started, project.id:', project?.id);

            if (project?.id) {
                try {
                    const projectMembers = await projectsApi.getProjectMembers(project.id);
                    console.log('Project members fetched:', projectMembers);

                    unique = projectMembers.map(member => ({
                        id: member.id,
                        userName: member.userName,
                        firstName: member.firstName,
                        middleName: member.middleName,
                        lastName: member.lastName,
                        email: member.email,
                        userIMG: member.userIMG,
                    } as User));
                    console.log('Project members mapped to User objects:', unique);
                } catch (projectErr) {
                    console.error('Failed to fetch project members:', projectErr);
                }
            } else {
                console.warn('No project ID available');
            }

            console.log('Final assignable users list:', unique);
            setAssignableUsers(unique);
            console.log('setAssignableUsers state updated');
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoadingAssignableUsers(false);
            console.log('fetchAssignableUsers completed, loading state set to false');
        }
    }

    // DataGrid columns for MainTasks
    const mainTaskColumns: TableColumnDefinition<MainTaskResponse>[] = [
        createTableColumn<MainTaskResponse>({
            columnId: 'title',
            compare: (a, b) => a.title.localeCompare(b.title),
            renderHeaderCell: () => 'Title',
            renderCell: (item) => item.title,
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'description',
            renderHeaderCell: () => 'Description',
            renderCell: (item) =>
                item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '-',
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'startDate',
            compare: (a, b) => {
                const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
                const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'Start Date',
            renderCell: (item) => item.startDate ? new Date(item.startDate).toLocaleDateString() : '-',
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'endDate',
            compare: (a, b) => {
                const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
                const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'End Date',
            renderCell: (item) => item.endDate ? new Date(item.endDate).toLocaleDateString() : '-',
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'subTasks',
            renderHeaderCell: () => 'SubTasks',
            renderCell: (item) => subTaskCounts[item.id] || 0,
        }),
        createTableColumn<MainTaskResponse>({
            columnId: 'createdAt',
            compare: (a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'Created',
            renderCell: (item) =>
                item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
        }),
    ];

    // Compute available filter options from subtasks
    const statusOptions = Array.from(new Set(subTasksWithUsers.map(t => t.status).filter(Boolean))) as string[];
    const priorityOptions = Array.from(new Set(subTasksWithUsers.map(t => t.priority).filter(Boolean))) as string[];
    const categoryOptions = Array.from(new Set(subTasksWithUsers.map(t => t.category).filter(Boolean))) as string[];

    // Filtered subtasks
    const filteredSubTasks = subTasksWithUsers.filter(task => {
        if (filterStatus.length > 0 && !filterStatus.includes(task.status ?? '')) return false;
        if (filterPriority.length > 0 && !filterPriority.includes(task.priority ?? '')) return false;
        if (filterCategory.length > 0 && !filterCategory.includes(task.category ?? '')) return false;
        if (filterMainTaskId && task.mainTaskId !== filterMainTaskId) return false;
        return true;
    });

    // DataGrid columns for SubTasks
    const subTaskColumns: TableColumnDefinition<SubTaskResponse & { assignedToUsers?: User[] }>[] = [
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'title',
            compare: (a, b) => (a.title || '').localeCompare(b.title || ''),
            renderHeaderCell: () => 'Title',
            renderCell: (item) => item.title || '-',
        }),
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'description',
            renderHeaderCell: () => 'Description',
            renderCell: (item) =>
                item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '-',
        }),
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'priority',
            compare: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
            renderHeaderCell: () => 'Priority',
            renderCell: (item) => (
                <Badge
                    appearance="tint"
                    size="large"
                    style={(() => {
                        const colors = getPillColors(item.priority || 'Low', priorityPillStyles);
                        return {
                            backgroundColor: colors.bg,
                            color: colors.color,
                            borderColor: colors.border,
                            paddingInline: tokens.spacingHorizontalS,
                        };
                    })()}
                >
                    {item.priority || '-'}
                </Badge>
            ),
        }),
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'category',
            renderHeaderCell: () => 'Category',
            renderCell: (item) => item.category || '-',
        }),
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'assignedTo',
            renderHeaderCell: () => 'Assigned To',
            renderCell: (item) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {item.assignedToUsers && item.assignedToUsers.length > 0 ? (
                        item.assignedToUsers.map((user) => (
                            <Avatar
                                key={user.id}
                                name={`${user.firstName} ${user.lastName}`}
                                size={32}
                                color="colorful"
                                image={{ src: user.userIMG || undefined }}
                                title={`${user.firstName} ${user.lastName}`}
                            />
                        ))
                    ) : (
                        <span>Unassigned</span>
                    )}
                </div>
            ),
        }),
        createTableColumn<SubTaskResponse & { assignedToUsers?: User[] }>({
            columnId: 'createdAt',
            compare: (a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            },
            renderHeaderCell: () => 'Created',
            renderCell: (item) =>
                item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
        }),
    ];

    if (loading) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>Loading project...</div></Card>);
    if (error || !project) return (<Card style={{ padding: tokens.spacingVerticalXXL }}><div>{error ?? 'Project not found'}</div></Card>);

    return (
        <Card className={mergeClasses(s.artifCard, s.wFull, s.layoutPadding, s.hFull, s.componentBorder)}>
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
                    <div className={s.dataGridScrollable}>
                        <DataGrid
                            items={mainTasks}
                            columns={mainTaskColumns}
                            sortable
                            size="small"
                            className={gridStyles.grid}
                        >
                            <DataGridHeader>
                                <DataGridRow>
                                    {({ renderHeaderCell }) => (
                                        <DataGridHeaderCell className={gridStyles.headerCell}>{renderHeaderCell()}</DataGridHeaderCell>
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
                                            <DataGridCell className={gridStyles.cell}>{renderCell(item)}</DataGridCell>
                                        )}
                                    </DataGridRow>
                                )}
                            </DataGridBody>
                        </DataGrid>
                    </div>
                )
            ) : (
                loadingSubTasks ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
                        <Spinner label="Loading subtasks..." />
                    </div>
                ) : (
                    <>
                        {/* Selected MainTask header-style (show regardless of subtasks) */}
                        {filterMainTaskId && selectedMainTask && (
                            <div className={mergeClasses(s.artifCard, s.wFull, s.flexColFit)} style={{ padding: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalL }}>

                                <div className={mergeClasses(s.spaceBetweenRow)} style={{ alignItems: 'center', gap: 12 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220 }}>

                                        <h3 style={{ margin: 0 }}>{selectedMainTask.title}</h3>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 160 }}>
                                        {isEditingMainTaskDesc ? (
                                            <Input
                                                ref={(el) => { mainTaskDescInputRef.current = el as HTMLInputElement; if (el) el.focus(); }}
                                                value={mainTaskDescValue}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    setMainTaskDescValue(newValue);
                                                    if (mainTaskDescDebounceRef.current) clearTimeout(mainTaskDescDebounceRef.current);
                                                    mainTaskDescDebounceRef.current = setTimeout(async () => {
                                                        if (!selectedMainTask?.id) return;
                                                        try {
                                                            await mainTasksApi.updateMainTask(selectedMainTask.id, {
                                                                title: selectedMainTask.title,
                                                                description: newValue,
                                                                startDate: selectedMainTask.startDate || null,
                                                                endDate: selectedMainTask.endDate || null,
                                                            });
                                                            loadMainTasks();
                                                        } catch (err) {
                                                            console.error('Failed to update main task description:', err);
                                                        }
                                                    }, 500);
                                                }}
                                                onBlur={async () => {
                                                    setIsEditingMainTaskDesc(false);
                                                    if (!selectedMainTask?.id) return;
                                                    try {
                                                        await mainTasksApi.updateMainTask(selectedMainTask.id, {
                                                            title: selectedMainTask.title,
                                                            description: mainTaskDescValue,
                                                            startDate: selectedMainTask.startDate || null,
                                                            endDate: selectedMainTask.endDate || null,
                                                        });
                                                        loadMainTasks();
                                                    } catch (err) {
                                                        console.error('Failed to save description on blur:', err);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        (e.target as HTMLInputElement).blur();
                                                    } else if (e.key === 'Escape') {
                                                        setIsEditingMainTaskDesc(false);
                                                        setMainTaskDescValue(selectedMainTask.description || '');
                                                    }
                                                }}
                                                placeholder="Add description..."
                                            />
                                        ) : (
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setIsEditingMainTaskDesc(true)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingMainTaskDesc(true); }}
                                                style={{ color: mainTaskDescValue ? tokens.colorNeutralForeground1 : tokens.colorNeutralForeground3, cursor: 'pointer' }}
                                            >
                                                {mainTaskDescValue || 'Add description...'}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ color: tokens.colorNeutralForeground3, fontSize: '12px', marginBottom: '2px' }}>Start</label>
                                            <DatePicker
                                                value={mainTaskStartDate ? new Date(mainTaskStartDate) : null}
                                                onSelectDate={(date: Date | null | undefined) => {
                                                    const dateStr = date ? formatDateToString(date) : null;
                                                    setMainTaskStartDate(dateStr);

                                                    if (!selectedMainTask?.id) return;
                                                    mainTasksApi.updateMainTask(selectedMainTask.id, {
                                                        title: selectedMainTask.title,
                                                        description: mainTaskDescValue,
                                                        startDate: dateStr || null,
                                                        endDate: mainTaskEndDate || null,
                                                    }).then(() => loadMainTasks()).catch(err => console.error('Failed to update start date:', err));
                                                }}
                                                placeholder="Select date"
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ color: tokens.colorNeutralForeground3, fontSize: '12px', marginBottom: '2px' }}>End</label>
                                            <DatePicker
                                                value={mainTaskEndDate ? new Date(mainTaskEndDate) : null}
                                                onSelectDate={(date: Date | null | undefined) => {
                                                    const dateStr = date ? formatDateToString(date) : null;
                                                    setMainTaskEndDate(dateStr);

                                                    if (!selectedMainTask?.id) return;
                                                    mainTasksApi.updateMainTask(selectedMainTask.id, {
                                                        title: selectedMainTask.title,
                                                        description: mainTaskDescValue,
                                                        startDate: mainTaskStartDate || null,
                                                        endDate: dateStr || null,
                                                    }).then(() => loadMainTasks()).catch(err => console.error('Failed to update end date:', err));
                                                }}
                                                placeholder="Select date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* description is now inline in header (editable on click) */}

                            </div>
                        )}

                        {/* Filters and Add Button - one flex row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                                <Dropdown
                                    placeholder="Main Task"
                                    selectedOptions={filterMainTaskId ? [filterMainTaskId] : []}
                                    onOptionSelect={(_, data) => {
                                        const selected = data.optionValue as string;
                                        setFilterMainTaskId(selected || null);
                                    }}
                                    style={{ minWidth: 150 }}
                                >
                                    <Option value="">All Main Tasks</Option>
                                    {mainTasks.map(task => (
                                        <Option key={task.id} value={task.id}>{task.title}</Option>
                                    ))}
                                </Dropdown>
                                <Dropdown
                                    multiselect
                                    placeholder="Status"
                                    selectedOptions={filterStatus}
                                    onOptionSelect={(_, data) => setFilterStatus(data.selectedOptions as string[])}
                                    style={{ minWidth: 120 }}
                                >
                                    {statusOptions.map(status => (
                                        <Option key={status} value={status}>{status}</Option>
                                    ))}
                                </Dropdown>
                                <Dropdown
                                    multiselect
                                    placeholder="Priority"
                                    selectedOptions={filterPriority}
                                    onOptionSelect={(_, data) => setFilterPriority(data.selectedOptions as string[])}
                                    style={{ minWidth: 120 }}
                                >
                                    {priorityOptions.map(priority => (
                                        <Option key={priority} value={priority}>{priority}</Option>
                                    ))}
                                </Dropdown>
                                <Dropdown
                                    multiselect
                                    placeholder="Category"
                                    selectedOptions={filterCategory}
                                    onOptionSelect={(_, data) => setFilterCategory(data.selectedOptions as string[])}
                                    style={{ minWidth: 120 }}
                                >
                                    {categoryOptions.map(category => (
                                        <Option key={category} value={category}>{category}</Option>
                                    ))}
                                </Dropdown>
                            </div>
                            <Button
                                appearance="primary"
                                icon={<Add24Regular />}
                                onClick={() => {
                                    const defaultMainTaskId = filterMainTaskId ?? (mainTasks && mainTasks.length > 0 ? mainTasks[0].id : '');
                                    setSubTaskForm({
                                        title: '',
                                        description: '',
                                        priority: 'Low',
                                        status: 'To Do',
                                        startDate: '',
                                        endDate: '',
                                        assignedTo: [],
                                        createdBy: user?.id || '',
                                        category: '',
                                        projectId: project?.id || '',
                                        categoryId: '',
                                        mainTaskId: defaultMainTaskId
                                    });
                                    setCreateSubTaskOpen(true);
                                }}
                                disabled={mainTasks.length === 0}
                            >
                                Add SubTask
                            </Button>
                        </div>

                        {/* No subtasks message or DataGrid */}
                        {subTasksWithUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL, color: tokens.colorNeutralForeground3 }}>
                                <div style={{ marginBottom: tokens.spacingVerticalL }}>
                                    No subtasks in this project yet.
                                </div>
                                {mainTasks.length === 0 && (
                                    <div style={{ marginTop: tokens.spacingVerticalS, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                        Create a main task first
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={s.dataGridScrollable}>
                                <DataGrid
                                    items={filteredSubTasks}
                                    columns={subTaskColumns}
                                    sortable
                                    size="small"
                                    className={gridStyles.grid}
                                >
                                    <DataGridHeader>
                                        <DataGridRow>
                                            {({ renderHeaderCell }) => (
                                                <DataGridHeaderCell className={gridStyles.headerCell}>{renderHeaderCell()}</DataGridHeaderCell>
                                            )}
                                        </DataGridRow>
                                    </DataGridHeader>
                                    <DataGridBody<SubTaskResponse & { assignedToUsers?: User[] }>>
                                        {({ item, rowId }) => (
                                            <DataGridRow<SubTaskResponse & { assignedToUsers?: User[] }>
                                                key={rowId}
                                                onClick={() => handleSubTaskRowClick(item)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {({ renderCell }) => (
                                                    <DataGridCell className={gridStyles.cell}>{renderCell(item)}</DataGridCell>
                                                )}
                                            </DataGridRow>
                                        )}
                                    </DataGridBody>
                                </DataGrid>
                            </div>
                        )}
                    </>
                )
            )}

            {/* CreateTaskDialog for SubTasks - always render so it's available from empty state */}
            <CreateTaskDialog
                open={createSubTaskOpen}
                onOpenChange={setCreateSubTaskOpen}
                form={subTaskForm}
                onInputChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                    setSubTaskForm(prev => ({ ...prev, [name]: value }));
                }}
                onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!subTaskForm.mainTaskId || !subTaskForm.projectId) return;
                    setIsSubmittingSubTask(true);
                    setSubTaskSubmitError(null);
                    try {
                        await subTasksApi.createSubTask({
                            title: subTaskForm.title,
                            projectId: subTaskForm.projectId,
                            mainTaskId: subTaskForm.mainTaskId,
                            description: subTaskForm.description || undefined,
                            priority: subTaskForm.priority || undefined,
                            status: subTaskForm.status || undefined,
                            createdBy: subTaskForm.createdBy || undefined,
                            assignedTo: subTaskForm.assignedTo && subTaskForm.assignedTo.length > 0 ? subTaskForm.assignedTo : undefined,
                            startDate: subTaskForm.startDate || undefined,
                            endDate: subTaskForm.endDate || undefined,
                            category: subTaskForm.category || undefined,
                        });
                        setCreateSubTaskOpen(false);
                        loadSubTasks();
                        loadMainTasks();
                    } catch (err) {
                        setSubTaskSubmitError((err as Error).message || 'Failed to create subtask');
                    } finally {
                        setIsSubmittingSubTask(false);
                    }
                }}
                assignableUsers={assignableUsers}
                isLoadingAssignableUsers={isLoadingAssignableUsers}
                assignableUsersError={null}
                projects={[project!]}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                hideProjectField={true}
                mainTasks={mainTasks}
                isLoadingMainTasks={false}
                hideMainTaskField={false}
                currentUser={user}
                isSubmitting={isSubmittingSubTask}
                submitError={subTaskSubmitError}
            />

            <CreateMainTaskDialog
                open={createMainTaskOpen}
                onOpenChange={setCreateMainTaskOpen}
                form={mainTaskForm}
                onInputChange={(e) => {
                    const { name, value } = e.target;
                    setMainTaskForm(prev => ({ ...prev, [name]: value }));
                }}
                onDateChange={(name, value) => setMainTaskForm(prev => ({ ...prev, [name]: value }))}
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


            {selectedSubTask && (
                <EditTaskDialog
                    open={editSubTaskOpen}
                    onOpenChange={setEditSubTaskOpen}
                    form={subTaskForm}
                    onTitleChange={(title: string) => {
                        setSubTaskForm(prev => ({ ...prev, title }));

                        // Clear previous timeout
                        if (titleDebounceRef.current) {
                            clearTimeout(titleDebounceRef.current);
                        }

                        // Set new timeout
                        titleDebounceRef.current = setTimeout(async () => {
                            if (!selectedSubTask?.id) return;
                            try {
                                await subTasksApi.patchSubTask(selectedSubTask.id, { title });
                                loadSubTasks();
                            } catch (err) {
                                console.error('Failed to update title:', err);
                            }
                        }, 400);
                    }}
                    onDescriptionChange={(description: string) => {
                        setSubTaskForm(prev => ({ ...prev, description }));

                        // Clear previous timeout
                        if (descriptionDebounceRef.current) {
                            clearTimeout(descriptionDebounceRef.current);
                        }

                        // Set new timeout
                        descriptionDebounceRef.current = setTimeout(async () => {
                            if (!selectedSubTask?.id) return;
                            try {
                                await subTasksApi.patchSubTask(selectedSubTask.id, { description });
                                loadSubTasks();
                            } catch (err) {
                                console.error('Failed to update description:', err);
                            }
                        }, 400);
                    }}
                    onPriorityChange={async (priority: string) => {
                        setSubTaskForm(prev => ({ ...prev, priority }));
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { priority });
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update priority:', err);
                        }
                    }}
                    onStatusChange={async (status: string) => {
                        setSubTaskForm(prev => ({ ...prev, status }));
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { status });
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update status:', err);
                        }
                    }}
                    onStartDateChange={async (startDate: string) => {
                        setSubTaskForm(prev => ({ ...prev, startDate }));
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { startDate });
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update start date:', err);
                        }
                    }}
                    onEndDateChange={async (endDate: string) => {
                        setSubTaskForm(prev => ({ ...prev, endDate }));
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { endDate });
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update end date:', err);
                        }
                    }}
                    onAssignedToChange={async (assignedTo: string[]) => {
                        setSubTaskForm(prev => ({ ...prev, assignedTo }));
                        if (!selectedSubTask?.id) return;
                        try {
                            await subTasksApi.patchSubTask(selectedSubTask.id, { assignedTo });
                            loadSubTasks();
                        } catch (err) {
                            console.error('Failed to update assigned users:', err);
                        }
                    }}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setEditSubTaskOpen(false);
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
