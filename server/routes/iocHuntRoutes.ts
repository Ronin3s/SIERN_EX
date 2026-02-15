import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as IOCHuntService from '../services/iocHuntService';

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const router = express.Router();

/**
 * Start IOC hunt
 * Endpoint: POST /api/ioc-hunt
 * Request: { iocs: string[], scope: 'processes' | 'filesystem' | 'both', searchPath?: string }
 * Response: { results: Array<IOCMatch> }
 */
router.post('/', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { iocs, scope, searchPath } = req.body;

    console.log(`[IOC Hunt] User ${req.user?.email} initiated IOC hunt`);
    console.log(`[IOC Hunt] IOCs: ${iocs?.length || 0}, Scope: ${scope}`);

    // Validate input
    if (!iocs || !Array.isArray(iocs) || iocs.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'iocs is required and must be a non-empty array',
      });
    }

    if (!scope || !['processes', 'filesystem', 'both'].includes(scope)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'scope is required and must be one of: processes, filesystem, both',
      });
    }

    // Validate each IOC is a non-empty string
    for (const ioc of iocs) {
      if (typeof ioc !== 'string' || ioc.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'All IOCs must be non-empty strings',
        });
      }
    }

    const results = await IOCHuntService.startIOCHunt({
      iocs,
      scope,
      searchPath: searchPath || '/tmp',
    });

    console.log(`[IOC Hunt] Hunt complete. Found ${results.length} matches`);
    res.status(200).json({ results });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IOC Hunt] Error during hunt:', error);
    res.status(500).json({
      error: 'IOC hunt failed',
      message: errorMessage,
    });
  }
});

/**
 * Get hunt results (for compatibility with existing frontend)
 * Endpoint: GET /api/ioc-hunt/results
 * Response: { results: Array<IOCMatch> }
 */
router.get('/results', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[IOC Hunt] User ${req.user?.email} requested hunt results`);

    // For now, return empty array since hunts are stateless
    // In a production system, you'd store hunt results in the database
    res.status(200).json({ results: [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IOC Hunt] Error fetching results:', error);
    res.status(500).json({
      error: 'Failed to retrieve hunt results',
      message: errorMessage,
    });
  }
});

export default router;
