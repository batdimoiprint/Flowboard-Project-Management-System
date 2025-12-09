import axiosInstance from './axiosInstance';

export interface Category {
    id: string;
    projectId: string;
    categoryName: string;
    createdBy: string;
}

export const categoriesApi = {
    getCategoriesByProject: async (projectId: string): Promise<Category[]> => {
        const response = await axiosInstance.get<Category[]>('/api/categories', {
            params: { projectId }
        });
        return response.data;
    },

    createCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
        const response = await axiosInstance.post<Category>('/api/categories', categoryData);
        return response.data;
    },

    updateCategory: async (categoryId: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category> => {
        const response = await axiosInstance.put<Category>(`/api/categories/${categoryId}`, categoryData);
        return response.data;
    },

    deleteCategory: async (categoryId: string): Promise<void> => {
        await axiosInstance.delete(`/api/categories/${categoryId}`);
    }
};
