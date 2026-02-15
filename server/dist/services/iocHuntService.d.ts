export interface IOCHuntConfig {
    iocs: string[];
    scope: 'processes' | 'filesystem' | 'both';
    searchPath?: string;
}
export interface IOCMatch {
    id: string;
    ioc: string;
    iocType: 'hash' | 'ip' | 'domain' | 'url' | 'email';
    matchLocation: string;
    firstSeen: string;
    lastSeen: string;
    confidence: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    metadata?: Record<string, unknown>;
}
/**
 * Start IOC hunt
 */
export declare function startIOCHunt(config: IOCHuntConfig): Promise<IOCMatch[]>;
/**
 * Calculate confidence score based on match context
 */
export declare function calculateConfidence(matchType: string, context: Record<string, unknown>): number;
//# sourceMappingURL=iocHuntService.d.ts.map