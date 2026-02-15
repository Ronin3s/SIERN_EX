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
 * Get list of all running processes with metrics and risk scoring
 */
export declare function getAllProcesses(): Promise<ProcessInfo[]>;
/**
 * Terminate a process by PID
 */
export declare function terminateProcess(pid: number): Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=processService.d.ts.map