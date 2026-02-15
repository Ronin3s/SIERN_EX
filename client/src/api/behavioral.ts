import api from './api';

// Description: Get detected anomalies
// Endpoint: GET /api/behavioral/anomalies
// Request: {}
// Response: { anomalies: Array<{ id: string, ruleId: string, ruleName: string, severity: string, process: string, timestamp: string, status: string }> }
export const getAnomalies = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          ruleId: 'BR-001',
          ruleName: 'Encoded Command Execution via CLI',
          severity: 'critical',
          process: 'powershell.exe (PID: 4096)',
          timestamp: '2024-01-20 15:30:00',
          status: 'active',
        },
        {
          id: '2',
          ruleId: 'BR-002',
          ruleName: 'Child Process Spawning from Temp Directories',
          severity: 'warning',
          process: 'explorer.exe (PID: 2048)',
          timestamp: '2024-01-20 14:15:00',
          status: 'active',
        },
        {
          id: '3',
          ruleId: 'BR-004',
          ruleName: 'Potential Process Injection Signatures',
          severity: 'critical',
          process: 'svchost.exe (PID: 1024)',
          timestamp: '2024-01-20 13:45:00',
          status: 'resolved',
        },
      ]);
    }, 500);
  });
};

// Description: Simulate a behavioral event
// Endpoint: POST /api/behavioral/simulate
// Request: { ruleId: string }
// Response: { anomaly: { id: string, ruleId: string, ruleName: string, severity: string, process: string, timestamp: string, status: string } }
export const simulateEvent = (ruleId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ruleMap: Record<string, { name: string; severity: string }> = {
        'BR-001': { name: 'Encoded Command Execution via CLI', severity: 'critical' },
        'BR-002': { name: 'Child Process Spawning from Temp Directories', severity: 'warning' },
        'BR-004': { name: 'Potential Process Injection Signatures', severity: 'critical' },
      };

      const rule = ruleMap[ruleId] || { name: 'Unknown Rule', severity: 'info' };

      resolve({
        id: `sim-${Date.now()}`,
        ruleId,
        ruleName: rule.name,
        severity: rule.severity,
        process: 'test.exe (PID: 9999)',
        timestamp: new Date().toLocaleString(),
        status: 'simulated',
      });
    }, 800);
  });
};