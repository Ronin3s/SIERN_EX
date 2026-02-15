import Alert, { IAlert } from '../models/Alert';

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
export async function createAlert(data: CreateAlertData): Promise<IAlert> {
  try {
    console.log(`Creating alert: ${data.title} [${data.severity}]`);

    const alert = new Alert({
      title: data.title,
      severity: data.severity,
      description: data.description,
      source: data.source,
      metadata: data.metadata,
      timestamp: new Date(),
      acknowledged: false,
    });

    await alert.save();
    console.log(`Alert created successfully: ${alert._id}`);

    return alert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw new Error(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get recent alerts (last 24 hours by default)
 */
export async function getRecentAlerts(hours: number = 24): Promise<IAlert[]> {
  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    console.log(`Fetching alerts since: ${since.toISOString()}`);

    const alerts = await Alert.find({
      timestamp: { $gte: since },
    })
      .sort({ timestamp: -1 })
      .limit(100);

    console.log(`Retrieved ${alerts.length} alerts`);
    return alerts;
  } catch (error) {
    console.error('Error fetching recent alerts:', error);
    throw new Error(`Failed to fetch alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get alert count for the last N hours
 */
export async function getAlertCount(hours: number = 24): Promise<number> {
  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const count = await Alert.countDocuments({
      timestamp: { $gte: since },
    });

    console.log(`Alert count for last ${hours} hours: ${count}`);
    return count;
  } catch (error) {
    console.error('Error counting alerts:', error);
    throw new Error(`Failed to count alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string, userId: string): Promise<IAlert | null> {
  try {
    console.log(`Acknowledging alert ${alertId} by user ${userId}`);

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      console.warn(`Alert ${alertId} not found`);
      return null;
    }

    console.log(`Alert ${alertId} acknowledged successfully`);
    return alert;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw new Error(`Failed to acknowledge alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get alerts by severity
 */
export async function getAlertsBySeverity(severity: string, limit: number = 50): Promise<IAlert[]> {
  try {
    const alerts = await Alert.find({ severity })
      .sort({ timestamp: -1 })
      .limit(limit);

    return alerts;
  } catch (error) {
    console.error('Error fetching alerts by severity:', error);
    throw new Error(`Failed to fetch alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
