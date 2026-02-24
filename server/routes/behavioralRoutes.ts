import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as BehavioralService from '../services/behavioralService';

interface AuthRequest extends Request {
    user?: Record<string, unknown>;
}

const router = express.Router();

/**
 * Get all detected anomalies
 * Endpoint: GET /api/behavioral/anomalies
 * Response: Array<Anomaly>
 */
router.get('/anomalies', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[Behavioral] User ${req.user?.email} requested anomalies`);
        const anomalies = await BehavioralService.getAnomalies();

        const formatted = anomalies.map((a) => ({
            id: a._id.toString(),
            ruleId: a.ruleId,
            ruleName: a.ruleName,
            severity: a.severity,
            process: a.process,
            timestamp: a.timestamp.toLocaleString(),
            status: a.status,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Behavioral] Error fetching anomalies:', error);
        res.status(500).json({
            error: 'Failed to retrieve anomalies',
            message: errorMessage,
        });
    }
});

/**
 * Simulate a behavioral event
 * Endpoint: POST /api/behavioral/simulate
 * Request: { ruleId: string }
 * Response: Anomaly
 */
router.post('/simulate', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        const { ruleId } = req.body;

        if (!ruleId || typeof ruleId !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'ruleId is required and must be a string',
            });
        }

        console.log(`[Behavioral] User ${req.user?.email} simulating event for rule: ${ruleId}`);
        const anomaly = await BehavioralService.simulateEvent(ruleId);

        res.status(200).json({
            id: anomaly._id.toString(),
            ruleId: anomaly.ruleId,
            ruleName: anomaly.ruleName,
            severity: anomaly.severity,
            process: anomaly.process,
            timestamp: anomaly.timestamp.toLocaleString(),
            status: anomaly.status,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Behavioral] Error simulating event:', error);
        res.status(500).json({
            error: 'Simulation failed',
            message: errorMessage,
        });
    }
});

/**
 * Run a detection scan against live processes
 * Endpoint: POST /api/behavioral/scan
 * Response: { detected: number, anomalies: Array<Anomaly> }
 */
router.post('/scan', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[Behavioral] User ${req.user?.email} initiated detection scan`);
        const anomalies = await BehavioralService.runDetectionScan();

        const formatted = anomalies.map((a) => ({
            id: a._id.toString(),
            ruleId: a.ruleId,
            ruleName: a.ruleName,
            severity: a.severity,
            process: a.process,
            timestamp: a.timestamp.toLocaleString(),
            status: a.status,
        }));

        res.status(200).json({
            detected: formatted.length,
            anomalies: formatted,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Behavioral] Error during scan:', error);
        res.status(500).json({
            error: 'Detection scan failed',
            message: errorMessage,
        });
    }
});

/**
 * Resolve an anomaly
 * Endpoint: POST /api/behavioral/resolve/:id
 * Response: { success: boolean }
 */
router.post('/resolve/:id', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[Behavioral] User ${req.user?.email} resolving anomaly: ${id}`);

        const anomaly = await BehavioralService.resolveAnomaly(id);
        if (!anomaly) {
            return res.status(404).json({ error: 'Anomaly not found' });
        }

        res.status(200).json({ success: true, message: 'Anomaly resolved' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Behavioral] Error resolving anomaly:', error);
        res.status(500).json({
            error: 'Failed to resolve anomaly',
            message: errorMessage,
        });
    }
});

export default router;
