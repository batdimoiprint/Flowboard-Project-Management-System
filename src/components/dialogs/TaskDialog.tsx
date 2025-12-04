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
    if (props.dialogMode === 'edit') {
        return (
            <EditTaskDialog
                open={props.open}
                onOpenChange={props.onOpenChange}
                form={props.form}
                onInputChange={props.onInputChange}
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
