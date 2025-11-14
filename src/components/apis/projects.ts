import axiosInstance from './axiosInstance';

export interface Project {
    id: string;
    projectName: string;
    description: string;
    teamMembers: string[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    permissions?: Record<string, string>;
}

export interface CreateProjectRequest {
    projectName: string;
    description: string;
    teamMembers: string[];
}

export interface UpdateProjectRequest {
    projectName: string;
    description: string;
    teamMembers: string[];
}

export const projectsApi = {
    getAllProjects: async (): Promise<Project[]> => {
        const response = await axiosInstance.get<Project[]>('/api/projects');
        return response.data;
    },

    getProjectById: async (projectId: string): Promise<Project> => {
        const response = await axiosInstance.get<Project>(`/api/projects/${projectId}`);
        return response.data;
    },

    createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
        const response = await axiosInstance.post<Project>('/api/projects', projectData);
        return response.data;
    },

    updateProject: async (projectId: string, projectData: UpdateProjectRequest): Promise<Project> => {
        const response = await axiosInstance.put<Project>(`/api/projects/${projectId}`, projectData);
        return response.data;
    },

    deleteProject: async (projectId: string): Promise<void> => {
        await axiosInstance.delete(`/api/projects/${projectId}`);
    },
};
