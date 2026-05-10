import psList from 'ps-list';
import os from 'os';
import { exec } from 'child_process';
import * as ResponseService from './responseService';

export interface ProcessInfo {
  id: string;
  name: string;
  pid: number;
  user: string;
  cpu: number;
  memory: number;
  path: string;
  riskScore: number;
  ppid?: number;
  cmd?: string;
}

/**
 * Calculate risk score for a process based on various factors
 * Risk scoring factors:
 * - Process name (known suspicious processes)
 * - Path location (temp directories, unusual locations)
 * - Resource usage (high CPU/memory)
 * - User context (SYSTEM vs user processes)
 */
function calculateRiskScore(process: {
  name: string;
  pid: number;
  ppid?: number;
  memory?: number;
  cpu?: number;
  cmd?: string;
}): number {
  let risk = 0;

  const processName = process.name.toLowerCase();
  const command = process.cmd?.toLowerCase() || '';

  // High-risk process names (50 points)
  // Windows high-risk processes + Linux offensive tools
  const highRiskProcesses = [
    'wscript.exe', 'cscript.exe', 'mshta.exe', 'regsvr32.exe',
    'nc', 'ncat', 'netcat', 'socat', 'msfconsole', 'msfvenom',
  ];
  if (highRiskProcesses.some((p) => processName.includes(p))) {
    risk += 50;
  }

  // Medium-risk process names (30 points)
  // Windows medium-risk processes + Linux scripting engines
  const mediumRiskProcesses = [
    'powershell.exe', 'cmd.exe', 'rundll32.exe', 'certutil.exe',
    'python', 'python3', 'perl', 'ruby', 'bash', 'sh', 'curl', 'wget',
  ];
  if (mediumRiskProcesses.some((p) => processName.includes(p))) {
    risk += 30;
  }

  // Suspicious paths (20 points)
  const suspiciousPaths = ['temp', 'tmp', 'appdata\\local', 'downloads', 'public'];
  if (suspiciousPaths.some((p) => command.includes(p))) {
    risk += 20;
  }

  // Encoded commands (PowerShell -enc flag) (30 points)
  if (command.includes('-enc') || command.includes('-encodedcommand')) {
    risk += 30;
  }

  // High memory usage (10 points)
  if (process.memory && process.memory > 500 * 1024 * 1024) {
    // > 500MB
    risk += 10;
  }

  // High CPU usage (10 points)
  if (process.cpu && process.cpu > 50) {
    // > 50%
    risk += 10;
  }

  // Cap risk score at 100
  return Math.min(risk, 100);
}

/**
 * Get list of all running processes with metrics and risk scoring
 */
export async function getAllProcesses(): Promise<ProcessInfo[]> {
  try {
    console.log('Fetching running processes...');
    const processes = await psList();

    console.log(`Retrieved ${processes.length} processes from system`);

    const processInfoList: ProcessInfo[] = processes.map((proc) => {
      const riskScore = calculateRiskScore({
        name: proc.name,
        pid: proc.pid,
        ppid: proc.ppid,
        memory: proc.memory,
        cpu: proc.cpu,
        cmd: proc.cmd,
      });

      // Calculate memory percentage (rough estimate based on typical system RAM)
      // This is a simplified approach - in production, you'd want to get actual system memory
      const memoryPercentage = proc.memory ? (proc.memory / (8 * 1024 * 1024 * 1024)) * 100 : 0;

      return {
        id: proc.pid.toString(),
        name: proc.name,
        pid: proc.pid,
        user: 'system', // ps-list doesn't provide user info on all platforms
        cpu: proc.cpu || 0,
        memory: Number(memoryPercentage.toFixed(2)),
        path: proc.cmd || proc.name,
        riskScore,
        ppid: proc.ppid,
        cmd: proc.cmd,
      };
    });

    console.log(`Processed ${processInfoList.length} processes with risk scoring`);
    return processInfoList;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw new Error(`Failed to retrieve processes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Terminate a process by PID
 */
export async function terminateProcess(pid: number, userEmail: string = 'system'): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`Attempting to terminate process with PID: ${pid}`);

    // Verify process exists first
    const processes = await psList();
    const targetProcess = processes.find((p) => p.pid === pid);

    if (!targetProcess) {
      console.warn(`Process with PID ${pid} not found`);
      return {
        success: false,
        message: `Process with PID ${pid} not found`,
      };
    }

    // Platform-aware process termination
    if (os.platform() === 'win32') {
      // Windows: use taskkill command
      await new Promise<void>((resolve, reject) => {
        exec(`taskkill /PID ${pid} /F`, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Process ${pid} terminated via taskkill`);
            resolve();
          }
        });
      });
    } else {
      // Linux/macOS: use POSIX signals
      process.kill(pid, 'SIGTERM');

      console.log(`Successfully sent SIGTERM to process ${pid} (${targetProcess.name})`);

      // Verify the process was terminated
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        process.kill(pid, 0);
        console.warn(`Process ${pid} still running after SIGTERM, attempting SIGKILL`);
        process.kill(pid, 'SIGKILL');
      } catch (err) {
        console.log(`Process ${pid} successfully terminated`);
      }
    }

    // Log the action to Response Center
    await ResponseService.createAction({
      type: 'kill',
      target: `${targetProcess.name} (PID: ${pid})`,
      user: userEmail,
      description: `Terminated process ${targetProcess.name} with PID ${pid}`,
      result: 'success',
      metadata: { pid, name: targetProcess.name, path: targetProcess.cmd }
    });

    return {
      success: true,
      message: `Process ${targetProcess.name} (PID: ${pid}) terminated successfully`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error terminating process ${pid}:`, error);

    // Check for permission errors
    if (errorMessage.includes('EPERM') || errorMessage.includes('EACCES')) {
      return {
        success: false,
        message: `Permission denied: Cannot terminate process ${pid}. Requires elevated privileges.`,
      };
    }

    if (errorMessage.includes('ESRCH')) {
      return {
        success: false,
        message: `Process ${pid} not found or already terminated`,
      };
    }

    return {
      success: false,
      message: `Failed to terminate process: ${errorMessage}`,
    };
  }
}
