import api from './api';

// Description: Get detected anomalies
// Endpoint: GET /api/behavioral/anomalies
// Response: Array<{ id: string, ruleId: string, ruleName: string, severity: string, process: string, timestamp: string, status: string }>
export const getAnomalies = async () => {
  const res = await api.get('/api/behavioral/anomalies');
  return res.data;
};

// Description: Simulate a behavioral event
// Endpoint: POST /api/behavioral/simulate
// Request: { ruleId: string }
// Response: { id: string, ruleId: string, ruleName: string, severity: string, process: string, timestamp: string, status: string }
export const simulateEvent = async (ruleId: string) => {
  const res = await api.post('/api/behavioral/simulate', { ruleId });
  return res.data;
};