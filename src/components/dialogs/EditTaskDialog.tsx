import {
    Avatar,
    AvatarGroup, AvatarGroupItem,
    Button, Dialog, DialogSurface, DialogTitle, Divider, Dropdown, Field, Input, mergeClasses, Option, Persona, Popover, PopoverSurface, PopoverTrigger, Select, tokens, Tooltip
} from '@fluentui/react-components';
import { Calendar } from '@fluentui/react-calendar-compat';
import {
    CalendarLtr24Regular,
    Delete24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { User } from '../apis/auth';
import type { Project } from '../apis/projects';
import { mainLayoutStyles } from '../styles/Styles';

export interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
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
        comments?: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    assignableUsers?: User[];
    isLoadingAssignableUsers?: boolean;
    assignableUsersError?: string | null;
    projects?: Project[];
    currentUser?: User | null;
    onAddComment?: (text: string) => Promise<void> | void;
    isAddingComment?: boolean;
    commentError?: string | null;
    onDeleteClick?: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
    createdByUser?: User | null;
    comments?: Array<{
        authorId?: string;
        user?: string;
        text?: string;
        content?: string | null;
        authorUser?: User;
        createdAt?: string;
    }>;
    taskId?: string;
}

export default function EditTaskDialog({
    open,
    onOpenChange,
    form,
    onInputChange,
    onSubmit,
    onDeleteClick,
    isSubmitting = false,
    submitError,
    createdByUser,
    comments = [],
    taskId,
    onAddComment,
    isAddingComment = false,
    commentError = null,
    assignableUsers = [],
    isLoadingAssignableUsers = false,
    assignableUsersError = null,
    projects = [],
    currentUser = null
}: EditTaskDialogProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [newComment, setNewComment] = useState('');
    const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
    const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
    const styles = mainLayoutStyles();
    const commentContainerStyle: CSSProperties = {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        maxHeight: 300,
        overflowY: 'auto',
        marginBottom: tokens.spacingVerticalM,
    };
    const commentTextStyle: CSSProperties = {
        marginLeft: tokens.spacingHorizontalM,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground1,
    };
    const commentDateStyle: CSSProperties = {
        fontSize: tokens.fontSizeBase100,
        marginLeft: 'auto',
        color: tokens.colorNeutralForeground3,
    };

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTitle]);

    // Determine which user info to show for avatar - prefer createdByUser, fallback to currentUser
    const userInfo = createdByUser ?? currentUser ?? null;

    function handleAssignedUserSelect(_: unknown, data: { optionValue?: string | number; selectedOptions: string[] }) {
        const selectedIds = data.selectedOptions;

        const syntheticEvent = {
            target: {
                name: 'assignedTo',
                value: selectedIds,
                tagName: 'SELECT',
                type: 'select-multiple',
            },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;

        onInputChange(syntheticEvent);
    }

    function handleTitleBlur() {
        setEditingTitle(false);
    }

    function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            setEditingTitle(false);
        }
    }

    // Helper to convert YYYY-MM-DD string to Date object
    function parseFormDate(dateStr: string): Date | undefined {
        if (!dateStr) return undefined;
        const date = new Date(dateStr + 'T00:00:00');
        return isNaN(date.getTime()) ? undefined : date;
    }

    // Helper to convert Date to YYYY-MM-DD string
    function formatDateToString(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    function handleStartDateSelect(date: Date): void {
        const syntheticEvent = {
            target: {
                name: 'startDate',
                value: formatDateToString(date),
                type: 'date',
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
        setStartDatePopoverOpen(false);
    }

    function handleEndDateSelect(date: Date): void {
        const syntheticEvent = {
            target: {
                name: 'endDate',
                value: formatDateToString(date),
                type: 'date',
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(syntheticEvent);
        setEndDatePopoverOpen(false);
    }

    async function handleAddCommentLocal() {
        if (!newComment.trim() || !taskId) return;
        if (!onAddComment) return;
        try {
            await Promise.resolve(onAddComment(newComment.trim()));
            setNewComment('');
        } catch (error: unknown) {
            console.error('Failed to add comment via parent handler:', error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface style={{ minWidth: 700, maxWidth: 900, width: '90vw' }}>
                <form onSubmit={onSubmit} style={{ width: '100%' }}>
                    {/* Row 1: Delete and Cancel (Dismiss) icon buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 24, marginBottom: 8, gap: 8 }}>
                        <Tooltip content="Delete Task" relationship="label">
                            <Button
                                icon={<Delete24Regular />}
                                appearance="subtle"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onDeleteClick) {
                                        onDeleteClick();
                                    }
                                }}
                            />
                        </Tooltip>
                        <Tooltip content="Close" relationship="label">
                            <Button icon={<Dismiss24Regular />} appearance="subtle" type="button" onClick={e => { e.preventDefault(); onOpenChange(false); }} />
                        </Tooltip>
                    </div>
                    {/* Row 2: Task title, avatars, assign */}
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
                                    style={{ fontWeight: 600, fontSize: 22, padding: 0, height: 40 }}
                                />
                            ) : (
                                <DialogTitle
                                    as="h2"
                                    style={{ cursor: 'pointer', fontWeight: 600, fontSize: 22, margin: 0 }}
                                    onClick={() => setEditingTitle(true)}
                                    title="Click to edit title"
                                >
                                    {form.title || 'Edit Task'}
                                </DialogTitle>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: "flex-start", gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        {/* Created by section with avatar and name */}
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
                        <Divider vertical style={{ height: 40 }} />

                        {/* Assigned to section with avatars - show tooltip with names */}
                        {form.assignedTo && form.assignedTo.length > 0 && (
                            <>
                                <Tooltip
                                    content={form.assignedTo.map((userId) => {
                                        const user = assignableUsers.find(u => u.id === userId);
                                        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                                    }).join(', ')}
                                    relationship="label"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <AvatarGroup layout="stack">
                                            {form.assignedTo.map((userId) => {
                                                const user = assignableUsers.find(u => u.id === userId);
                                                return (
                                                    <AvatarGroupItem key={userId} name={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}>
                                                        <Avatar
                                                            name={user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                                                            image={user?.userIMG ? { src: user.userIMG } : undefined}
                                                            size={32}
                                                            color="colorful"
                                                        />
                                                    </AvatarGroupItem>
                                                );
                                            })}
                                        </AvatarGroup>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Assigned to</span>
                                            <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                                {form.assignedTo.length} member{form.assignedTo.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
                                <Divider vertical style={{ height: 40 }} />
                            </>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '0 1 auto' }}>
                            <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3, marginBottom: 4 }}>
                                Assign members
                            </span>
                            <Dropdown
                                id="assign-member-dropdown"
                                placeholder={isLoadingAssignableUsers ? 'Loading project members…' : 'Select members'}
                                style={{ minWidth: 180, maxWidth: 280 }}
                                listbox={{ style: { minWidth: 320 } }}
                                multiselect={true}
                                selectedOptions={form.assignedTo}
                                onOptionSelect={handleAssignedUserSelect}
                                disabled={isLoadingAssignableUsers || assignableUsers.length === 0}
                            >
                                {isLoadingAssignableUsers && (
                                    <Option value="loading" disabled text="Loading">
                                        Loading project members…
                                    </Option>
                                )}
                                {!isLoadingAssignableUsers && assignableUsers.length === 0 && (
                                    <Option value="no-users" disabled text="No users">
                                        No project members available
                                    </Option>
                                )}
                                {assignableUsers.map(assignableUser => (
                                    <Option key={assignableUser.id} value={assignableUser.id} text={`${assignableUser.firstName} ${assignableUser.lastName}`}>
                                        <Persona
                                            avatar={{
                                                color: 'colorful',
                                                image: assignableUser.userIMG ? { src: assignableUser.userIMG } : undefined,
                                            }}
                                            name={`${assignableUser.firstName} ${assignableUser.lastName}`}
                                            secondaryText={assignableUser.email}
                                        />
                                    </Option>
                                ))}
                            </Dropdown>
                            {assignableUsersError && (
                                <span style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100 }}>
                                    {assignableUsersError}
                                </span>
                            )}
                        </div>

                        {/* Project info display in edit mode */}
                        {form.projectId && (
                            <>
                                <Divider vertical style={{ height: 40 }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Project</span>
                                    <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                        {projects.find(p => p.id === form.projectId)?.projectName || form.projectId}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Category info display in edit mode */}
                        {form.category && (
                            <>
                                <Divider vertical style={{ height: 40 }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Category</span>
                                    <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                        {form.category}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Date info display in edit mode */}
                        {(form.startDate || form.endDate) && (
                            <>
                                <Divider vertical style={{ height: 40 }} />
                                <div style={{ display: 'flex', gap: 16 }}>
                                    {form.startDate && (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Start Date</span>
                                            <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                                {new Date(form.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {form.endDate && (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Due Date</span>
                                            <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                                {new Date(form.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Row 3: Description */}
                    <Field label="Description" style={{ marginBottom: 16 }}>
                        <Input name="description" value={form.description} onChange={onInputChange} placeholder="Build low-fidelity wireframes for the dashboard layout and task management screens." />
                    </Field>
                    {/* Row 4: Status, Priority */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Field label="Status" style={{ flex: 1 }}>
                            <Select name="status" value={form.status} onChange={onInputChange}>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </Select>
                        </Field>
                        <Field label="Priority" style={{ flex: 1 }}>
                            <Select name="priority" value={form.priority} onChange={onInputChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="Important">Important</option>
                            </Select>
                        </Field>
                    </div>
                    {/* Row 5: Start Date, End Date (Optional) with Calendar */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Field label="Start Date (Optional)" style={{ flex: 1 }}>
                            <Popover
                                open={startDatePopoverOpen}
                                onOpenChange={(_, data) => setStartDatePopoverOpen(data.open)}
                            >
                                <PopoverTrigger disableButtonEnhancement>
                                    <Input
                                        name="startDate"
                                        value={form.startDate ? new Date(form.startDate + 'T00:00:00').toLocaleDateString() : ''}
                                        placeholder="Select start date"
                                        readOnly
                                        contentAfter={<CalendarLtr24Regular style={{ cursor: 'pointer' }} />}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </PopoverTrigger>
                                <PopoverSurface>
                                    <Calendar
                                        showSixWeeksByDefault
                                        showGoToToday
                                        onSelectDate={handleStartDateSelect}
                                        value={parseFormDate(form.startDate)}
                                    />
                                </PopoverSurface>
                            </Popover>
                        </Field>
                        <Field label="Due Date (Optional)" style={{ flex: 1 }}>
                            <Popover
                                open={endDatePopoverOpen}
                                onOpenChange={(_, data) => setEndDatePopoverOpen(data.open)}
                            >
                                <PopoverTrigger disableButtonEnhancement>
                                    <Input
                                        name="endDate"
                                        value={form.endDate ? new Date(form.endDate + 'T00:00:00').toLocaleDateString() : ''}
                                        placeholder="Select due date"
                                        readOnly
                                        contentAfter={<CalendarLtr24Regular style={{ cursor: 'pointer' }} />}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </PopoverTrigger>
                                <PopoverSurface>
                                    <Calendar
                                        showSixWeeksByDefault
                                        showGoToToday
                                        onSelectDate={handleEndDateSelect}
                                        value={parseFormDate(form.endDate)}
                                        minDate={parseFormDate(form.startDate)}
                                    />
                                </PopoverSurface>
                            </Popover>
                        </Field>
                    </div>
                    {/* Row 6: Comments */}
                    <Field label="Comments" style={{ marginBottom: 16 }}>
                        {/* Existing Comments */}
                        {comments && comments.length > 0 && (
                            <div style={commentContainerStyle}>
                                {comments.map((comment, index) => {
                                    const commentText = comment.text || comment.content || '';
                                    const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
                                    const formattedDate = commentDate && !isNaN(commentDate.getTime())
                                        ? commentDate.toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '';

                                    return (
                                        <div key={index} style={{ marginBottom: index < comments.length - 1 ? tokens.spacingVerticalM : 0, paddingBottom: index < comments.length - 1 ? tokens.spacingVerticalM : 0, borderBottom: index < comments.length - 1 ? `1px solid ${tokens.colorNeutralStroke2}` : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalXS }}>
                                                <Avatar
                                                    name={comment.authorUser ? `${comment.authorUser.firstName} ${comment.authorUser.lastName}` : 'User'}
                                                    size={24}
                                                    color="colorful"
                                                    image={comment.authorUser?.userIMG ? { src: comment.authorUser.userIMG } : undefined}
                                                />
                                                <span style={{ color: tokens.colorBrandForegroundLink }}>
                                                    {comment.authorUser ? `${comment.authorUser.firstName} ${comment.authorUser.lastName}` : 'User'}
                                                </span>
                                                {formattedDate && (
                                                    <span style={commentDateStyle}>
                                                        {formattedDate}
                                                    </span>
                                                )}
                                            </div>
                                            {commentText && (
                                                <div style={commentTextStyle}>
                                                    {commentText}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <Divider className={styles.layoutPadding} />
                                {/* Add New Comment */}
                                <div className={mergeClasses(styles.flexRowFill, styles.spaceBetween, styles.layoutPadding)}>
                                    <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    {commentError && (
                                        <div style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>
                                            {commentError}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            appearance="primary"
                                            size="small"
                                            onClick={handleAddCommentLocal}
                                            disabled={!newComment.trim() || isAddingComment}
                                        >
                                            {isAddingComment ? 'Adding...' : 'Add Comment'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* If no comments, still show add comment input */}
                        {(!comments || comments.length === 0) && (
                            <div className={mergeClasses(styles.flexRowFill, styles.spaceBetween, styles.layoutPadding)}>
                                <Input
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                {commentError && (
                                    <div style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>
                                        {commentError}
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        appearance="primary"
                                        size="small"
                                        onClick={handleAddCommentLocal}
                                        disabled={!newComment.trim() || isAddingComment}
                                    >
                                        {isAddingComment ? 'Adding...' : 'Add Comment'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Field>
                    {/* Error message */}
                    {submitError && (
                        <div style={{ color: 'red', marginTop: 8 }}>
                            {submitError}
                        </div>
                    )}
                    {/* Submit button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Button
                            type="submit"
                            appearance="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Close'}
                        </Button>
                    </div>
                </form>
            </DialogSurface>
        </Dialog>
    );
}
