import { IAlert } from '../models/Alert';
export interface CreateAlertData {
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    source: string;
    metadata?: Record<string, unknown>;
}
/**
 * Create a new security alert
 */
export declare function createAlert(data: CreateAlertData): Promise<IAlert>;
/**
 * Get recent alerts (last 24 hours by default)
 */
export declare function getRecentAlerts(hours?: number): Promise<IAlert[]>;
/**
 * Get alert count for the last N hours
 */
export declare function getAlertCount(hours?: number): Promise<number>;
/**
 * Acknowledge an alert
 */
export declare function acknowledgeAlert(alertId: string, userId: string): Promise<IAlert | null>;
/**
 * Get alerts by severity
 */
export declare function getAlertsBySeverity(severity: string, limit?: number): Promise<IAlert[]>;
//# sourceMappingURL=alertService.d.ts.map