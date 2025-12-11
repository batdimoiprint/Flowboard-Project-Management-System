import {
    Avatar,
    Button,
    Dialog,
    DialogSurface,
    DialogTitle,
    Field,
    Input,
    tokens,
    Tooltip,
    Text,
    Divider,
    Card,
    // Label
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import {
    Dismiss24Regular,
    Delete24Regular,
    TaskListSquareLtr20Regular
} from '@fluentui/react-icons';
import { useState, useRef, useEffect } from 'react';
import type { User } from '../apis/auth';
import { subTasksApi, type SubTaskResponse, type CreateSubTaskData, type UpdateSubTaskData } from '../apis/subtasks';
import { mainTasksApi, type UpdateMainTaskData } from '../apis/maintasks';
import CreateTaskDialog from './CreateTaskDialog';
import EditTaskDialog from './EditTaskDialog';
import type { Project } from '../apis/projects';
import type { Category } from '../apis/categories';

export interface EditMainTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
        title: string;
        description: string;
        startDate?: string;
        endDate?: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDateChange?: (name: 'startDate' | 'endDate', value: string) => void;
    onDeleteClick?: () => void;
    currentUser?: User | null;
    createdByUser?: User | null;
    isSubmitting?: boolean;
    submitError?: string | null;
    mainTaskId?: string;
    createdAt?: string;
    projectId?: string;
    onAddSubTask?: () => void;
    onSubTaskClick?: (subTask: SubTaskResponse) => void;
    assignableUsers?: User[];
    isLoadingAssignableUsers?: boolean;
    assignableUsersError?: string | null;
    projects?: Project[];
    categories?: Category[];
    isLoadingCategories?: boolean;
    onSubTaskCreated?: () => void;
    onMainTaskUpdated?: () => void;
}

