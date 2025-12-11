import type { User } from '../apis/auth';
import type { Project } from '../apis/projects';
import type { Category } from '../apis/categories';
import CreateTaskDialog from './CreateTaskDialog';
import EditTaskDialog from './EditTaskDialog';

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
        assignedTo: string[];
        createdBy: string;
        category: string;
        categoryId?: string;
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
    categories?: Category[];
    isLoadingCategories?: boolean;
    categoriesError?: string | null;
    hideProjectField?: boolean;
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
    comments?: Array<{
        authorId?: string;
        user?: string;
        text?: string;
        content?: string | null;
        authorUser?: User;
        createdAt?: string;
    }>;
    taskId?: string;
    onCategoryChange?: (categoryId: string) => Promise<void> | void;
    isChangingCategory?: boolean;
}

export default function TaskDialog(props: TaskDialogProps) {
    // Convert onInputChange to individual handlers for EditTaskDialog
    const createIndividualHandlers = (onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void) => ({
        onTitleChange: (title: string) => {
            const event = {
                target: { name: 'title', value: title }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onInputChange(event);
        },
        onDescriptionChange: (description: string) => {
            const event = {
                target: { name: 'description', value: description }
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
            onInputChange(event);
        },
        onPriorityChange: (priority: string) => {
            const event = {
                target: { name: 'priority', value: priority }
            } as unknown as React.ChangeEvent<HTMLSelectElement>;
            onInputChange(event);
        },
        onStatusChange: (status: string) => {
            const event = {
                target: { name: 'status', value: status }
            } as unknown as React.ChangeEvent<HTMLSelectElement>;
            onInputChange(event);
        },
        onStartDateChange: (startDate: string) => {
            const event = {
                target: { name: 'startDate', value: startDate }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onInputChange(event);
        },
        onEndDateChange: (endDate: string) => {
            const event = {
                target: { name: 'endDate', value: endDate }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onInputChange(event);
        },
        onAssignedToChange: (assignedTo: string[]) => {
            const event = {
                target: { name: 'assignedTo', value: assignedTo.join(',') }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onInputChange(event);
        },
    });

    const handlers = createIndividualHandlers(props.onInputChange);

    if (props.dialogMode === 'edit') {
        return (
            <EditTaskDialog
                open={props.open}
                onOpenChange={props.onOpenChange}
                form={props.form}
                onTitleChange={handlers.onTitleChange}
                onDescriptionChange={handlers.onDescriptionChange}
                onPriorityChange={handlers.onPriorityChange}
                onStatusChange={handlers.onStatusChange}
                onStartDateChange={handlers.onStartDateChange}
                onEndDateChange={handlers.onEndDateChange}
                onAssignedToChange={handlers.onAssignedToChange}
                onSubmit={props.onSubmit}
                assignableUsers={props.assignableUsers}
                isLoadingAssignableUsers={props.isLoadingAssignableUsers}
                assignableUsersError={props.assignableUsersError}
                projects={props.projects}
                currentUser={props.currentUser}
                onAddComment={props.onAddComment}
                isAddingComment={props.isAddingComment}
                commentError={props.commentError}
                onDeleteClick={props.onDeleteClick}
                isSubmitting={props.isSubmitting}
                submitError={props.submitError}
                createdByUser={props.createdByUser}
                comments={props.comments}
                taskId={props.taskId}
                categories={props.categories}
                isLoadingCategories={props.isLoadingCategories}
                categoriesError={props.categoriesError}
                onCategoryChange={props.onCategoryChange}
                isChangingCategory={props.isChangingCategory}
            />
        );
    }

    return (
        <CreateTaskDialog
            open={props.open}
            onOpenChange={props.onOpenChange}
            form={props.form}
            onInputChange={props.onInputChange}
            onSubmit={props.onSubmit}
            assignableUsers={props.assignableUsers}
            isLoadingAssignableUsers={props.isLoadingAssignableUsers}
            assignableUsersError={props.assignableUsersError}
            projects={props.projects}
            isLoadingProjects={props.isLoadingProjects}
            projectsError={props.projectsError}
            categories={props.categories}
            isLoadingCategories={props.isLoadingCategories}
            categoriesError={props.categoriesError}
            hideProjectField={props.hideProjectField}
            currentUser={props.currentUser}
            isSubmitting={props.isSubmitting}
            submitError={props.submitError}
        />
    );
}
