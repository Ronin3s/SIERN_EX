import api from './api';

// Description: Start IOC hunt
// Endpoint: POST /api/ioc-hunt/start
// Request: { iocs: string[], scope: string }
// Response: { results: Array<{ id: string, ioc: string, matchLocation: string, firstSeen: string, lastSeen: string, confidence: number, severity: string }> }
export const startIOCHunt = (config: { iocs: string[]; scope: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          ioc: '192.168.1.100',
          matchLocation: 'Network Connection - svchost.exe',
          firstSeen: '2024-01-20 14:30:00',
          lastSeen: '2024-01-20 15:45:00',
          confidence: 95,
          severity: 'critical',
        },
        {
          id: '2',
          ioc: 'malware.com',
          matchLocation: 'DNS Query - chrome.exe',
          firstSeen: '2024-01-20 13:15:00',
          lastSeen: '2024-01-20 14:20:00',
          confidence: 88,
          severity: 'high',
        },
        {
          id: '3',
          ioc: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
          matchLocation: 'File Hash - /tmp/suspicious.exe',
          firstSeen: '2024-01-20 12:00:00',
          lastSeen: '2024-01-20 12:00:00',
          confidence: 92,
          severity: 'critical',
        },
        {
          id: '4',
          ioc: 'attacker@evil.com',
          matchLocation: 'Email Log - Exchange Server',
          firstSeen: '2024-01-19 10:30:00',
          lastSeen: '2024-01-20 09:15:00',
          confidence: 75,
          severity: 'medium',
        },
      ]);
    }, 1500);
  });
};

// Description: Get hunt results
// Endpoint: GET /api/ioc-hunt/results
// Request: {}
// Response: { results: Array<{ id: string, ioc: string, matchLocation: string, firstSeen: string, lastSeen: string, confidence: number, severity: string }> }
export const getHuntResults = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 500);
  });
};