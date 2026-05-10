import Anomaly, { IAnomaly } from '../models/Anomaly';
import * as ProcessService from './processService';
import * as alertService from './alertService';
import * as ResponseService from './responseService';
import os from 'os';

/**
 * Detection rule definition
 */
interface DetectionRule {
    id: string;
    name: string;
    severity: 'critical' | 'warning' | 'info';
    detect: (proc: ProcessService.ProcessInfo) => boolean;
}

/**
 * Built-in behavioral detection rules
 */
const DETECTION_RULES: DetectionRule[] = [
    {
        id: 'BR-001',
        name: 'Encoded Command Execution via CLI',
        severity: 'critical',
        detect: (proc) => {
            const cmd = (proc.cmd || '').toLowerCase();
            return cmd.includes('-enc') ||
                cmd.includes('-encodedcommand') ||
                /[A-Za-z0-9+/]{40,}={0,2}/.test(cmd); // base64 pattern
        },
    },
    {
        id: 'BR-002',
        name: 'Child Process Spawning from Temp Directories',
        severity: 'warning',
        detect: (proc) => {
            const cmd = (proc.cmd || proc.path || '').toLowerCase();
            const tempPaths = [
                os.tmpdir().toLowerCase(),
                '/tmp/', '/var/tmp/',
                'appdata\\local\\temp', 'c:\\temp', 'c:\\windows\\temp',
            ];
            return tempPaths.some((p) => cmd.includes(p));
        },
    },
    {
        id: 'BR-004',
        name: 'Potential Process Injection Signatures',
        severity: 'critical',
        detect: (proc) => {
            const name = proc.name.toLowerCase();
            const injectionTargets = ['svchost.exe', 'lsass.exe', 'csrss.exe', 'winlogon.exe', 'services.exe'];
            if (!injectionTargets.some((t) => name.includes(t))) return false;
            // Flag if the process has an unusual parent (ppid 0 or very high)
            if (proc.ppid !== undefined && (proc.ppid === 0 || proc.ppid > 10000)) return true;
            // Flag if high memory usage on a typically lean process
            if (proc.memory > 5) return true;
            return false;
        },
    },
];

/**
 * Get all anomalies from the database
 */
export async function getAnomalies(): Promise<IAnomaly[]> {
    try {
        console.log('[Behavioral] Fetching anomalies');
        const anomalies = await Anomaly.find({})
            .sort({ timestamp: -1 })
            .limit(100);
        console.log(`[Behavioral] Retrieved ${anomalies.length} anomalies`);
        return anomalies;
    } catch (error) {
        console.error('[Behavioral] Error fetching anomalies:', error);
        throw new Error(`Failed to fetch anomalies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Simulate a behavioral event for testing purposes
 */
export async function simulateEvent(ruleId: string): Promise<IAnomaly> {
    try {
        console.log(`[Behavioral] Simulating event for rule: ${ruleId}`);

        const ruleMap: Record<string, { name: string; severity: 'critical' | 'warning' | 'info' }> = {
            'BR-001': { name: 'Encoded Command Execution via CLI', severity: 'critical' },
            'BR-002': { name: 'Child Process Spawning from Temp Directories', severity: 'warning' },
            'BR-004': { name: 'Potential Process Injection Signatures', severity: 'critical' },
        };

        const rule = ruleMap[ruleId] || { name: 'Unknown Rule', severity: 'info' };

        const anomaly = await Anomaly.create({
            ruleId,
            ruleName: rule.name,
            severity: rule.severity,
            process: `simulated_process.exe (PID: ${Math.floor(Math.random() * 9000) + 1000})`,
            timestamp: new Date(),
            status: 'simulated',
        });

        console.log(`[Behavioral] Simulated anomaly created: ${anomaly._id}`);
        return anomaly;
    } catch (error) {
        console.error('[Behavioral] Error simulating event:', error);
        throw new Error(`Failed to simulate event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Run all detection rules against live running processes
 */
export async function runDetectionScan(): Promise<IAnomaly[]> {
    try {
        console.log('[Behavioral] Starting detection scan');
        const processes = await ProcessService.getAllProcesses();
        const detectedAnomalies: IAnomaly[] = [];

        for (const proc of processes) {
            for (const rule of DETECTION_RULES) {
                if (rule.detect(proc)) {
                    console.log(`[Behavioral] Rule ${rule.id} matched process: ${proc.name} (PID: ${proc.pid})`);

                    const anomaly = await Anomaly.create({
                        ruleId: rule.id,
                        ruleName: rule.name,
                        severity: rule.severity,
                        process: `${proc.name} (PID: ${proc.pid})`,
                        timestamp: new Date(),
                        status: 'active',
                        metadata: {
                            pid: proc.pid,
                            ppid: proc.ppid,
                            path: proc.path,
                            cpu: proc.cpu,
                            memory: proc.memory,
                            riskScore: proc.riskScore,
                        },
                    });

                    detectedAnomalies.push(anomaly);

                    // Also create an alert for critical/warning detections
                    if (rule.severity === 'critical' || rule.severity === 'warning') {
                        await alertService.createAlert({
                            title: `Behavioral Detection: ${rule.name}`,
                            severity: rule.severity === 'critical' ? 'critical' : 'medium',
                            description: `Rule ${rule.id} triggered by process ${proc.name} (PID: ${proc.pid})`,
                            source: 'behavioral-detection',
                            metadata: { ruleId: rule.id, pid: proc.pid, processName: proc.name },
                        });
                    }
                }
            }
        }

        console.log(`[Behavioral] Detection scan complete. Found ${detectedAnomalies.length} anomalies`);
        return detectedAnomalies;
    } catch (error) {
        console.error('[Behavioral] Error during detection scan:', error);
        throw new Error(`Detection scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Resolve an anomaly by ID
 */
export async function resolveAnomaly(anomalyId: string): Promise<IAnomaly | null> {
    try {
        console.log(`[Behavioral] Resolving anomaly: ${anomalyId}`);
        const anomaly = await Anomaly.findByIdAndUpdate(
            anomalyId,
            { status: 'resolved' },
            { new: true }
        );
        if (!anomaly) {
            console.warn(`[Behavioral] Anomaly ${anomalyId} not found`);
            return null;
        }

        // Log resolution to Response Center
        await ResponseService.createAction({
            type: 'resolve',
            target: anomaly.ruleName,
            user: 'Security Analyst',
            description: `Resolved behavioral anomaly: ${anomaly.ruleName} for process ${anomaly.process}`,
            metadata: { anomalyId, ruleId: anomaly.ruleId }
        });

        console.log(`[Behavioral] Anomaly ${anomalyId} resolved`);
        return anomaly;
    } catch (error) {
        console.error('[Behavioral] Error resolving anomaly:', error);
        throw new Error(`Failed to resolve anomaly: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
