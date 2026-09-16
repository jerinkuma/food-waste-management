// Central place for backend connection settings.
// Override in a .env file with VITE_API_URL=https://your-api.example.com
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;
