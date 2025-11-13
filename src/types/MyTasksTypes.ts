import type { User } from '../components/apis/auth';

export type Task = {
    _id: string;
    category?: string; // API uses 'category' instead of 'categoryId'
    categoryId?: string; // Keep for backward compatibility
    assignedTo: string;
    assignedToUser?: User; // Resolved user object for assignedTo ID
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

