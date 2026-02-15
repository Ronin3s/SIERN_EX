import api from './api';

// Description: Get list of running processes
// Endpoint: GET /api/processes
// Request: {}
// Response: { processes: Array<{ id: string, name: string, pid: number, user: string, cpu: number, memory: number, path: string, riskScore: number }> }
export const getProcesses = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'svchost.exe',
          pid: 1024,
          user: 'SYSTEM',
          cpu: 2.5,
          memory: 15.3,
          path: 'C:\\Windows\\System32\\svchost.exe',
          riskScore: 15,
        },
        {
          id: '2',
          name: 'explorer.exe',
          pid: 2048,
          user: 'Administrator',
          cpu: 5.2,
          memory: 45.8,
          path: 'C:\\Windows\\explorer.exe',
          riskScore: 8,
        },
        {
          id: '3',
          name: 'chrome.exe',
          pid: 3072,
          user: 'Administrator',
          cpu: 12.4,
          memory: 78.5,
          path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          riskScore: 25,
        },
        {
          id: '4',
          name: 'powershell.exe',
          pid: 4096,
          user: 'Administrator',
          cpu: 8.1,
          memory: 32.2,
          path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
          riskScore: 65,
        },
        {
          id: '5',
          name: 'cmd.exe',
          pid: 5120,
          user: 'Administrator',
          cpu: 3.5,
          memory: 12.1,
          path: 'C:\\Windows\\System32\\cmd.exe',
          riskScore: 42,
        },
        {
          id: '6',
          name: 'notepad.exe',
          pid: 6144,
          user: 'Administrator',
          cpu: 0.8,
          memory: 8.5,
          path: 'C:\\Windows\\notepad.exe',
          riskScore: 5,
        },
        {
          id: '7',
          name: 'rundll32.exe',
          pid: 7168,
          user: 'SYSTEM',
          cpu: 1.2,
          memory: 18.3,
          path: 'C:\\Windows\\System32\\rundll32.exe',
          riskScore: 78,
        },
        {
          id: '8',
          name: 'wscript.exe',
          pid: 8192,
          user: 'Administrator',
          cpu: 4.5,
          memory: 22.7,
          path: 'C:\\Windows\\System32\\wscript.exe',
          riskScore: 85,
        },
      ]);
    }, 500);
  });
};

// Description: Kill a process
// Endpoint: POST /api/processes/:id/kill
// Request: { id: string }
// Response: { success: boolean, message: string }
export const killProcess = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Process terminated' });
    }, 500);
  });
};