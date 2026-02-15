import api from './api';

// Description: Start a file integrity scan
// Endpoint: POST /api/scanner/scan
// Request: { path: string, includeSubdirectories: boolean, compareAgainstBaseline: boolean }
// Response: { results: Array<{ id: string, filePath: string, changeType: string, currentHash: string, previousHash: string, lastModified: string, riskLevel: string }> }
export const startScan = async (config: {
  path: string;
  includeSubdirectories: boolean;
  compareAgainstBaseline: boolean;
}) => {
  const response = await api.post('/api/scanner/scan', config);
  return response.data.results;
};

// Description: Get baseline
// Endpoint: GET /api/scanner/baseline
// Request: {}
// Response: Array<{ filePath: string, hash: string, lastModified: string, status: string }>
export const getBaseline = async () => {
  const response = await api.get('/api/scanner/baseline');
  return response.data;
};

// Description: Create or update baseline
// Endpoint: POST /api/scanner/baseline
// Request: { path: string, includeSubdirectories: boolean }
// Response: { success: boolean, message: string, created: number, updated: number }
export const createBaseline = async (config: {
  path: string;
  includeSubdirectories: boolean;
}) => {
  const response = await api.post('/api/scanner/baseline', config);
  return response.data;
};