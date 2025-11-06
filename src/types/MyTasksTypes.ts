
export type Task = {
    _id: string;
    category?: string; // API uses 'category' instead of 'categoryId'
    categoryId?: string; // Keep for backward compatibility
    assignedTo: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdAt?: string;
    comments: {
        authorId?: string; // API uses 'authorId'
        user?: string; // Keep for backward compatibility
        text: string;
        createdAt?: string;
    }[];
};

