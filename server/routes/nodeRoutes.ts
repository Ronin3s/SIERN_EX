import express from 'express';
import * as NodeService from '../services/nodeService';
import * as PersistenceService from '../services/persistenceService';

const router = express.Router();

/**
 * Node Management Routes
 */
router.post('/', async (req, res) => {
    try {
        const node = await NodeService.registerNode(req.body);
        res.status(201).json(node);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const nodes = await NodeService.getAllNodes();
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const node = await NodeService.getNodeById(req.params.id);
        if (!node) return res.status(404).json({ error: 'Node not found' });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const success = await NodeService.deleteNode(req.params.id);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

/**
 * Persistence Audit Routes
 */
router.post('/:nodeId/audit', async (req, res) => {
    try {
        const findings = await PersistenceService.auditNodePersistence(req.params.nodeId);
        res.json(findings);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.get('/:nodeId/findings', async (req, res) => {
    try {
        const findings = await PersistenceService.getFindingsByNode(req.params.nodeId);
        res.json(findings);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.post('/findings/:findingId/resolve', async (req, res) => {
    try {
        const userEmail = (req as any).user?.email || 'admin@siern.local';
        const finding = await PersistenceService.resolveFinding(req.params.findingId, userEmail);
        res.json(finding);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

router.post('/findings/:findingId/ai-analyze', async (req, res) => {
    try {
        const { analyzeFindingWithAI } = await import('../services/aiService');
        const finding = await PersistenceService.getFindingById(req.params.findingId);
        if (!finding) return res.status(404).json({ error: 'Finding not found' });
        
        const analysis = await analyzeFindingWithAI(finding);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

export default router;
