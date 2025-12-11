import {
    Avatar,
    Button,
    Dialog,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    Textarea,
    tokens,
    Tooltip,
    Text,
    Divider,
    Card,
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridHeaderCell,
    DataGridBody,
    DataGridCell,
    TableCellLayout,
    createTableColumn
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import type { TableColumnDefinition } from '@fluentui/react-components';
import {
    Dismiss24Regular,
    TaskListSquareLtr20Regular
} from '@fluentui/react-icons';
import { useState, useRef, useEffect } from 'react';
import type { User } from '../apis/auth';
import { subTasksApi, type SubTaskResponse, type CreateSubTaskData } from '../apis/subtasks';
import CreateTaskDialog from './CreateTaskDialog';
import type { Project } from '../apis/projects';
import type { Category } from '../apis/categories';

export interface CreateMainTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
        title: string;
        description: string;
        startDate: string;
        endDate: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDateChange: (name: 'startDate' | 'endDate', value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    currentUser?: User | null;
    isSubmitting?: boolean;
    submitError?: string | null;
    projectId?: string;
    mainTaskId?: string;
    assignableUsers?: User[];
    isLoadingAssignableUsers?: boolean;
    assignableUsersError?: string | null;
    projects?: Project[];
    categories?: Category[];
    isLoadingCategories?: boolean;
    onSubTaskCreated?: () => void;
}

// Helper to convert YYYY-MM-DD string or ISO string to Date object
function parseFormDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    // If already an ISO string (contains 'T'), parse directly
    if (dateStr.includes('T')) {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? undefined : date;
    }
    // Otherwise, assume YYYY-MM-DD format
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? undefined : date;
}