export default function EditMainTaskDialog({
    open,
    onOpenChange,
    form,
    onInputChange,
    onDateChange,
    onDeleteClick,
    isSubmitting = false,
    submitError,
    currentUser = null,
    createdByUser = null,
    mainTaskId,
    createdAt,
    projectId,
    onSubTaskClick,
    assignableUsers = [],
    isLoadingAssignableUsers = false,
    assignableUsersError = null,
    projects = [],
    categories = [],
    isLoadingCategories = false,
    onSubTaskCreated,
    onMainTaskUpdated
}: EditMainTaskDialogProps) {
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

    // EditTaskDialog (SubTask editing) state
    const [editSubTaskOpen, setEditSubTaskOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<SubTaskResponse | null>(null);
    const [editSubTaskForm, setEditSubTaskForm] = useState({
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
        projectId: projectId || ''
    });
    const [isUpdatingSubTask, setIsUpdatingSubTask] = useState(false);
    const [updateSubTaskError, setUpdateSubTaskError] = useState<string | null>(null);

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTitle]);

    useEffect(() => {
        if (open && mainTaskId) {
            loadSubTasks();
            // Reset SubTask form when dialog opens
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
        } else {
            setSubTasks([]);
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

    const handleAddSubTask = () => {
        if (!mainTaskId) {
            alert('Main Task ID is required to add SubTasks');
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

    // Determine which user info to show for avatar
    const userInfo = createdByUser ?? currentUser ?? null;

    function handleTitleBlur() {
        setEditingTitle(false);
    }

    function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            setEditingTitle(false);
        }
    }

    // Format creation date
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : '';

    // MainTask update state
    const [isUpdatingMainTask, setIsUpdatingMainTask] = useState(false);
    const [updateMainTaskError, setUpdateMainTaskError] = useState<string | null>(null);

    const handleMainTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainTaskId) return;
        setIsUpdatingMainTask(true);
        setUpdateMainTaskError(null);
        try {
            const updateData: UpdateMainTaskData = {
                title: form.title,
                description: form.description || '',
                startDate: form.startDate || null,
                endDate: form.endDate || null,
            };
            await mainTasksApi.updateMainTask(mainTaskId, updateData);
            onMainTaskUpdated?.();
            // Optionally, show a success message or reload data
            onOpenChange(false);
        } catch (error) {
            setUpdateMainTaskError((error as Error).message || 'Failed to update main task');
        } finally {
            setIsUpdatingMainTask(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface style={{ maxWidth: 900, width: '85vw' }}>
                {/* <Label style={{ fontWeight: 'bold', fontSize: '24px' }}>Main Task</Label> */}
                <form onSubmit={handleMainTaskSubmit} style={{ width: '100%' }}>
                    {/* Row 1: Delete button and Close icon button */}
                    <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', height: 24, marginBottom: 8, gap: 8 }}>
                        {onDeleteClick && (
                            <Tooltip content="Delete" relationship="label">
                                <Button
                                    icon={<Delete24Regular />}
                                    appearance="subtle"
                                    type="button"
                                    onClick={onDeleteClick}
                                    disabled={isSubmitting}
                                    style={{ color: tokens.colorPaletteRedForeground3 }}
                                />
                            </Tooltip>
                        )}
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
                                    {form.title || 'Edit Main Task'}
                                </DialogTitle>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Description */}
                    <Field label="Description" style={{ marginBottom: 16 }}>
                        <Input
                            name="description"
                            value={form.description}
                            onChange={onInputChange}
                            placeholder="Describe the main task objectives and goals..."


                        />
                    </Field>

                    {/* Row 4: Created by section with avatar and name */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

                        {createdAt && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Created</span>
                                <span style={{ fontSize: tokens.fontSizeBase200 }}>{formattedDate}</span>
                            </div>
                        )}
                    </div>

                    {/* Row 4: Start and End Dates */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        <Field label="Start Date" style={{ flex: '1 1 200px' }}>
                            <DatePicker
                                placeholder="mm/dd/yyyy"
                                value={form.startDate ? new Date(form.startDate) : null}
                                onSelectDate={(date) => onDateChange?.('startDate', date ? date.toISOString().split('T')[0] : '')}
                                size="medium"
                                style={{ width: '100%' }}
                            />
                        </Field>
                        <Field label="End Date" style={{ flex: '1 1 200px' }}>
                            <DatePicker
                                placeholder="mm/dd/yyyy"
                                value={form.endDate ? new Date(form.endDate) : null}
                                onSelectDate={(date) => onDateChange?.('endDate', date ? date.toISOString().split('T')[0] : '')}
                                size="medium"
                                style={{ width: '100%' }}
                            />
                        </Field>
                    </div>



                    {/* Row 5: SubTasks Section */}
                    {mainTaskId && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text weight="semibold" size={300}>SubTasks ({subTasks.length})</Text>
                                <Button
                                    size="small"
                                    appearance="primary"
                                    icon={<TaskListSquareLtr20Regular />}
                                    onClick={handleAddSubTask}
                                >
                                    Add SubTask
                                </Button>
                            </div>
                            <Card style={{
                                maxHeight: 200,
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
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No subtasks yet</Text>
                                )}
                                {!loadingSubTasks && !subTasksError && subTasks.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {subTasks.map((subTask) => (
                                            <div
                                                key={subTask.id}
                                                style={{
                                                    padding: tokens.spacingVerticalXS,
                                                    background: tokens.colorNeutralBackground1,
                                                    borderRadius: tokens.borderRadiusSmall,
                                                    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setSelectedSubTask(subTask);
                                                    setEditSubTaskForm({
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
                                                    onSubTaskClick?.(subTask);
                                                }}
                                            >
                                                <Text size={200} weight="semibold">{subTask.title}</Text>
                                                {subTask.description && (
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 2 }}>
                                                        {subTask.description}
                                                    </Text>
                                                )}
                                                {subTask.priority && (
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginTop: 2 }}>
                                                        Priority: {subTask.priority}
                                                    </Text>
                                                )}
                                                {subTask.assignedTo && subTask.assignedTo.length > 0 && (
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginTop: 2 }}>
                                                        Assigned: {subTask.assignedTo.length} member{subTask.assignedTo.length !== 1 ? 's' : ''}
                                                    </Text>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                            <Divider style={{ marginTop: 16 }} />
                        </div>
                    )}

                    {/* Row 5: Submit button & error */}
                    {(submitError || updateMainTaskError) && (
                        <div style={{
                            color: tokens.colorPaletteRedForeground3,
                            fontSize: tokens.fontSizeBase200,
                            marginBottom: 12
                        }}>
                            {submitError || updateMainTaskError}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                                disabled={isSubmitting || isUpdatingMainTask || !form.title.trim()}
                            >
                                {(isSubmitting || isUpdatingMainTask) ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* CreateTaskDialog for adding SubTasks */}
                <CreateTaskDialog
                    open={createSubTaskOpen}
                    onOpenChange={setCreateSubTaskOpen}
                    form={subTaskForm}
                    onInputChange={handleSubTaskInputChange}
                    onSubmit={handleSubTaskSubmit}
                    isSubmitting={isSubmittingSubTask}
                    submitError={subTaskSubmitError}
                    assignableUsers={assignableUsers}
                    isLoadingAssignableUsers={isLoadingAssignableUsers}
                    assignableUsersError={assignableUsersError}
                    projects={projects}
                    categories={categories}
                    isLoadingCategories={isLoadingCategories}
                    hideProjectField={true}
                    hideMainTaskField={true}
                    currentUser={currentUser}
                />

                {/* EditTaskDialog for editing SubTasks */}
                {selectedSubTask && (
                    <EditTaskDialog
                        open={editSubTaskOpen}
                        onOpenChange={(open) => {
                            setEditSubTaskOpen(open);
                            if (!open) {
                                setSelectedSubTask(null);
                            }
                        }}
                        form={editSubTaskForm}
                        onTitleChange={(title: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, title }));
                        }}
                        onDescriptionChange={(description: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, description }));
                        }}
                        onPriorityChange={(priority: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, priority }));
                        }}
                        onStatusChange={(status: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, status }));
                        }}
                        onStartDateChange={(startDate: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, startDate }));
                        }}
                        onEndDateChange={(endDate: string) => {
                            setEditSubTaskForm(prev => ({ ...prev, endDate }));
                        }}
                        onAssignedToChange={(assignedTo: string[]) => {
                            setEditSubTaskForm(prev => ({ ...prev, assignedTo }));
                        }}
                        onSubmit={async (e: React.FormEvent) => {
                            e.preventDefault();
                            if (!selectedSubTask?.id) return;

                            setIsUpdatingSubTask(true);
                            setUpdateSubTaskError(null);

                            try {
                                const updateData: UpdateSubTaskData = {
                                    title: editSubTaskForm.title,
                                    projectId: editSubTaskForm.projectId,
                                    mainTaskId: mainTaskId,
                                };

                                if (editSubTaskForm.description) updateData.description = editSubTaskForm.description;
                                if (editSubTaskForm.priority) updateData.priority = editSubTaskForm.priority;
                                if (editSubTaskForm.category) updateData.category = editSubTaskForm.category;
                                if (editSubTaskForm.categoryId) updateData.categoryId = editSubTaskForm.categoryId;
                                if (editSubTaskForm.createdBy) updateData.createdBy = editSubTaskForm.createdBy;
                                if (editSubTaskForm.assignedTo && editSubTaskForm.assignedTo.length > 0) updateData.assignedTo = editSubTaskForm.assignedTo;
                                if (editSubTaskForm.startDate) updateData.startDate = editSubTaskForm.startDate;
                                if (editSubTaskForm.endDate) updateData.endDate = editSubTaskForm.endDate;

                                await subTasksApi.updateSubTask(selectedSubTask.id, updateData);
                                setEditSubTaskOpen(false);
                                setSelectedSubTask(null);
                                loadSubTasks();
                                onSubTaskCreated?.();
                            } catch (error) {
                                setUpdateSubTaskError((error as Error).message || 'Failed to update subtask');
                            } finally {
                                setIsUpdatingSubTask(false);
                            }
                        }}
                        onDeleteClick={async () => {
                            if (!selectedSubTask?.id) return;
                            if (!confirm('Delete this subtask?')) return;

                            try {
                                await subTasksApi.deleteSubTask(selectedSubTask.id);
                                setEditSubTaskOpen(false);
                                setSelectedSubTask(null);
                                loadSubTasks();
                                onSubTaskCreated?.();
                            } catch (error) {
                                console.error('Failed to delete subtask:', error);
                                alert('Failed to delete subtask');
                            }
                        }}
                        isSubmitting={isUpdatingSubTask}
                        submitError={updateSubTaskError}
                        assignableUsers={assignableUsers}
                        isLoadingAssignableUsers={isLoadingAssignableUsers}
                        assignableUsersError={assignableUsersError}
                        projects={projects}
                        currentUser={currentUser}
                        categories={categories}
                        isLoadingCategories={isLoadingCategories}
                        taskId={selectedSubTask.id}
                        comments={selectedSubTask.comments?.map(c => ({
                            authorId: c.authorId,
                            content: c.content,
                            createdAt: c.createdAt
                        })) || []}
                        onAddComment={async (text: string) => {
                            if (!selectedSubTask?.id || !currentUser?.id) return;
                            try {
                                await subTasksApi.addComment(selectedSubTask.id, {
                                    authorId: currentUser.id,
                                    text: text
                                });
                                // Reload the subtask to get updated comments
                                const updatedSubTask = await subTasksApi.getSubTaskById(selectedSubTask.id);
                                setSelectedSubTask(updatedSubTask);
                                loadSubTasks();
                            } catch (error) {
                                console.error('Failed to add comment:', error);
                                throw error;
                            }
                        }}
                        onCategoryChange={async (categoryId: string) => {
                            if (!selectedSubTask?.id) return;
                            try {
                                await subTasksApi.patchSubTask(selectedSubTask.id, { categoryId });
                                const category = categories.find(c => c.id === categoryId);
                                setEditSubTaskForm(prev => ({
                                    ...prev,
                                    categoryId: categoryId,
                                    category: category?.categoryName || ''
                                }));
                                loadSubTasks();
                            } catch (error) {
                                console.error('Failed to change category:', error);
                            }
                        }}
                    />
                )}
            </DialogSurface>
        </Dialog>
    );
}
