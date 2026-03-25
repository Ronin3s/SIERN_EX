import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as ProcessService from '../services/processService';
import * as AlertService from '../services/alertService';
import ManagedNode from '../models/ManagedNode';
import PersistenceFinding from '../models/PersistenceFinding';

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const router = express.Router();

/**
 * Get dashboard statistics
 * Endpoint: GET /api/dashboard/stats
 * Response: { activeProcesses: number, alertsLast24h: number, lastScanTime: string, systemStatus: string, managedNodesCount: number, totalFindings: number }
 */
router.get('/stats', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Dashboard] User ${req.user?.email} requested dashboard stats`);

    // Get active processes count
    const processes = await ProcessService.getAllProcesses();
    const activeProcesses = processes.length;

    // Get alerts count for last 24 hours
    const alertsLast24h = await AlertService.getAlertCount(24);

    // Get managed nodes stats
    const managedNodesCount = await ManagedNode.countDocuments();
    const allNodes = await ManagedNode.find({}, 'findingsCount');
    const totalFindings = allNodes.reduce((sum, n) => sum + (n.findingsCount || 0), 0);

    // Aggregate findings by severity
    const findingsBySeverity = await PersistenceFinding.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Aggregate findings by status (Active vs Resolved)
    const findingsByStatus = await PersistenceFinding.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Map to user-friendly objects
    const severityMap: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    findingsBySeverity.forEach(f => { if (f._id) severityMap[f._id] = f.count; });

    const statusMap: Record<string, number> = { active: 0, resolved: 0 };
    findingsByStatus.forEach(f => { if (f._id) statusMap[f._id] = f.count; });

    // Calculate system status based on high-risk processes and recent alerts
    const highRiskProcesses = processes.filter(p => p.riskScore >= 50);
    const criticalAlerts = await AlertService.getAlertsBySeverity('critical', 10);

    let systemStatus: string;
    if (criticalAlerts.length > 0 || highRiskProcesses.length > 5 || totalFindings > 5) {
      systemStatus = 'critical';
    } else if (highRiskProcesses.length > 0 || alertsLast24h > 10 || totalFindings > 0) {
      systemStatus = 'warning';
    } else {
      systemStatus = 'normal';
    }

    // Get last scan time (using most recent alert timestamp or current time)
    const recentAlerts = await AlertService.getRecentAlerts(1);
    const lastScanTime = recentAlerts.length > 0
      ? getRelativeTime(recentAlerts[0].timestamp)
      : 'Never';

    const stats = {
      activeProcesses,
      alertsLast24h,
      lastScanTime,
      systemStatus,
      managedNodesCount,
      totalFindings,
      findingsBySeverity: severityMap,
      findingsByStatus: statusMap
    };

    console.log(`[Dashboard] Returning stats:`, stats);
    res.status(200).json(stats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Dashboard] Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard statistics',
      message: errorMessage,
    });
  }
});

/**
 * Get recent alerts
 * Endpoint: GET /api/dashboard/alerts
 * Response: { alerts: Array<{ id: string, title: string, severity: string, timestamp: string, description: string }> }
 */
router.get('/alerts', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Dashboard] User ${req.user?.email} requested recent alerts`);

    const alerts = await AlertService.getRecentAlerts(24);

    // Format alerts for frontend
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id.toString(),
      title: alert.title,
      severity: alert.severity,
      timestamp: getRelativeTime(alert.timestamp),
      description: alert.description,
      source: alert.source,
    }));

    console.log(`[Dashboard] Returning ${formattedAlerts.length} alerts`);
    res.status(200).json(formattedAlerts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Dashboard] Error fetching alerts:', error);
    res.status(500).json({
      error: 'Failed to retrieve alerts',
      message: errorMessage,
    });
  }
});

/**
 * Helper function to convert timestamp to relative time
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}

export default router;
