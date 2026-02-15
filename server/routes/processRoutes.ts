import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as ProcessService from '../services/processService';

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const router = express.Router();

// Description: Get list of running processes with metrics and risk scoring
// Endpoint: GET /api/processes
// Request: {}
// Response: { processes: Array<{ id: string, name: string, pid: number, user: string, cpu: number, memory: number, path: string, riskScore: number }> }
router.get('/', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Process Monitor] User ${req.user?.email} requested process list`);

    const processes = await ProcessService.getAllProcesses();

    console.log(`[Process Monitor] Returning ${processes.length} processes to user`);

    res.status(200).json({ processes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Process Monitor] Error fetching processes:', error);
    res.status(500).json({
      error: 'Failed to retrieve processes',
      message: errorMessage,
    });
  }
});

// Description: Terminate a process by ID
// Endpoint: POST /api/processes/:id/kill
// Request: { id: string (PID) }
// Response: { success: boolean, message: string }
router.post('/:id/kill', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pid = parseInt(id, 10);

    if (isNaN(pid) || pid <= 0) {
      console.warn(`[Process Monitor] Invalid PID provided: ${id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid process ID',
        message: 'Process ID must be a positive integer',
      });
    }

    console.log(`[Process Monitor] User ${req.user?.email} attempting to terminate process ${pid}`);

    const result = await ProcessService.terminateProcess(pid);

    if (result.success) {
      console.log(`[Process Monitor] Process ${pid} terminated successfully`);
      res.status(200).json(result);
    } else {
      console.warn(`[Process Monitor] Failed to terminate process ${pid}: ${result.message}`);
      res.status(400).json(result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Process Monitor] Error terminating process:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to terminate process',
      message: errorMessage,
    });
  }
});

export default router;
