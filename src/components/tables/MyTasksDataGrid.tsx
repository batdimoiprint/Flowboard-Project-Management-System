
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
    makeStyles,
    tokens,
    Button,
    Input,
    Dropdown,
    Option,
} from '@fluentui/react-components';
import { mainLayoutStyles } from '../styles/Styles';
import type { Task } from '../../types/MyTasksTypes';
import type { TableColumnId } from '@fluentui/react-components';
import { TaskListSquarePerson24Regular, Filter24Regular, DismissCircle24Regular } from "@fluentui/react-icons";

type SortState = {
    sortColumn: TableColumnId | undefined;
    sortDirection: 'ascending' | 'descending';
};
import { subTasksApi, type SubTaskResponse } from '../apis/subtasks';
import { taskColumns } from './taskColumns';
import { usersApi } from '../apis/users';
import { projectsApi, type Project } from '../apis/projects';


interface MyTasksDataGridProps {
    onRowClick?: (task: Task) => void;
    onAddClick?: () => void;
    onFetchComplete?: (tasks: Task[]) => void;
    refreshSignal?: number;
}

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

function MyTasksDataGrid({ onRowClick,
    //  onAddClick, 
    onFetchComplete, refreshSignal }: MyTasksDataGridProps) {
    const styles = mainLayoutStyles();
    const gridStyles = useGridStyles();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortState, setSortState] = useState<SortState>({ sortColumn: undefined, sortDirection: 'ascending' });
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const [filterPriority, setFilterPriority] = useState<string[]>([]);
    const [filterProject, setFilterProject] = useState<string[]>([]);

    const { register: searchRegister, watch: searchWatch } = useForm<{ search: string }>({ defaultValues: { search: '' } });
    const searchValue = searchWatch('search');


    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            // Use the subtasks API to get tasks for the authenticated user
            const fetched = await subTasksApi.getMySubTasks();

            // Transform API response to match local Task type
            const transformedTasks: Task[] = fetched.map((task: SubTaskResponse) => {
                const status = (task as { status?: string }).status || 'To Do';
                return {
                    _id: task.id,
                    projectId: task.projectId,
                    category: task.category || '',
                    categoryId: task.categoryId || '',
                    assignedTo: task.assignedTo || [],
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority || 'Medium',
                    status,
                    startDate: task.startDate || '',
                    endDate: task.endDate || '',
                    createdBy: task.createdBy || '',
                    createdAt: task.createdAt || '',
                    comments: (task.comments || []).map(c => ({
                        authorId: c.authorId,
                        user: c.authorId,
                        text: c.content || undefined,
                        content: c.content || undefined,
                        createdAt: c.createdAt
                    })),
                };
            });

            // Fetch user details for assignedTo, createdBy, and comment authors
            // Collect unique user IDs
            const userIds = new Set<string>();
            transformedTasks.forEach(task => {
                task.assignedTo.forEach(id => {
                    if (id) userIds.add(id);
                });
                if (task.createdBy) userIds.add(task.createdBy);
                task.comments.forEach(comment => {
                    if (comment.authorId) userIds.add(comment.authorId);
                });
            });

            const projectIds = new Set<string>();
            transformedTasks.forEach(task => {
                if (task.projectId) projectIds.add(task.projectId);
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

            const projectPromises = Array.from(projectIds).map(id =>
                projectsApi.getProjectById(id).catch(err => {
                    console.error(`Failed to fetch project ${id}:`, err);
                    return null;
                })
            );
            const projects = await Promise.all(projectPromises);
            const projectMap = new Map<string, Project>();
            projects.forEach((project, index) => {
                if (project) {
                    projectMap.set(Array.from(projectIds)[index], project);
                }
            });

            // Attach user objects to tasks and comments
            transformedTasks.forEach(task => {
                task.assignedToUsers = [];
                task.assignedTo.forEach(id => {
                    if (userMap.has(id)) {
                        task.assignedToUsers!.push(userMap.get(id));
                    }
                });

                if (task.createdBy && userMap.has(task.createdBy)) {
                    task.createdByUser = userMap.get(task.createdBy);
                }
                task.comments.forEach(comment => {
                    if (comment.authorId && userMap.has(comment.authorId)) {
                        comment.authorUser = userMap.get(comment.authorId);
                    }
                });

                if (task.projectId && projectMap.has(task.projectId)) {
                    task.projectName = projectMap.get(task.projectId)?.projectName;
                }
            });

            setTasks(transformedTasks);
            onFetchComplete?.(transformedTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [onFetchComplete]);

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        if (typeof refreshSignal === 'number') {
            fetchTasks();
        }
    }, [refreshSignal, fetchTasks]);


    function handleRowClickLocal(task: Task) {
        console.log('Row clicked:', task);
        onRowClick?.(task);
    }

    // Compute available filter options from tasks
    const statusOptions = useMemo(() => {
        const statuses = new Set(tasks.map(t => t.status).filter(Boolean));
        return Array.from(statuses).sort();
    }, [tasks]);

    const priorityOptions = useMemo(() => {
        const priorities = new Set(tasks.map(t => t.priority).filter(Boolean));
        return Array.from(priorities).sort();
    }, [tasks]);

    const projectOptions = useMemo(() => {
        const projects = new Map<string, string>();
        tasks.forEach(t => {
            if (t.projectId && t.projectName) {
                projects.set(t.projectId, t.projectName);
            }
        });
        return Array.from(projects.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [tasks]);

    // Filter tasks by search and dropdowns
    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        // Apply search filter
        if (searchValue) {
            const q = searchValue.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q) ||
                    task.status?.toLowerCase().includes(q) ||
                    task.projectName?.toLowerCase().includes(q) ||
                    task.assignedToUsers?.some(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q))
            );
        }

        // Apply status filter
        if (filterStatus.length > 0) {
            filtered = filtered.filter(task => filterStatus.includes(task.status));
        }

        // Apply priority filter
        if (filterPriority.length > 0) {
            filtered = filtered.filter(task => filterPriority.includes(task.priority));
        }

        // Apply project filter
        if (filterProject.length > 0) {
            filtered = filtered.filter(task => task.projectId && filterProject.includes(task.projectId));
        }

        return filtered;
    }, [tasks, searchValue, filterStatus, filterPriority, filterProject]);

    const handleSortChange = useCallback((_e: unknown, data: SortState) => {
        setSortState(data);
    }, []);

    const sortedTasks = useMemo(() => {
        if (sortState.sortColumn === undefined) return filteredTasks;
        const column = taskColumns.find(col => col.columnId === sortState.sortColumn);
        const compareFn = (column as { compare?: (a: Task, b: Task) => number } | undefined)?.compare;
        if (!compareFn) return filteredTasks;

        const ordered = [...filteredTasks].sort((a, b) => compareFn(a, b));
        return sortState.sortDirection === 'ascending' ? ordered : ordered.reverse();
    }, [filteredTasks, sortState]);

    const hasActiveFilters = filterStatus.length > 0 || filterPriority.length > 0 || filterProject.length > 0;

    const clearFilters = () => {
        setFilterStatus([]);
        setFilterPriority([]);
        setFilterProject([]);
    };

    return (
        <div className={mergeClasses(styles.flexColFill, styles.hFull, styles.wFull)} style={{ minHeight: 0, maxHeight: '100%', width: '100%' }}>

            <div className={mergeClasses(styles.flexRowFit, styles.spaceBetween)} >
                <div className={mergeClasses(styles.flexRowFit, styles.alignCenter, styles.gap)}>
                    <TaskListSquarePerson24Regular />
                    <Label>My Tasks</Label>
                </div>

                <div className={mergeClasses(styles.flexRowFit, styles.alignCenter)} style={{ gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalS, flexWrap: 'wrap' }}>

                    <Input
                        placeholder="Search tasks..."
                        type="search"
                        style={{ minWidth: 200 }}
                        {...searchRegister('search')}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                        <Filter24Regular style={{ color: tokens.colorNeutralForeground3 }} />
                        <Label>Filters:</Label>
                    </div>
                    <Dropdown
                        placeholder="Status"
                        multiselect
                        selectedOptions={filterStatus}
                        onOptionSelect={(_e, data) => setFilterStatus(data.selectedOptions)}
                        style={{ minWidth: 140 }}
                    >
                        {statusOptions.map(status => (
                            <Option key={status} value={status}>
                                {status}
                            </Option>
                        ))}
                    </Dropdown>
                    <Dropdown
                        placeholder="Priority"
                        multiselect
                        selectedOptions={filterPriority}
                        onOptionSelect={(_e, data) => setFilterPriority(data.selectedOptions)}
                        style={{ minWidth: 140 }}
                    >
                        {priorityOptions.map(priority => (
                            <Option key={priority} value={priority}>
                                {priority}
                            </Option>
                        ))}
                    </Dropdown>
                    <Dropdown
                        placeholder="Project"
                        multiselect
                        selectedOptions={filterProject}
                        onOptionSelect={(_e, data) => setFilterProject(data.selectedOptions)}
                        style={{ minWidth: 180 }}
                    >
                        {projectOptions.map(([projectId, projectName]) => (
                            <Option key={projectId} value={projectId}>
                                {projectName}
                            </Option>
                        ))}
                    </Dropdown>
                    {hasActiveFilters && (
                        <Button
                            appearance="subtle"
                            icon={<DismissCircle24Regular />}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* TaskDialog is intentionally moved up to parent */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spinner />
                    Loading tasks...
                </div>
            ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <Label style={{ fontSize: 24, fontWeight: 600 }}>No tasks assigned yet</Label>

                </div>
            ) : (
                <div className={styles.dataGridScrollable}>
                    <DataGrid
                        items={sortedTasks}
                        columns={taskColumns}
                        sortState={sortState}
                        onSortChange={handleSortChange}
                        style={{ overflowY: 'auto' }}
                        className={gridStyles.grid}
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell, columnId }) => (
                                    <DataGridHeaderCell
                                        className={gridStyles.headerCell}
                                        sortDirection={sortState.sortColumn === columnId ? sortState.sortDirection : undefined}
                                    >
                                        {renderHeaderCell()}
                                    </DataGridHeaderCell>
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
                                        onClick={() => handleRowClickLocal(task)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {({ renderCell }) => (
                                            <DataGridCell className={gridStyles.cell}>{renderCell(task)}</DataGridCell>
                                        )}
                                    </DataGridRow>
                                );
                            }}
                        </DataGridBody>
                    </DataGrid>
                </div>
            )}
        </div>
    );
}

export default MyTasksDataGrid;

