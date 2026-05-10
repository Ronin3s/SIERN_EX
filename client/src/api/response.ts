import api from './api';

// Description: Get active containment actions
// Endpoint: GET /api/response/containments
// Response: Array<{ id: string, type: string, target: string, timestamp: string, status: string, user: string }>
export const getContainmentActions = async () => {
  const res = await api.get('/api/response/containments');
  return res.data;
};

// Description: Get action history
// Endpoint: GET /api/response/history
// Response: Array<{ id: string, action: string, description: string, timestamp: string, user: string, result: string }>
export const getActionHistory = async () => {
  const res = await api.get('/api/response/history');
  return res.data;
};

// Description: Undo a containment action
// Endpoint: POST /api/response/undo/:id
// Response: { success: boolean, message: string }
export const undoAction = async (id: string) => {
  const res = await api.post(`/api/response/undo/${id}`);
  return res.data;
};
