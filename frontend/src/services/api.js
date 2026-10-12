const API_BASE = '/api';

export const getCitizenToken = () => localStorage.getItem('citizen_token');
export const setCitizenToken = (token) => {
  if (token) localStorage.setItem('citizen_token', token);
  else localStorage.removeItem('citizen_token');
};

export const getAdminToken = () => localStorage.getItem('admin_token');
export const setAdminToken = (token) => {
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
};

export const getCitizenUser = () => {
  try {
    return JSON.parse(localStorage.getItem('citizen_user')) || null;
  } catch {
    return null;
  }
};
export const setCitizenUser = (user) => {
  if (user) localStorage.setItem('citizen_user', JSON.stringify(user));
  else localStorage.removeItem('citizen_user');
};

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('admin_user')) || null;
  } catch {
    return null;
  }
};
export const setAdminUser = (admin) => {
  if (admin) localStorage.setItem('admin_user', JSON.stringify(admin));
  else localStorage.removeItem('admin_user');
};

async function request(endpoint, options = {}, isAdmin = false) {
  const url = `${API_BASE}${endpoint}`;
  const token = isAdmin ? getAdminToken() : getCitizenToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Citizen Auth
  citizenRegister: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  citizenLogin: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  citizenLogout: () => request('/auth/logout', { method: 'POST' }),
  citizenForgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  getCitizenProfile: () => request('/user/profile'),
  updateCitizenProfile: (payload) => request('/user/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  // Citizen Complaints & Notifications
  submitComplaint: (payload) => request('/complaints', { method: 'POST', body: JSON.stringify(payload) }),
  getUserComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/user/complaints${query ? `?${query}` : ''}`);
  },
  getComplaintDetail: (id, isAdmin = false) => request(`/complaints/${id}`, {}, isAdmin),
  predictGrievance: (payload) => request('/predict', { method: 'POST', body: JSON.stringify(payload) }),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Admin Auth
  adminLogin: (payload) => request('/admin/login', { method: 'POST', body: JSON.stringify(payload) }, true),
  adminLogout: () => request('/admin/logout', { method: 'POST' }, true),
  adminForgotPassword: (payload) => request('/admin/forgot-password', { method: 'POST', body: JSON.stringify(payload) }, true),
  getAdminProfile: () => request('/admin/profile', {}, true),
  updateAdminProfile: (payload) => request('/admin/profile', { method: 'PUT', body: JSON.stringify(payload) }, true),

  // Admin Operations
  getAdminComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/complaints${query ? `?${query}` : ''}`, {}, true);
  },
  getPriorityQueue: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/priority-queue${query ? `?${query}` : ''}`, {}, true);
  },
  updateComplaintStatus: (id, payload) => request(`/admin/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }, true),
  assignDepartment: (id, payload) => request(`/admin/complaints/${id}/assign`, { method: 'PUT', body: JSON.stringify(payload) }, true),
  getAnalytics: () => request('/admin/analytics', {}, true),
  getDepartments: () => request('/admin/departments', {}, true),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`, {}, true);
  },
  toggleUserStatus: (id, payload) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }, true),
  getReports: () => request('/admin/reports', {}, true),
  getAdminNotifications: () => request('/admin/notifications', {}, true),
  getCSVExportUrl: () => `${API_BASE}/admin/reports/export/csv`,

  // Geocoding & Location
  reverseGeocode: (lat, lon) => request(`/geocode/reverse?lat=${lat}&lon=${lon}`),
  searchLocations: (q) => request(`/geocode/search?q=${encodeURIComponent(q)}`),
};
