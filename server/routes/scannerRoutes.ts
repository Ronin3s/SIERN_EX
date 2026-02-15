import express, { Request, Response } from 'express';
import { requireUser } from './middlewares/auth';
import * as ScannerService from '../services/scannerService';

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const router = express.Router();

/**
 * Start a file integrity scan
 * Endpoint: POST /api/scanner/scan
 * Request: { path: string, includeSubdirectories: boolean, compareAgainstBaseline: boolean }
 * Response: { results: Array<FileChange> }
 */
router.post('/scan', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { path, includeSubdirectories, compareAgainstBaseline } = req.body;

    console.log(`[Scanner] User ${req.user?.email} initiated scan`);
    console.log(`[Scanner] Path: ${path}, Include subdirs: ${includeSubdirectories}, Compare baseline: ${compareAgainstBaseline}`);

    // Validate input
    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Path is required and must be a string',
      });
    }

    if (typeof includeSubdirectories !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'includeSubdirectories must be a boolean',
      });
    }

    if (typeof compareAgainstBaseline !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'compareAgainstBaseline must be a boolean',
      });
    }

    const results = await ScannerService.startScan({
      path,
      includeSubdirectories,
      compareAgainstBaseline,
    });

    console.log(`[Scanner] Scan complete. Found ${results.length} results`);
    res.status(200).json({ results });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scanner] Error during scan:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: errorMessage,
    });
  }
});

/**
 * Get baseline
 * Endpoint: GET /api/scanner/baseline
 * Response: { baseline: Array<FileBaseline> }
 */
router.get('/baseline', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    console.log(`[Scanner] User ${req.user?.email} requested baseline`);

    const baseline = await ScannerService.getBaseline();

    // Format baseline for frontend
    const formattedBaseline = baseline.map(item => ({
      filePath: item.filePath,
      hash: item.hash,
      lastModified: item.lastModified.toISOString(),
      status: 'baseline',
      size: item.size,
    }));

    console.log(`[Scanner] Returning ${formattedBaseline.length} baseline entries`);
    res.status(200).json(formattedBaseline);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scanner] Error fetching baseline:', error);
    res.status(500).json({
      error: 'Failed to retrieve baseline',
      message: errorMessage,
    });
  }
});

/**
 * Create or update baseline
 * Endpoint: POST /api/scanner/baseline
 * Request: { path: string, includeSubdirectories: boolean }
 * Response: { success: boolean, message: string, created: number, updated: number }
 */
router.post('/baseline', requireUser(), async (req: AuthRequest, res: Response) => {
  try {
    const { path, includeSubdirectories } = req.body;

    console.log(`[Scanner] User ${req.user?.email} creating/updating baseline`);
    console.log(`[Scanner] Path: ${path}, Include subdirs: ${includeSubdirectories}`);

    // Validate input
    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Path is required and must be a string',
      });
    }

    if (typeof includeSubdirectories !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'includeSubdirectories must be a boolean',
      });
    }

    const result = await ScannerService.createBaseline(path, includeSubdirectories);

    console.log(`[Scanner] Baseline created/updated: ${result.created} new, ${result.updated} updated`);
    res.status(200).json({
      success: true,
      message: `Baseline created/updated successfully`,
      created: result.created,
      updated: result.updated,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scanner] Error creating baseline:', error);
    res.status(500).json({
      error: 'Failed to create baseline',
      message: errorMessage,
    });
  }
});

export default router;
