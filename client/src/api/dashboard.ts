import api from './api';

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { activeProcesses: number, alertsLast24h: number, lastScanTime: string, systemStatus: string }
export const getDashboardStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activeProcesses: 247,
        alertsLast24h: 12,
        lastScanTime: '2 hours ago',
        systemStatus: 'normal',
      });
    }, 500);
  });
};

// Description: Get recent alerts
// Endpoint: GET /api/dashboard/alerts
// Request: {}
// Response: { alerts: Array<{ id: string, title: string, severity: string, timestamp: string, description: string }> }
export const getRecentAlerts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Suspicious Process Detected',
          severity: 'critical',
          timestamp: '5 minutes ago',
          description: 'Process "svchost.exe" spawned from temp directory with encoded command line',
        },
        {
          id: '2',
          title: 'File Integrity Change',
          severity: 'warning',
          timestamp: '1 hour ago',
          description: 'System file /etc/passwd modified outside of scheduled maintenance',
        },
        {
          id: '3',
          title: 'Network Anomaly',
          severity: 'info',
          timestamp: '3 hours ago',
          description: 'Unusual outbound connection to known C2 infrastructure detected',
        },
      ]);
    }, 500);
  });
};