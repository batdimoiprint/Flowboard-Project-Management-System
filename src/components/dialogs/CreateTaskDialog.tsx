import {
    Avatar,
    AvatarGroup, AvatarGroupItem,
    Button, Dialog, DialogSurface, DialogTitle, Divider, Dropdown, Field, Input, Option, Persona, Popover, PopoverSurface, PopoverTrigger, Select, tokens, Tooltip
} from '@fluentui/react-components';
import { Calendar } from '@fluentui/react-calendar-compat';
import {
    CalendarLtr24Regular,
    Dismiss24Regular
} from '@fluentui/react-icons';
import { useState, useRef, useEffect } from 'react';
import type { User } from '../apis/auth';
import type { Project } from '../apis/projects';
import type { Category } from '../apis/categories';

export interface CreateTaskDialogProps {
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
        mainTaskId?: string | null;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    assignableUsers?: User[];
    projects?: Project[];
    // Optional list of main tasks to attach the subtask to
    mainTasks?: { id: string; title: string }[];
    isLoadingMainTasks?: boolean;
    mainTasksError?: string | null;
    hideMainTaskField?: boolean;
    isLoadingProjects?: boolean;
    projectsError?: string | null;
    categories?: Category[];
    isLoadingCategories?: boolean;
    categoriesError?: string | null;
    hideProjectField?: boolean;
    isLoadingAssignableUsers?: boolean;
    assignableUsersError?: string | null;
    currentUser?: User | null;
    isSubmitting?: boolean;
    submitError?: string | null;
}

export default function CreateTaskDialog({
    open,
    onOpenChange,
    form,
    onInputChange,
    onSubmit,
    isSubmitting = false,
    submitError,
    assignableUsers = [],
    isLoadingAssignableUsers = false,
    assignableUsersError = null,
    projects = [],
    isLoadingProjects = false,
    projectsError = null,
    categories = [],
    isLoadingCategories = false,
    categoriesError = null,
    hideProjectField = false,
    mainTasks = [],
    isLoadingMainTasks = false,
    mainTasksError = null,
    hideMainTaskField = false,
    currentUser = null
}: CreateTaskDialogProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
    const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTitle]);

    // Determine which user info to show for avatar - default to currentUser for creation
    const userInfo = currentUser ?? null;

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

    return (
        <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
            <DialogSurface style={{ minWidth: 700, maxWidth: 900, width: '90vw' }}>
                <form onSubmit={onSubmit} style={{ width: '100%' }}>
                    {/* Row 1: Close icon button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 24, marginBottom: 8, gap: 8 }}>
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
                                    {form.title || 'Create Task'}
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
                            <Dropdown
                                id="assign-member-dropdown"
                                placeholder={isLoadingAssignableUsers ? 'Loading users…' : 'Select members'}
                                style={{ minWidth: 180, maxWidth: 280 }}
                                listbox={{ style: { minWidth: 320 } }}
                                multiselect={true}
                                selectedOptions={form.assignedTo}
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
                    {/* Row 4: Project (conditional), Category, Status, Priority */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        {!hideProjectField && (
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
                        )}
                        {!hideMainTaskField && (
                            <Field label="Main Task" style={{ flex: 1 }}>
                                <Select name="mainTaskId" value={form.mainTaskId || ''} onChange={onInputChange} disabled={isLoadingMainTasks || !(mainTasks && mainTasks.length > 0)}>
                                    <option value="">{isLoadingMainTasks ? 'Loading main tasks…' : 'Select main task'}</option>
                                    {!isLoadingMainTasks && (!mainTasks || mainTasks.length === 0) && (
                                        <option value="" disabled>No main tasks available</option>
                                    )}
                                    {!isLoadingMainTasks && mainTasks && mainTasks.map(mt => (
                                        <option key={mt.id} value={mt.id}>{mt.title}</option>
                                    ))}
                                </Select>
                                {mainTasksError && (
                                    <span style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100 }}>
                                        {mainTasksError}
                                    </span>
                                )}
                            </Field>
                        )}
                        <Field label="Category" style={{ flex: 1 }}>
                            <Select name="category" value={form.category} onChange={onInputChange} disabled={isLoadingCategories || (categories.length === 0 && !hideProjectField && !form.projectId)}>
                                <option value="">{isLoadingCategories ? 'Loading categories…' : 'Select category'}</option>
                                {!isLoadingCategories && categories.length === 0 && (
                                    <option value="" disabled>No categories available</option>
                                )}
                                {!isLoadingCategories && categories.map(cat => (
                                    <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
                                ))}
                            </Select>
                            {categoriesError && (
                                <span style={{ color: tokens.colorPaletteRedForeground3, fontSize: tokens.fontSizeBase100 }}>
                                    {categoriesError}
                                </span>
                            )}
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
                            {isSubmitting ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </DialogSurface>
        </Dialog>
    );
}