// Helper to convert Date to YYYY-MM-DD string using local timezone
function formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function CreateMainTaskDialog({
    open,
    onOpenChange,
    form,
    onInputChange,
    onDateChange,
    onSubmit,
    isSubmitting = false,
    submitError,
    currentUser = null,
    projectId,
    mainTaskId,
    assignableUsers = [],
    isLoadingAssignableUsers = false,
    assignableUsersError = null,
    projects = [],
    categories = [],
    isLoadingCategories = false,
    onSubTaskCreated
}: CreateMainTaskDialogProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [subTasks, setSubTasks] = useState<SubTaskResponse[]>([]);
    const [loadingSubTasks, setLoadingSubTasks] = useState(false);
    const [subTasksError, setSubTasksError] = useState<string | null>(null);

    // CreateTaskDialog (SubTask) state
    const [createSubTaskOpen, setCreateSubTaskOpen] = useState(false);
    const [subTaskForm, setSubTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Low',
        status: 'To Do',
        startDate: '',
        endDate: '',
        assignedTo: [] as string[],
        createdBy: currentUser?.id || '',
        category: '',
        projectId: projectId || ''
    });
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false);
    const [subTaskSubmitError, setSubTaskSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTitle]);

    useEffect(() => {
        if (open && mainTaskId) {
            loadSubTasks();
        } else {
            setSubTasks([]);
        }
        // Reset subTaskForm when dialog opens
        if (open) {
            setSubTaskForm({
                title: '',
                description: '',
                priority: 'Low',
                status: 'To Do',
                startDate: '',
                endDate: '',
                assignedTo: [],
                createdBy: currentUser?.id || '',
                category: '',
                projectId: projectId || ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mainTaskId, projectId]);

    const loadSubTasks = () => {
        if (!mainTaskId) return;
        setLoadingSubTasks(true);
        setSubTasksError(null);
        subTasksApi.getSubTasks(projectId)
            .then(allSubTasks => {
                const filtered = allSubTasks.filter(st => st.mainTaskId === mainTaskId);
                setSubTasks(filtered);
            })
            .catch((err: unknown) => {
                setSubTasksError((err as Error)?.message || 'Failed to load subtasks');
                setSubTasks([]);
            })
            .finally(() => setLoadingSubTasks(false));
    };

    // Determine which user info to show for avatar
    const userInfo = currentUser ?? null;

    function handleTitleBlur() {
        setEditingTitle(false);
    }

    function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            setEditingTitle(false);
        }
    }

    function handleStartDateSelect(date: Date): void {
        onDateChange('startDate', formatDateToString(date));
    }

    function handleEndDateSelect(date: Date): void {
        onDateChange('endDate', formatDateToString(date));
    }

    const handleAddSubTask = () => {
        if (!mainTaskId) {
            alert('Please create the Main Task first before adding SubTasks');
            return;
        }
        setSubTaskForm(prev => ({
            ...prev,
            createdBy: currentUser?.id || '',
            projectId: projectId || ''
        }));
        setCreateSubTaskOpen(true);
    };

    const handleSubTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSubTaskForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainTaskId || !projectId) return;

        setIsSubmittingSubTask(true);
        setSubTaskSubmitError(null);

        try {
            // Prepare data, only include optional fields if they have values
            const subTaskData: CreateSubTaskData = {
                title: subTaskForm.title,
                projectId: projectId,
                mainTaskId: mainTaskId,
            };

            if (subTaskForm.description) subTaskData.description = subTaskForm.description;
            if (subTaskForm.priority) subTaskData.priority = subTaskForm.priority;
            if (subTaskForm.category) subTaskData.category = subTaskForm.category;
            if (subTaskForm.createdBy) subTaskData.createdBy = subTaskForm.createdBy;
            if (subTaskForm.assignedTo && subTaskForm.assignedTo.length > 0) subTaskData.assignedTo = subTaskForm.assignedTo;
            if (subTaskForm.startDate) subTaskData.startDate = subTaskForm.startDate;
            if (subTaskForm.endDate) subTaskData.endDate = subTaskForm.endDate;

            await subTasksApi.createSubTask(subTaskData);

            // Reset form and close dialog
            setSubTaskForm({
                title: '',
                description: '',
                priority: 'Low',
                status: 'To Do',
                startDate: '',
                endDate: '',
                assignedTo: [],
                createdBy: currentUser?.id || '',
                category: '',
                projectId: projectId || ''
            });
            setCreateSubTaskOpen(false);

            // Reload subtasks
            loadSubTasks();
            onSubTaskCreated?.();
        } catch (error) {
            setSubTaskSubmitError((error as Error).message || 'Failed to create subtask');
        } finally {
            setIsSubmittingSubTask(false);
        }
    };

    // Define table columns
    const columns: TableColumnDefinition<SubTaskResponse>[] = [
        createTableColumn<SubTaskResponse>({
            columnId: 'title',
            compare: (a, b) => a.title.localeCompare(b.title),
            renderHeaderCell: () => 'Title',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.title}
                </TableCellLayout>
            ),
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'priority',
            compare: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
            renderHeaderCell: () => 'Priority',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.priority || '-'}
                </TableCellLayout>
            ),
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'assigned',
            renderHeaderCell: () => 'Assigned',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.assignedTo.length > 0 ? `${item.assignedTo.length} member${item.assignedTo.length !== 1 ? 's' : ''}` : '-'}
                </TableCellLayout>
            ),
        }),
        createTableColumn<SubTaskResponse>({
            columnId: 'dates',
            renderHeaderCell: () => 'Dates',
            renderCell: (item) => (
                <TableCellLayout>
                    {item.startDate && item.endDate
                        ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
                        : item.startDate
                            ? new Date(item.startDate).toLocaleDateString()
                            : '-'
                    }
                </TableCellLayout>
            ),
        }),
    ];

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface style={{ minWidth: 600, maxWidth: 800, width: '85vw' }}>
                <form onSubmit={onSubmit} style={{ width: '100%' }}>
                    {/* Row 1: Close icon button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 24, marginBottom: 8, gap: 8 }}>
                        <Tooltip content="Close" relationship="label">
                            <Button
                                icon={<Dismiss24Regular />}
                                appearance="subtle"
                                type="button"
                                onClick={e => {
                                    e.preventDefault();
                                    onOpenChange(false);
                                }}
                            />
                        </Tooltip>
                    </div>

                    {/* Row 2: Main Task title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ flex: 1, margin: 0 }}>
                            {editingTitle ? (
                                <Input
                                    name="title"
                                    value={form.title}
                                    onChange={onInputChange}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleTitleKeyDown}
                                    ref={inputRef}
                                    size="large"
                                    style={{ fontWeight: 600, fontSize: 22, padding: 0, height: 40, width: '100%' }}
                                />
                            ) : (
                                <DialogTitle
                                    as="h2"
                                    style={{ cursor: 'pointer', fontWeight: 600, fontSize: 22, margin: 0 }}
                                    onClick={() => setEditingTitle(true)}
                                    title="Click to edit title"
                                >
                                    {form.title || 'Create Main Task'}
                                </DialogTitle>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Created by section with avatar and name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Avatar
                            name={userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
                            size={32}
                            color="colorful"
                            image={userInfo?.userIMG ? { src: userInfo.userIMG } : undefined}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Created by</span>
                            <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
                            </span>
                        </div>
                    </div>

                    {/* Row 4: Start and End Dates */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        <Field label="Start Date" style={{ flex: '1 1 200px' }}>
                            <DatePicker
                                placeholder="mm/dd/yyyy"
                                value={parseFormDate(form.startDate)}
                                onSelectDate={(date) => {
                                    if (date) {
                                        handleStartDateSelect(date);
                                    }
                                }}
                                size="medium"
                                style={{ width: '100%' }}
                            />
                        </Field>
                        <Field label="End Date" style={{ flex: '1 1 200px' }}>
                            <DatePicker
                                placeholder="mm/dd/yyyy"
                                value={parseFormDate(form.endDate)}
                                onSelectDate={(date) => {
                                    if (date) {
                                        handleEndDateSelect(date);
                                    }
                                }}
                                size="medium"
                                style={{ width: '100%' }}
                            />
                        </Field>
                    </div>

                    {/* Row 4: SubTasks Section */}
                    {mainTaskId && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text weight="semibold" size={300}>SubTasks ({subTasks.length})</Text>
                                <Button
                                    size="small"
                                    appearance="primary"
                                    icon={<TaskListSquareLtr20Regular />}
                                    onClick={handleAddSubTask}
                                    disabled={!mainTaskId}
                                >
                                    Add SubTask
                                </Button>
                            </div>
                            <Card style={{
                                maxHeight: 300,
                                overflowY: 'auto',
                                padding: tokens.spacingVerticalS,
                                background: tokens.colorNeutralBackground3
                            }}>
                                {loadingSubTasks && (
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Loading subtasks...</Text>
                                )}
                                {subTasksError && (
                                    <Text size={200} style={{ color: tokens.colorPaletteRedForeground3 }}>{subTasksError}</Text>
                                )}
                                {!loadingSubTasks && !subTasksError && subTasks.length === 0 && (
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No subtasks yet. Click "Add SubTask" to create one.</Text>
                                )}
                                {!loadingSubTasks && !subTasksError && subTasks.length > 0 && (
                                    <DataGrid
                                        items={subTasks}
                                        columns={columns}
                                        sortable
                                        size="small"
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
                                                <DataGridRow<SubTaskResponse> key={rowId}>
                                                    {({ renderCell }) => (
                                                        <DataGridCell>{renderCell(item)}</DataGridCell>
                                                    )}
                                                </DataGridRow>
                                            )}
                                        </DataGridBody>
                                    </DataGrid>
                                )}
                            </Card>
                            <Divider style={{ marginTop: 16 }} />
                        </div>
                    )}

                    {/* Row 5: Description */}
                    <Field label="Description" style={{ marginBottom: 16 }}>
                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={onInputChange}
                            placeholder="Describe the main task objectives and goals..."
                            rows={4}
                            resize="vertical"
                            style={{ minHeight: 100 }}
                        />
                    </Field>

                    {/* Row 6: Submit button & error */}
                    {submitError && (
                        <div style={{
                            color: tokens.colorPaletteRedForeground3,
                            fontSize: tokens.fontSizeBase200,
                            marginBottom: 12
                        }}>
                            {submitError}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                            type="button"
                            appearance="secondary"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            appearance="primary"
                            disabled={isSubmitting || !form.title.trim()}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Main Task'}
                        </Button>
                    </div>
                </form>

                {/* SubTask Creation Dialog */}
                {mainTaskId && (
                    <CreateTaskDialog
                        open={createSubTaskOpen}
                        onOpenChange={setCreateSubTaskOpen}
                        form={subTaskForm}
                        onInputChange={handleSubTaskInputChange}
                        onSubmit={handleSubTaskSubmit}
                        assignableUsers={assignableUsers}
                        isLoadingAssignableUsers={isLoadingAssignableUsers}
                        assignableUsersError={assignableUsersError}
                        projects={projects}
                        isLoadingProjects={false}
                        projectsError={null}
                        categories={categories}
                        isLoadingCategories={isLoadingCategories}
                        categoriesError={null}
                        hideProjectField={true}
                        hideMainTaskField={true}
                        currentUser={currentUser}
                        isSubmitting={isSubmittingSubTask}
                        submitError={subTaskSubmitError}
                    />
                )}
            </DialogSurface>
        </Dialog>
    );
}
