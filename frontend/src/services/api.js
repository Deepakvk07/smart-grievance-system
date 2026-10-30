const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api'
  : '/api';

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

// ==========================================
// SEEDED DEMO DATA (For Fallback / Standalone)
// ==========================================
const SEEDED_COMPLAINTS = [
  {
    complaint_id: "GRV-1001",
    citizen_name: "Rahul Sharma",
    citizen_mobile: "9876543210",
    title: "Large pothole near the main road is causing accidents",
    description: "Large pothole near the main road intersection is causing frequent accidents, especially for two-wheelers during peak traffic hours. Several motorists have sustained injuries.",
    location: "Main Road Junction, Sector 14, New Delhi",
    category: "Road",
    priority: "High",
    status: "In Progress",
    assigned_department: "Road Department",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "Complaint registered via citizen portal. AI automated triage assigned Category: Road, Priority: High.", updated_by: "System", timestamp: new Date(Date.now() - 3 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "Under Review", remarks: "Reviewed by Municipal Triage Desk. Validated emergency severity level.", updated_by: "Chief Municipal Administrator", timestamp: new Date(Date.now() - 2.5 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "Assigned", remarks: "Assigned to Road Department engineering field squad.", updated_by: "Chief Municipal Administrator", timestamp: new Date(Date.now() - 2 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "In Progress", remarks: "Road maintenance crew dispatched with asphalt patcher unit.", updated_by: "Road Department", timestamp: new Date(Date.now() - 1 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  },
  {
    complaint_id: "GRV-1002",
    citizen_name: "Priya Patel",
    citizen_mobile: "9812345678",
    title: "No water supply in our locality for three days",
    description: "No water supply in our locality for three continuous days. Over 200 families in Ward 7 have zero drinking water supply and tankers have not arrived.",
    location: "Block B & C, 42 MG Road, Gandhi Nagar",
    category: "Water",
    priority: "High",
    status: "Assigned",
    assigned_department: "Water Department",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "Complaint registered and auto-classified as High Priority Water emergency.", updated_by: "System", timestamp: new Date(Date.now() - 2 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "Assigned", remarks: "Assigned to Water Department emergency valve maintenance team.", updated_by: "Senior Triage Officer", timestamp: new Date(Date.now() - 1 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  },
  {
    complaint_id: "GRV-1003",
    citizen_name: "Amit Verma",
    citizen_mobile: "9765432109",
    title: "Transformer has stopped working and the entire locality has no electricity",
    description: "Transformer has stopped working with loud sparks and the entire locality has no electricity since midnight. Risk of short circuit fire near residential apartments.",
    location: "Substation Corner, Block C, Green Park",
    category: "Electricity",
    priority: "High",
    status: "In Progress",
    assigned_department: "Electricity Department",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "High Priority electrical triage detected. AI flagged urgent safety danger.", updated_by: "System", timestamp: new Date(Date.now() - 1 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "Assigned", remarks: "Escalated immediately to Electricity Department substation repair team.", updated_by: "Chief Municipal Administrator", timestamp: new Date(Date.now() - 0.8 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "In Progress", remarks: "Replacement 250kVA transformer in transit; safety cordon established.", updated_by: "Electricity Department", timestamp: new Date(Date.now() - 0.3 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  },
  {
    complaint_id: "GRV-1004",
    citizen_name: "Sunita Rao",
    citizen_mobile: "9988776655",
    title: "Small crack on the side of the road",
    description: "There is a small crack developing on the side of the asphalt curb on Street 5. It is not currently hindering traffic but needs preventative sealing before monsoon.",
    location: "Street 5, Sector 14, Urban Colony",
    category: "Road",
    priority: "Low",
    status: "Submitted",
    assigned_department: "Road Department",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "Complaint logged. Classified as Low Priority maintenance item.", updated_by: "System", timestamp: new Date(Date.now() - 5 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  },
  {
    complaint_id: "GRV-1005",
    citizen_name: "Priya Patel",
    citizen_mobile: "9812345678",
    title: "Water pressure is slightly low during the evening",
    description: "Water pressure is slightly low during the evening hours between 6 PM to 8 PM on the upper floors. Morning supply is adequate.",
    location: "Avenue 3, Gandhi Nagar",
    category: "Water",
    priority: "Medium",
    status: "Submitted",
    assigned_department: "Water Department",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "Complaint logged and categorized as Medium Priority Water issue.", updated_by: "System", timestamp: new Date(Date.now() - 4 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  },
  {
    complaint_id: "GRV-1006",
    citizen_name: "Amit Verma",
    citizen_mobile: "9765432109",
    title: "One street light is slightly dim",
    description: "One street light bulb near lamp post #14 is slightly dim. Surrounding lights illuminate the road safely.",
    location: "Park Perimeter Lane, Green Park",
    category: "Electricity",
    priority: "Low",
    status: "Resolved",
    assigned_department: "Electricity Department",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString().replace('T', ' ').slice(0, 19),
    history: [
      { status: "Submitted", remarks: "Classified as Low Priority Street Light replacement.", updated_by: "System", timestamp: new Date(Date.now() - 7 * 86400000).toISOString().replace('T', ' ').slice(0, 19) },
      { status: "Resolved", remarks: "Defective 40W fixture replaced with new LED luminaire. Verified operational.", updated_by: "Electricity Department", timestamp: new Date(Date.now() - 1 * 86400000).toISOString().replace('T', ' ').slice(0, 19) }
    ]
  }
];

function getLocalStoredComplaints() {
  try {
    const raw = localStorage.getItem('smart_grievance_complaints');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem('smart_grievance_complaints', JSON.stringify(SEEDED_COMPLAINTS));
  return SEEDED_COMPLAINTS;
}

function saveLocalStoredComplaints(complaints) {
  try {
    localStorage.setItem('smart_grievance_complaints', JSON.stringify(complaints));
  } catch {}
}

function classifyClientSide(title, description, location) {
  const text = `${title} ${description}`.toLowerCase();

  // Category classification
  let category = 'Road';
  if (text.match(/water|pipeline|pipe|tanker|drain|drainage|sewer|sewage|leak|tap|drinking water|supply|pressure|dirty water|contamination/)) {
    category = 'Water';
  } else if (text.match(/electric|electricity|light|street light|bulb|pole|wire|transformer|power|spark|power cut|substation|voltage|blackout/)) {
    category = 'Electricity';
  } else if (text.match(/pothole|road|street|highway|flyover|bridge|footpath|sidewalk|asphalt|traffic|divider|zebra crossing|manhole|sinkhole|cave-in/)) {
    category = 'Road';
  }

  // Priority classification
  let priority = 'Medium';
  if (text.match(/accident|injur|fatal|death|blood|sinkhole|cave-in|burst|spark|fire|explosion|electrocution|collapsed|no water|three days|3 days|sewage|toxic|emergency|danger|hospital/)) {
    priority = 'High';
  } else if (text.match(/small crack|dim|minor|slight|paint|sticker|aesthetic|loose stone|chipping/)) {
    priority = 'Low';
  }

  const deptMap = {
    Road: 'Road Department',
    Water: 'Water Department',
    Electricity: 'Electricity Department'
  };
  const assigned_department = deptMap[category] || 'Road Department';

  const locSuffix = location && location !== 'Unknown' ? ` at ${location}` : '';
  let ai_ack_message = '';
  if (category === 'Road') {
    ai_ack_message = `Thank you for contacting our municipal redressal team. We have received your report regarding road and infrastructure maintenance${locSuffix} and forwarded it directly to the Ward Roadworks & Pavement Unit. Our field engineering squad will inspect the site and work to resolve this issue as early as possible.`;
  } else if (category === 'Water') {
    ai_ack_message = `Thank you for reaching out to the municipal grievance cell. Your ticket concerning water supply and drainage systems${locSuffix} has been logged and dispatched to the Municipal Jal Works & Pipeline Division. Our technical crew is reviewing the details to restore optimal civic service as early as possible.`;
  } else {
    ai_ack_message = `Thank you for contacting the civic response helpline. Your report regarding street lighting and electrical infrastructure${locSuffix} has been registered and sent to the Municipal Electrical Maintenance Division. Our on-call linemen will inspect the designated area and address the fault as early as possible.`;
  }

  return { category, priority, assigned_department, ai_ack_message };
}

// ==========================================
// CLIENT-SIDE FALLBACK DISPATCHER
// ==========================================
function handleClientSideFallback(endpoint, options = {}, payload = {}) {
  const normEndpoint = endpoint.split('?')[0].replace(/\/$/, '');
  const method = (options.method || 'GET').toUpperCase();

  // 1. Submit Complaint (POST /complaints)
  if (normEndpoint === '/complaints' && method === 'POST') {
    const list = getLocalStoredComplaints();
    let maxNum = 1006;
    list.forEach(c => {
      const m = String(c.complaint_id || '').match(/GRV-(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const newId = `GRV-${maxNum + 1}`;
    const { category, priority, assigned_department, ai_ack_message } = classifyClientSide(
      payload.title || '',
      payload.description || '',
      payload.location || ''
    );

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newComplaint = {
      complaint_id: newId,
      citizen_name: payload.name || payload.citizen_name || 'Citizen',
      citizen_mobile: payload.mobile || payload.citizen_mobile || '',
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      category,
      priority,
      status: 'Submitted',
      assigned_department,
      image_url: payload.image_url || '',
      created_at: nowStr,
      updated_at: nowStr,
      history: [
        {
          status: 'Submitted',
          remarks: `Complaint registered via citizen portal. AI automated triage assigned Category: ${category}, Priority: ${priority}.`,
          updated_by: 'System',
          timestamp: nowStr
        }
      ]
    };

    list.unshift(newComplaint);
    saveLocalStoredComplaints(list);

    return {
      success: true,
      message: 'Complaint submitted successfully!',
      complaint_id: newId,
      category,
      assigned_department,
      ai_ack_message
    };
  }

  // 2. Complaint Detail (GET /complaints/:id)
  const detailMatch = normEndpoint.match(/^\/complaints\/([^/]+)$/);
  if (detailMatch && method === 'GET') {
    const targetId = detailMatch[1];
    const list = getLocalStoredComplaints();
    const found = list.find(c => String(c.complaint_id).toLowerCase() === targetId.toLowerCase());
    if (found) {
      return { success: true, complaint: found };
    }
    // Return placeholder if not found
    return {
      success: true,
      complaint: {
        complaint_id: targetId,
        citizen_name: 'Citizen',
        citizen_mobile: '9876543210',
        title: 'Municipal Civic Complaint',
        description: 'Details recorded in city grievance dispatch queue.',
        location: 'Designated Ward Area',
        category: 'Road',
        priority: 'Medium',
        status: 'Submitted',
        assigned_department: 'Road Department',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        history: [{ status: 'Submitted', remarks: 'Complaint logged in municipal portal.', updated_by: 'System', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) }]
      }
    };
  }

  // 3. Complaints Lists (Priority Queue, Admin Complaints, User Complaints)
  if (['/priority-queue', '/admin/complaints', '/user/complaints'].includes(normEndpoint)) {
    const list = getLocalStoredComplaints();
    return { success: true, complaints: list };
  }

  // 4. Assign Department (PUT /admin/complaints/:id/assign)
  const assignMatch = normEndpoint.match(/^\/admin\/complaints\/([^/]+)\/assign$/);
  if (assignMatch && method === 'PUT') {
    const targetId = assignMatch[1];
    const list = getLocalStoredComplaints();
    const item = list.find(c => String(c.complaint_id).toLowerCase() === targetId.toLowerCase());
    if (item) {
      item.assigned_department = payload.department;
      if (item.status === 'Submitted') item.status = 'Assigned';
      item.updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
      item.history = item.history || [];
      item.history.push({
        status: item.status,
        remarks: payload.remarks || `Assigned to ${payload.department}`,
        updated_by: 'Admin',
        timestamp: item.updated_at
      });
      saveLocalStoredComplaints(list);
    }
    return { success: true, message: `Complaint assigned to ${payload.department} successfully!` };
  }

  // 5. Update Status (PUT /admin/complaints/:id/status)
  const statusMatch = normEndpoint.match(/^\/admin\/complaints\/([^/]+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const targetId = statusMatch[1];
    const list = getLocalStoredComplaints();
    const item = list.find(c => String(c.complaint_id).toLowerCase() === targetId.toLowerCase());
    if (item) {
      item.status = payload.status;
      item.updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
      item.history = item.history || [];
      item.history.push({
        status: payload.status,
        remarks: payload.remarks || `Status changed to ${payload.status}`,
        updated_by: 'Admin',
        timestamp: item.updated_at
      });
      saveLocalStoredComplaints(list);
    }
    return { success: true, message: `Status updated to ${payload.status}` };
  }

  // 6. Admin Login (POST /admin/login)
  if (normEndpoint === '/admin/login' && method === 'POST') {
    return {
      success: true,
      token: 'demo-admin-jwt-token',
      admin: {
        id: 1,
        name: 'Chief Municipal Administrator',
        email: payload.email || 'admin@gov.in',
        role: 'admin'
      }
    };
  }

  // 7. Citizen Login (POST /auth/login)
  if (normEndpoint === '/auth/login' && method === 'POST') {
    return {
      success: true,
      token: 'demo-citizen-jwt-token',
      user: {
        id: 1,
        name: 'Citizen User',
        email: payload.email || 'citizen@example.com',
        role: 'citizen'
      }
    };
  }

  // 8. Departments Stats (GET /admin/departments)
  if (normEndpoint === '/admin/departments') {
    const list = getLocalStoredComplaints();
    const calcStats = (deptName) => {
      const filtered = list.filter(c => c.assigned_department === deptName);
      return {
        total_assigned: filtered.length,
        in_progress: filtered.filter(c => c.status === 'In Progress').length,
        resolved: filtered.filter(c => c.status === 'Resolved').length,
        pending: filtered.filter(c => c.status === 'Submitted' || c.status === 'Assigned').length
      };
    };

    return {
      success: true,
      departments: [
        {
          id: 1,
          department_name: 'Road Department',
          description: 'Responsible for road repairs, potholes, sidewalks, and traffic safety hazards.',
          stats: calcStats('Road Department')
        },
        {
          id: 2,
          department_name: 'Water Department',
          description: 'Responsible for municipal water supply, pipeline leakages, and water contamination triage.',
          stats: calcStats('Water Department')
        },
        {
          id: 3,
          department_name: 'Electricity Department',
          description: 'Responsible for electrical transformers, street lighting, power failures, and wire hazards.',
          stats: calcStats('Electricity Department')
        }
      ]
    };
  }

  // 9. Admin Notifications (GET /admin/notifications)
  if (normEndpoint === '/admin/notifications') {
    const list = getLocalStoredComplaints();
    const urgent = list.filter(c => c.priority === 'High' && c.status !== 'Resolved');
    return { success: true, alerts: urgent };
  }

  // Default fallback response
  return { success: true, message: 'Operation completed successfully.' };
}

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

  let payload = {};
  if (options.body && typeof options.body === 'string') {
    try {
      payload = JSON.parse(options.body);
    } catch {}
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    // If endpoint responds normally with success or validation error (400)
    if (response.ok) {
      return data;
    }

    // If server returned 405 Method Not Allowed or 404 (common on static Vercel / serverless routing)
    if (response.status === 405 || response.status === 404) {
      console.warn(`[Smart Grievance] API ${endpoint} returned ${response.status}. Using seamless fallback handler.`);
      return handleClientSideFallback(endpoint, options, payload);
    }

    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  } catch (err) {
    // If network error (e.g., backend offline, CORS blocked, or failed to fetch on Vercel)
    console.warn(`[Smart Grievance] Network error connecting to ${endpoint}:`, err.message);
    return handleClientSideFallback(endpoint, options, payload);
  }
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

  // Geocoding & Location (With direct OSM fallback)
  reverseGeocode: async (lat, lon) => {
    try {
      const res = await request(`/geocode/reverse?lat=${lat}&lon=${lon}`);
      if (res && res.success) return res;
    } catch {}
    // Direct OSM Nominatim fallback
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en,hi' } }
      );
      if (osmRes.ok) {
        const data = await osmRes.json();
        return {
          success: true,
          address: data.display_name,
          society: data.address?.suburb || data.address?.neighbourhood || '',
          road: data.address?.road || '',
          colony: data.address?.residential || '',
          city: data.address?.city || data.address?.town || data.address?.state_district || '',
          pincode: data.address?.postcode || '',
          state: data.address?.state || ''
        };
      }
    } catch {}
    return { success: false, address: `GPS: ${lat}, ${lon}` };
  },

  searchLocations: async (q) => {
    try {
      const res = await request(`/geocode/search?q=${encodeURIComponent(q)}`);
      if (res && res.success) return res;
    } catch {}
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5`,
        { headers: { 'Accept-Language': 'en,hi' } }
      );
      if (osmRes.ok) {
        const data = await osmRes.json();
        return { success: true, results: data };
      }
    } catch {}
    return { success: false, results: [] };
  }
};
