import {
    Avatar,
    AvatarGroup, AvatarGroupItem,
    Button, Dialog, DialogSurface, DialogTitle, Divider, Dropdown, Field, Input,
    // Label,
    Option, Persona, Popover, PopoverSurface, PopoverTrigger, Select, tokens, Tooltip
} from '@fluentui/react-components';
import { Calendar } from '@fluentui/react-calendar-compat';
import {
    CalendarLtr24Regular,
    Delete24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { User } from '../apis/auth';
import type { Project } from '../apis/projects';
import type { Category } from '../apis/categories';

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
        categoryId?: string;
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
    categories?: Category[];
    isLoadingCategories?: boolean;
    categoriesError?: string | null;
    onCategoryChange?: (categoryId: string) => Promise<void> | void;
    isChangingCategory?: boolean;
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
    assignableUsers = [],
    isLoadingAssignableUsers = false,
    assignableUsersError = null,
    projects = [],
    currentUser = null,
    categories = [],
    isLoadingCategories = false,
    categoriesError = null,
    onCategoryChange,
    isChangingCategory = false
}: EditTaskDialogProps) {
    const location = useLocation();
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
    const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
    const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
    const isHomePage = location.pathname === '/home';

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

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface style={{ minWidth: 700, maxWidth: 900, width: '90vw' }}>
                {/* <Label style={{ fontWeight: 'bold', fontSize: '20px' }}>Subtask</Label> */}
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
                                    style={{ fontWeight: 600, fontSize: 22, padding: 0, height: 40, width: '100%' }}
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

                        {/* Combined Assigned to section with avatars and dropdown */}
                        <Popover
                            open={assignDropdownOpen}
                            onOpenChange={(_, data) => setAssignDropdownOpen(data.open)}
                        >
                            <PopoverTrigger disableButtonEnhancement>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    {form.assignedTo && form.assignedTo.length > 0 ? (
                                        <Tooltip
                                            content={form.assignedTo.map((userId) => {
                                                const user = assignableUsers.find(u => u.id === userId);
                                                return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
                                            }).join(', ')}
                                            relationship="label"
                                        >
                                            <div>
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
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <Avatar
                                            name="Unassigned"
                                            size={32}
                                            color="neutral"
                                            icon={<span style={{ fontSize: 18 }}>+</span>}
                                        />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>
                                            {form.assignedTo && form.assignedTo.length > 0 ? 'Assigned to' : 'Assign members'}
                                        </span>
                                        <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: 500 }}>
                                            {form.assignedTo && form.assignedTo.length > 0
                                                ? `${form.assignedTo.length} member${form.assignedTo.length !== 1 ? 's' : ''}`
                                                : 'Click to assign'}
                                        </span>
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverSurface>
                                <div style={{ padding: tokens.spacingVerticalM, minWidth: 320, maxWidth: 400 }}>
                                    <div style={{ marginBottom: tokens.spacingVerticalS, fontWeight: tokens.fontWeightSemibold }}>
                                        Assign members
                                    </div>
                                    <Dropdown
                                        id="assign-member-dropdown"
                                        placeholder={isLoadingAssignableUsers ? 'Loading…' : 'Select members'}
                                        style={{ width: '100%' }}
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
                                        <div style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100, marginTop: tokens.spacingVerticalXS }}>
                                            {assignableUsersError}
                                        </div>
                                    )}
                                </div>
                            </PopoverSurface>
                        </Popover>

                        {/* Project info display in edit mode - only show on /home page */}
                        {isHomePage && form.projectId && (
                            <>
                                <Divider vertical style={{ height: 40 }} />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 200 }}>
                                    <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>Project</span>
                                    <span style={{
                                        fontSize: tokens.fontSizeBase300,
                                        fontWeight: 500,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {projects.find(p => p.id === form.projectId)?.projectName || form.projectId}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Category dropdown for changing task category */}
                        <>
                            <Divider vertical style={{ height: 40 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: '0 1 auto' }}>
                                <span style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3, marginBottom: 4 }}>
                                    Category
                                </span>
                                <Dropdown
                                    id="category-dropdown"
                                    placeholder={isLoadingCategories ? 'Loading categories…' : 'Select category'}
                                    style={{ minWidth: 150, maxWidth: 220 }}
                                    listbox={{ style: { minWidth: 200 } }}
                                    selectedOptions={form.categoryId ? [form.categoryId] : (form.category ? [categories.find(c => c.categoryName === form.category)?.id || ''] : [])}
                                    value={form.category || categories.find(c => c.id === form.categoryId)?.categoryName || ''}
                                    onOptionSelect={(_event, data) => {
                                        const selectedCategoryId = data.optionValue as string;
                                        if (selectedCategoryId && selectedCategoryId !== 'loading' && selectedCategoryId !== 'no-categories' && onCategoryChange) {
                                            onCategoryChange(selectedCategoryId);
                                        }
                                    }}
                                    disabled={isLoadingCategories || categories.length === 0 || isChangingCategory}
                                >
                                    {isLoadingCategories && (
                                        <Option value="loading" disabled text="Loading">
                                            Loading categories…
                                        </Option>
                                    )}
                                    {!isLoadingCategories && categories.length === 0 && (
                                        <Option value="no-categories" disabled text="No categories">
                                            No categories available
                                        </Option>
                                    )}
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id} text={cat.categoryName}>
                                            {cat.categoryName}
                                        </Option>
                                    ))}
                                </Dropdown>
                                {categoriesError && (
                                    <span style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100 }}>
                                        {categoriesError}
                                    </span>
                                )}
                            </div>
                        </>


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
                                        value={form.startDate ? (parseFormDate(form.startDate)?.toLocaleDateString() || '') : ''}
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
                                        value={form.endDate ? (parseFormDate(form.endDate)?.toLocaleDateString() || '') : ''}
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
