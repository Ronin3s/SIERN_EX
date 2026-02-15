import api from './api';

// Description: Start a file integrity scan
// Endpoint: POST /api/scanner/scan
// Request: { path: string, includeSubdirectories: boolean, compareAgainstBaseline: boolean }
// Response: { results: Array<{ id: string, filePath: string, changeType: string, currentHash: string, previousHash: string, lastModified: string, riskLevel: string }> }
export const startScan = (config: {
  path: string;
  includeSubdirectories: boolean;
  compareAgainstBaseline: boolean;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          filePath: '/etc/passwd',
          changeType: 'MODIFIED',
          currentHash: 'a1b2c3d4e5f6g7h8',
          previousHash: 'z9y8x7w6v5u4t3s2',
          lastModified: '2 hours ago',
          riskLevel: 'high',
        },
        {
          id: '2',
          filePath: '/usr/bin/suspicious_tool',
          changeType: 'NEW',
          currentHash: 'f1e2d3c4b5a6g7h8',
          previousHash: '',
          lastModified: '30 minutes ago',
          riskLevel: 'critical',
        },
        {
          id: '3',
          filePath: '/etc/shadow',
          changeType: 'MODIFIED',
          currentHash: 'b2c3d4e5f6g7h8i9',
          previousHash: 'a1b2c3d4e5f6g7h8',
          lastModified: '1 hour ago',
          riskLevel: 'high',
        },
        {
          id: '4',
          filePath: '/var/log/auth.log',
          changeType: 'MODIFIED',
          currentHash: 'c3d4e5f6g7h8i9j0',
          previousHash: 'b2c3d4e5f6g7h8i9',
          lastModified: '15 minutes ago',
          riskLevel: 'medium',
        },
        {
          id: '5',
          filePath: '/usr/local/bin/backup_script.sh',
          changeType: 'DELETED',
          currentHash: '',
          previousHash: 'd4e5f6g7h8i9j0k1',
          lastModified: '3 hours ago',
          riskLevel: 'low',
        },
      ]);
    }, 1000);
  });
};

// Description: Get baseline
// Endpoint: GET /api/scanner/baseline
// Request: {}
// Response: { baseline: Array<{ filePath: string, hash: string, lastModified: string, status: string }> }
export const getBaseline = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          filePath: '/etc/passwd',
          hash: 'z9y8x7w6v5u4t3s2',
          lastModified: '2024-01-15',
          status: 'baseline',
        },
      ]);
    }, 500);
  });
};