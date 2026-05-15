const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Projects
export const fetchProjects = () => request('/construction/projects');
export const createProject = (body) => request('/construction/projects', { method: 'POST', body: JSON.stringify(body) });
export const fetchProject = (id) => request(`/construction/projects/${id}`);
export const updateProject = (id, body) => request(`/construction/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteProject = (id) => request(`/construction/projects/${id}`, { method: 'DELETE' });

// Daily Site Logs
export const fetchSiteLogs = (projectId) => request(`/construction/projects/${projectId}/site-logs`);
export const createSiteLog = (projectId, body) => request(`/construction/projects/${projectId}/site-logs`, { method: 'POST', body: JSON.stringify(body) });
export const deleteSiteLog = (projectId, logId) => request(`/construction/projects/${projectId}/site-logs/${logId}`, { method: 'DELETE' });

// RFIs
export const fetchRFIs = (projectId) => request(`/construction/projects/${projectId}/rfis`);
export const createRFI = (projectId, body) => request(`/construction/projects/${projectId}/rfis`, { method: 'POST', body: JSON.stringify(body) });
export const updateRFI = (projectId, rfiId, body) => request(`/construction/projects/${projectId}/rfis/${rfiId}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteRFI = (projectId, rfiId) => request(`/construction/projects/${projectId}/rfis/${rfiId}`, { method: 'DELETE' });

// Deficiencies
export const fetchDeficiencies = (projectId) => request(`/construction/projects/${projectId}/deficiencies`);
export const createDeficiency = (projectId, body) => request(`/construction/projects/${projectId}/deficiencies`, { method: 'POST', body: JSON.stringify(body) });
export const updateDeficiency = (projectId, defId, body) => request(`/construction/projects/${projectId}/deficiencies/${defId}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteDeficiency = (projectId, defId) => request(`/construction/projects/${projectId}/deficiencies/${defId}`, { method: 'DELETE' });

// Safety Records
export const fetchSafetyRecords = (projectId) => request(`/construction/projects/${projectId}/safety`);
export const createSafetyRecord = (projectId, body) => request(`/construction/projects/${projectId}/safety`, { method: 'POST', body: JSON.stringify(body) });
export const deleteSafetyRecord = (projectId, recordId) => request(`/construction/projects/${projectId}/safety/${recordId}`, { method: 'DELETE' });

// Submittals
export const fetchSubmittals = (projectId) => request(`/construction/projects/${projectId}/submittals`);
export const createSubmittal = (projectId, body) => request(`/construction/projects/${projectId}/submittals`, { method: 'POST', body: JSON.stringify(body) });
export const updateSubmittal = (projectId, subId, body) => request(`/construction/projects/${projectId}/submittals/${subId}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteSubmittal = (projectId, subId) => request(`/construction/projects/${projectId}/submittals/${subId}`, { method: 'DELETE' });

// Schedule
export const fetchSchedule = (projectId) => request(`/construction/projects/${projectId}/schedule`);
export const createScheduleItem = (projectId, body) => request(`/construction/projects/${projectId}/schedule`, { method: 'POST', body: JSON.stringify(body) });
export const updateScheduleItem = (projectId, itemId, body) => request(`/construction/projects/${projectId}/schedule/${itemId}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteScheduleItem = (projectId, itemId) => request(`/construction/projects/${projectId}/schedule/${itemId}`, { method: 'DELETE' });

// Trades
export const fetchTrades = (projectId) => request(`/construction/projects/${projectId}/trades`);
export const createTrade = (projectId, body) => request(`/construction/projects/${projectId}/trades`, { method: 'POST', body: JSON.stringify(body) });
export const updateTrade = (projectId, tradeId, body) => request(`/construction/projects/${projectId}/trades/${tradeId}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteTrade = (projectId, tradeId) => request(`/construction/projects/${projectId}/trades/${tradeId}`, { method: 'DELETE' });
