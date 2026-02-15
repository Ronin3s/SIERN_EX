import { IFileBaseline } from '../models/FileBaseline';
export interface ScanConfig {
    path: string;
    includeSubdirectories: boolean;
    compareAgainstBaseline: boolean;
}
export interface FileChange {
    id: string;
    filePath: string;
    changeType: 'NEW' | 'MODIFIED' | 'DELETED' | 'UNCHANGED';
    currentHash: string;
    previousHash: string;
    lastModified: string;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    size?: number;
}
/**
 * Start a file integrity scan
 */
export declare function startScan(config: ScanConfig): Promise<FileChange[]>;
/**
 * Get current baseline
 */
export declare function getBaseline(): Promise<IFileBaseline[]>;
/**
 * Create or update baseline from scan results
 */
export declare function createBaseline(scanPath: string, includeSubdirectories: boolean): Promise<{
    created: number;
    updated: number;
}>;
//# sourceMappingURL=scannerService.d.ts.map