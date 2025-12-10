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
    teamMembers?: string[];
}

export interface UpdateProjectRequest {
    projectName: string;
    description: string;
    teamMembers: string[];
}

export interface ProjectMembersRequest {
    teamMembers: string[];
}

export interface ProjectMemberRemovalRequest {
    teamMembers: string | string[];
}

export interface ProjectMember {
    id: string;
    userName: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    userIMG?: string;
    role: string;
}

export const projectsApi = {
    getAllProjects: async (): Promise<Project[]> => {
        const response = await axiosInstance.get<Project[]>('/api/projects');
        return response.data;
    },

    getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
        const response = await axiosInstance.get<ProjectMember[]>(`/api/projects/${projectId}/members`);
        return response.data;
    },

    // Dedicated endpoint for UI selects; ensures we always hit the production host
    getProjectsForSelect: async (): Promise<Project[]> => {
        const response = await axiosInstance.get<Project[]>('https://flowboard-backend.azurewebsites.net/api/projects');
        return response.data;
    },

    getProjectById: async (projectId: string): Promise<Project> => {
        const response = await axiosInstance.get<Project>(`/api/projects/${projectId}`);
        return response.data;
    },

    getProjectsByUser: async (userId: string): Promise<Project[]> => {
        const response = await axiosInstance.get<Project[]>(`/api/projects/${userId}`);
        return response.data;
    },

    getProjectsAsMember: async (): Promise<Project[]> => {
        const response = await axiosInstance.get<Project[]>('/api/projects/member/all');
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

    addProjectMembers: async (projectId: string, memberIds: string[]): Promise<Project> => {
        const payload: ProjectMembersRequest = { teamMembers: memberIds };
        const response = await axiosInstance.post<Project>(`/api/projects/${projectId}/member`, payload);
        return response.data;
    },

    removeProjectMembers: async (projectId: string, memberIds: string | string[]): Promise<Project> => {
        const payload: ProjectMemberRemovalRequest = { teamMembers: memberIds };
        const response = await axiosInstance.delete<Project>(`/api/projects/${projectId}/member`, { data: payload });
        return response.data;
    },

    leaveProject: async (projectId: string): Promise<Project> => {
        const response = await axiosInstance.delete<Project>(`/api/projects/${projectId}/leave`);
        return response.data;
    },

    updateProjectMemberPermissions: async (projectId: string, userId: string, role: string): Promise<Project> => {
        const response = await axiosInstance.put<Project>(`/api/projects/${projectId}/member/${userId}/permissions`, { role });
        return response.data;
    },
};
