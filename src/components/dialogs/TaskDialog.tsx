import {
    Avatar,

    // AvatarGroup, AvatarGroupItem, AvatarGroupPopover, 


    Button, Dialog, DialogSurface, DialogTitle, Divider, Dropdown, Field, Input, mergeClasses, Option, Persona, Select, tokens, Tooltip
} from '@fluentui/react-components';
import {
    //  AddCircle32Filled,
    Delete24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { User } from '../apis/auth';
import type { Project } from '../apis/projects';
import { mainLayoutStyles } from '../styles/Styles';


export interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: {
        title: string;
        description: string;
        priority: string;
        status: string;
        startDate: string;
        endDate: string;
        assignedTo: string;
        createdBy: string;
        category: string; // Changed from categoryId to match API
        projectId?: string | null;
        comments?: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    avatars?: Array<{ name: string; image?: string }>;
    onAssignClick?: () => void;
    assignableUsers?: User[];
    projects?: Project[];
    isLoadingProjects?: boolean;
    projectsError?: string | null;
    isLoadingAssignableUsers?: boolean;
    assignableUsersError?: string | null;
    currentUser?: User | null;
    onAddComment?: (text: string) => Promise<void> | void;
    isAddingComment?: boolean;
    commentError?: string | null;
    onDeleteClick?: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
    dialogMode?: 'add' | 'edit';
    createdByUser?: User | null;
    // assignedToUser removed; use form.assignedTo with assignableUsers for display if needed
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
export default function TaskDialog({ open, onOpenChange, form, onInputChange, onSubmit,
    onAssignClick, onDeleteClick, isSubmitting = false, submitError, dialogMode = 'add', createdByUser, comments = [], taskId, onAddComment, isAddingComment = false, commentError = null, assignableUsers = [], isLoadingAssignableUsers = false, assignableUsersError = null, projects = [], isLoadingProjects = false, projectsError = null, currentUser = null }: TaskDialogProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [newComment, setNewComment] = useState('');
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

    // Assignable users, loading state and errors will be handled by parent and passed in via props.

    // parent should include currentUser in assignableUsers if desired

    // parent should include assignedToUser in assignableUsers if desired

    function handleAssignedUserSelect(_: unknown, data: { optionValue?: string | number }) {
        const selectedId = typeof data.optionValue === 'string' ? data.optionValue : null;
        if (!selectedId) {
            return;
        }

        const syntheticEvent = {
            target: {
                name: 'assignedTo',
                value: selectedId,
                tagName: 'SELECT',
                type: 'select-one',
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

    async function handleAddCommentLocal() {
        if (!newComment.trim() || !taskId) return;
        if (!onAddComment) return;
        try {
            await Promise.resolve(onAddComment(newComment.trim()));
            setNewComment('');
        } catch (error: unknown) {
            console.error('Failed to add comment via parent handler:', error);
            // parent is responsible for passing commentError if needed
        }
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface>
                <form onSubmit={onSubmit} style={{ minWidth: "auto", maxWidth: 1000 }}>
                    {/* Row 1: Delete and Cancel (Dismiss) icon buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 24, marginBottom: 8, gap: 8 }}>
                        {dialogMode === 'edit' && (
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
                        )}
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
                                    {form.title || 'Create Task'}
                                </DialogTitle>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: "left", gap: 16, marginBottom: 16 }}>
                        <Avatar
                            name={userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}
                            size={32}
                            color="colorful"
                            image={userInfo?.userIMG ? { src: userInfo.userIMG } : undefined}
                        />
                        <span style={{ fontWeight: 500 }}>{userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User'}</span>
                        <Divider vertical style={{ height: "100%" }} />
                        {/* 
                        <AvatarGroup layout="stack">
                            {inlineItems.map((a, i) => (
                                <AvatarGroupItem key={a.name || i}>
                                    <Avatar
                                        name={a.name}
                                        image={('image' in a && typeof a.image === 'string') ? { src: a.image } : undefined}
                                        size={32}
                                    />
                                </AvatarGroupItem>
                            ))}
                            {overflowItems.length > 0 && (
                                <AvatarGroupPopover>
                                    {overflowItems.map((a, i) => (
                                        <AvatarGroupItem key={a.name || i}>
                                            <Avatar
                                                name={a.name}
                                                image={('image' in a && typeof a.image === 'string') ? { src: a.image } : undefined}
                                                size={32}
                                            />
                                        </AvatarGroupItem>
                                    ))}
                                </AvatarGroupPopover>
                            )}
                        </AvatarGroup>
                        <Divider vertical style={{ height: "100%" }} /> */}
                        <Button
                            appearance="transparent"
                            aria-label="Add member"
                            style={{
                                width: 40,
                                height: 40,
                                minWidth: 40,
                                minHeight: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                borderRadius: '50%',
                            }}
                            onClick={onAssignClick}
                        >
                            {/* <AddCircle32Filled /> */}
                        </Button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Dropdown
                                id="assign-member-dropdown"
                                placeholder={isLoadingAssignableUsers ? 'Loading users…' : 'Select a member'}
                                style={{ minWidth: 220 }}
                                selectedOptions={form.assignedTo ? [form.assignedTo] : []}
                                onOptionSelect={handleAssignedUserSelect}
                                disabled={isLoadingAssignableUsers || assignableUsers.length === 0}
                            >
                                {isLoadingAssignableUsers && (
                                    <Option value="loading" disabled text="Loading">
                                        Loading users…
                                    </Option>
                                )}
                                {!isLoadingAssignableUsers && assignableUsers.length === 0 && (
                                    <Option value="no-users" disabled text="No users">
                                        No users available
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
                    </div>
                    {/* Row 3: Description */}
                    <Field label="Description" style={{ marginBottom: 16 }}>
                        <Input name="description" value={form.description} onChange={onInputChange} placeholder="Build low-fidelity wireframes for the dashboard layout and task management screens." />
                    </Field>
                    {/* Row 4: Category, Status, Priority */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Field label="Project" style={{ flex: 1 }}>
                            <Select name="projectId" value={form.projectId || ''} onChange={onInputChange} disabled={isLoadingProjects || projects.length === 0}>
                                <option value="">{isLoadingProjects ? 'Loading projects…' : 'Select project'}</option>
                                {!isLoadingProjects && projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.projectName}</option>
                                ))}
                            </Select>
                            {projectsError && (
                                <span style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100 }}>
                                    {projectsError}
                                </span>
                            )}
                        </Field>
                        <Field label="Category" style={{ flex: 1 }}>
                            <Select name="category" value={form.category} onChange={onInputChange}>
                                <option value="">Select category</option>
                                <option value="design">Design</option>
                                <option value="development">Development</option>
                                <option value="testing">Testing</option>
                            </Select>
                        </Field>
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
                    {/* Row 5: Start Date, End Date */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Field label="Start Date" style={{ flex: 1 }}>
                            <Input name="startDate" type="date" value={form.startDate} onChange={onInputChange} />
                        </Field>
                        <Field label="Due Date" style={{ flex: 1 }}>
                            <Input name="endDate" type="date" value={form.endDate} onChange={onInputChange} />
                        </Field>
                    </div>
                    {/* Row 6: Comments */}
                    {dialogMode === 'edit' && (
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




                        </Field>
                    )}
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
                            {isSubmitting
                                ? (dialogMode === 'edit' ? 'Updating...' : 'Creating...')
                                : (dialogMode === 'edit' ? 'Close' : 'Create Task')
                            }
                        </Button>
                    </div>
                </form>
            </DialogSurface>
        </Dialog>
    );
}
