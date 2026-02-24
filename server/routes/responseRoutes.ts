import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as ResponseService from '../services/responseService';

interface AuthRequest extends Request {
    user?: Record<string, unknown>;
}

const router = express.Router();

/**
 * Get active containment actions
 * Endpoint: GET /api/response/containments
 * Response: Array<ContainmentAction>
 */
router.get('/containments', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[Response] User ${req.user?.email} requested active containments`);
        const actions = await ResponseService.getActiveContainments();

        const formatted = actions.map((a) => ({
            id: a._id.toString(),
            type: a.type,
            target: a.target,
            timestamp: a.timestamp.toLocaleString(),
            status: a.status,
            user: a.user,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Response] Error fetching containments:', error);
        res.status(500).json({
            error: 'Failed to retrieve containments',
            message: errorMessage,
        });
    }
});

/**
 * Get action history
 * Endpoint: GET /api/response/history
 * Response: Array<ActionHistoryItem>
 */
router.get('/history', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[Response] User ${req.user?.email} requested action history`);
        const actions = await ResponseService.getActionHistory();

        const formatted = actions.map((a) => ({
            id: a._id.toString(),
            action: `${a.type.charAt(0).toUpperCase() + a.type.slice(1)}`,
            description: a.description || `${a.type} action on ${a.target}`,
            timestamp: a.timestamp.toLocaleString(),
            user: a.user,
            result: a.result,
        }));

        res.status(200).json(formatted);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Response] Error fetching history:', error);
        res.status(500).json({
            error: 'Failed to retrieve action history',
            message: errorMessage,
        });
    }
});

/**
 * Undo a containment action
 * Endpoint: POST /api/response/undo/:id
 * Response: { success: boolean, message: string }
 */
router.post('/undo/:id', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[Response] User ${req.user?.email} undoing action: ${id}`);

        const action = await ResponseService.undoAction(id);
        if (!action) {
            return res.status(404).json({ success: false, message: 'Action not found' });
        }

        res.status(200).json({ success: true, message: 'Action reversed' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Response] Error undoing action:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to undo action',
            message: errorMessage,
        });
    }
});

/**
 * Create a containment action manually
 * Endpoint: POST /api/response/containments
 * Request: { type: string, target: string }
 * Response: ContainmentAction
 */
router.post('/containments', requireUser(), async (req: AuthRequest, res: Response) => {
    try {
        const { type, target } = req.body;

        if (!type || !['kill', 'isolate', 'quarantine'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'type must be one of: kill, isolate, quarantine',
            });
        }

        if (!target || typeof target !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'target is required and must be a string',
            });
        }

        const userEmail = (req.user?.email as string) || 'unknown';
        console.log(`[Response] User ${userEmail} creating containment: ${type} on ${target}`);

        const action = await ResponseService.createAction({
            type,
            target,
            user: userEmail,
        });

        res.status(201).json({
            id: action._id.toString(),
            type: action.type,
            target: action.target,
            timestamp: action.timestamp.toLocaleString(),
            status: action.status,
            user: action.user,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Response] Error creating containment:', error);
        res.status(500).json({
            error: 'Failed to create containment',
            message: errorMessage,
        });
    }
});

export default router;
