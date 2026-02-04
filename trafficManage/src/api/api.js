const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get token from storage
const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Auto logout on token expiry
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API error");
  }

  return data;
}
