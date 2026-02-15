import api from './api';

// Description: Start IOC hunt
// Endpoint: POST /api/ioc-hunt
// Request: { iocs: string[], scope: string, searchPath?: string }
// Response: { results: Array<{ id: string, ioc: string, iocType: string, matchLocation: string, firstSeen: string, lastSeen: string, confidence: number, severity: string }> }
export const startIOCHunt = async (config: { iocs: string[]; scope: string; searchPath?: string }) => {
  const response = await api.post('/api/ioc-hunt', config);
  return response.data.results;
};

// Description: Get hunt results
// Endpoint: GET /api/ioc-hunt/results
// Request: {}
// Response: { results: Array<{ id: string, ioc: string, iocType: string, matchLocation: string, firstSeen: string, lastSeen: string, confidence: number, severity: string }> }
export const getHuntResults = async () => {
  const response = await api.get('/api/ioc-hunt/results');
  return response.data.results;
};