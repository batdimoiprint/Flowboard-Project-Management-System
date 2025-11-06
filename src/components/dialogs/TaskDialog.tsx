import {
    Avatar,

    // AvatarGroup, AvatarGroupItem, AvatarGroupPopover, 


    Button, Dialog, DialogSurface, DialogTitle, Divider, Dropdown, Field, Input, Option, Persona, Select, Textarea, Tooltip
} from '@fluentui/react-components';
import {
    //  AddCircle32Filled,
    Delete24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../hooks/useUser';


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
        comments?: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    avatars?: Array<{ name: string; image?: string }>;
    onAssignClick?: () => void;
    onDeleteClick?: () => void;
    isSubmitting?: boolean;
    submitError?: string | null;
    dialogMode?: 'add' | 'edit';
}
export default function TaskDialog({ open, onOpenChange, form, onInputChange, onSubmit,
    // avatars = [], 

    onAssignClick, onDeleteClick, isSubmitting = false, submitError, dialogMode = 'add' }: TaskDialogProps) {
    const { user } = useUser();
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTitle]);

    function handleTitleBlur() {
        setEditingTitle(false);
    }

    function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            setEditingTitle(false);
        }
    }

    // Demo fallback names if avatars prop is empty
    // const names = [
    //     "Johnie McConnell",
    //     "Allan Munger",
    //     "Erik Nason",
    //     "Kristin Patterson",
    //     "Daisy Phillips",
    //     "Carole Poland",
    //     "Carlos Slattery",
    //     "Robert Tolbert",
    //     "Kevin Sturgis",
    //     "Charlotte Waltson",
    //     "Elliot Woodward",
    // ];
    // const avatarList = avatars.length > 0 ? avatars : names.map(n => ({ name: n }));
    // Show up to 4 inline, rest in popover
    // const inlineItems = avatarList.slice(0, 3);
    // const overflowItems = avatarList.length > 4 ? avatarList.slice(4) : [];

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
                        <Avatar name={form.createdBy || 'User'} size={32} />
                        <span style={{ fontWeight: 500 }}>{'John Kenny Reyes'}</span>
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

                        <Dropdown
                            id="assign-member-dropdown"
                            placeholder="Assign to me"
                            value={user ? `${user.firstName} ${user.lastName}` : 'Me'}
                            style={{ minWidth: 180 }}
                            disabled
                        >
                            <Option text={user ? `${user.firstName} ${user.lastName}` : 'Me'}>
                                <Persona
                                    avatar={{
                                        color: "colorful",
                                        "aria-hidden": true,
                                        image: user?.userIMG ? { src: user.userIMG } : undefined
                                    }}
                                    name={user ? `${user.firstName} ${user.lastName}` : 'Me'}
                                    presence={{ status: "available" }}
                                    secondaryText="You"
                                />
                            </Option>
                        </Dropdown>
                    </div>
                    {/* Row 3: Description */}
                    <Field label="Description" style={{ marginBottom: 16 }}>
                        <Textarea name="description" value={form.description} onChange={onInputChange} placeholder="Build low-fidelity wireframes for the dashboard layout and task management screens." />
                    </Field>
                    {/* Row 4: Category, Status, Priority */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
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
                    {/* <Field label="Comments">
                        <Textarea name="comments" value={form.comments || ''} onChange={onInputChange} placeholder="Add any comments..." />
                    </Field> */}
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
