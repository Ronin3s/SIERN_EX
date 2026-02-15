import api from './api';

// Description: Get list of running processes
// Endpoint: GET /api/processes
// Request: {}
// Response: { processes: Array<{ id: string, name: string, pid: number, user: string, cpu: number, memory: number, path: string, riskScore: number }> }
export const getProcesses = async () => {
  try {
    const response = await api.get('/api/processes');
    return response.data.processes;
  } catch (error: unknown) {
    console.error('Error fetching processes:', error);
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
    throw new Error(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to fetch processes');
  }
};

// Description: Kill a process
// Endpoint: POST /api/processes/:id/kill
// Request: { id: string }
// Response: { success: boolean, message: string }
export const killProcess = async (id: string) => {
  try {
    const response = await api.post(`/api/processes/${id}/kill`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error killing process:', error);
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
    throw new Error(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to kill process');
  }
};
