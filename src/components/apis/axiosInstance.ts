import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "https://flowboard-backend.azurewebsites.net/",
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
