import type { User } from '../components/apis/auth';

export type Task = {
    _id: string;
    projectId?: string;
    projectName?: string; // Resolved project name for display
    category?: string; // API uses 'category' instead of 'categoryId'
    categoryId?: string; // Keep for backward compatibility
    assignedTo: string[];
    assignedToUsers?: User[]; // Resolved user objects for assignedTo IDs
    title: string;
    description: string;
    priority: string;
    status: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdByUser?: User; // Resolved user object for createdBy ID
    createdAt?: string;
    comments: {
        authorId?: string; // API uses 'authorId'
        user?: string; // Keep for backward compatibility
        text?: string; // Comment text
        content?: string | null; // Alternative field for comment text (can be null)
        authorUser?: User; // Resolved user object for author ID
        createdAt?: string;
    }[];
};

