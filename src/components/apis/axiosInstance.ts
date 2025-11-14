import axios from 'axios';

// export const API_BASE_URL = "https://flowboard-backend.azurewebsites.net/";
export const API_BASE_URL = "http://localhost:5158/";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token if available
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('flowboard_token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
