
// Central place for backend connection settings.
// Local development: http://localhost:5000
// Production: Vercel environment variable VITE_API_URL

const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (
  configuredApiUrl || "http://localhost:5000"
).replace(/\/+$/, "");

export const API_URL = `${API_BASE_URL}/api`;

export const SOCKET_URL = API_BASE_URL;
