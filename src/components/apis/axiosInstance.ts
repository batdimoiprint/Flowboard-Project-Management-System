import axios from 'axios';

// export const API_BASE_URL = "https://flowboard-backend.azurewebsites.net/";
export const API_BASE_URL = "http://localhost:5158/";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // Include credentials to allow sending/receiving HttpOnly cookies set by the backend (for auth)
    withCredentials: true,
});

// We now rely on an HttpOnly cookie for authentication token, so the client should not
// manually attach an Authorization header. The backend should issue a cookie and verify it.
// If the application still needs to attach a header for a specific reason, do so explicitly
// in that caller instead of here.

export default axiosInstance;
