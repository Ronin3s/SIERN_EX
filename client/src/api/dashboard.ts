import api from './api';

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { activeProcesses: number, alertsLast24h: number, lastScanTime: string, systemStatus: string }
export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

// Description: Get recent alerts
// Endpoint: GET /api/dashboard/alerts
// Request: {}
// Response: Array<{ id: string, title: string, severity: string, timestamp: string, description: string }>
export const getRecentAlerts = async () => {
  const response = await api.get('/api/dashboard/alerts');
  return response.data;
};