import api from './api';

// Description: Get active containment actions
// Endpoint: GET /api/response/containments
// Request: {}
// Response: { containments: Array<{ id: string, type: string, target: string, timestamp: string, status: string, user: string }> }
export const getContainmentActions = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          type: 'kill',
          target: 'wscript.exe (PID: 8192)',
          timestamp: '2024-01-20 15:30:00',
          status: 'active',
          user: 'analyst@company.com',
        },
        {
          id: '2',
          type: 'isolate',
          target: 'WORKSTATION-05',
          timestamp: '2024-01-20 14:15:00',
          status: 'active',
          user: 'analyst@company.com',
        },
        {
          id: '3',
          type: 'quarantine',
          target: '/tmp/suspicious.exe',
          timestamp: '2024-01-20 13:45:00',
          status: 'resolved',
          user: 'analyst@company.com',
        },
      ]);
    }, 500);
  });
};

// Description: Get action history
// Endpoint: GET /api/response/history
// Request: {}
// Response: { history: Array<{ id: string, action: string, description: string, timestamp: string, user: string, result: string }> }
export const getActionHistory = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          action: 'Process Termination',
          description: 'Terminated wscript.exe (PID: 8192)',
          timestamp: '2024-01-20 15:30:00',
          user: 'analyst@company.com',
          result: 'success',
        },
        {
          id: '2',
          action: 'Host Isolation',
          description: 'Isolated WORKSTATION-05 from network',
          timestamp: '2024-01-20 14:15:00',
          user: 'analyst@company.com',
          result: 'success',
        },
        {
          id: '3',
          action: 'File Quarantine',
          description: 'Quarantined /tmp/suspicious.exe',
          timestamp: '2024-01-20 13:45:00',
          user: 'analyst@company.com',
          result: 'success',
        },
        {
          id: '4',
          action: 'Process Termination',
          description: 'Attempted to terminate rundll32.exe (PID: 7168)',
          timestamp: '2024-01-20 12:30:00',
          user: 'analyst@company.com',
          result: 'failed',
        },
      ]);
    }, 500);
  });
};

// Description: Undo a containment action
// Endpoint: POST /api/response/undo/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const undoAction = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Action reversed' });
    }, 500);
  });
};