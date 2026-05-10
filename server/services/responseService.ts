import ContainmentAction, { IContainmentAction } from '../models/ContainmentAction';

export interface CreateActionData {
    type: 'kill' | 'isolate' | 'quarantine' | 'resolve' | 'audit' | 'hunt' | 'block';
    target: string;
    user: string;
    description?: string;
    result?: 'success' | 'failed';
    metadata?: Record<string, unknown>;
}

/**
 * Create a new containment action
 */
export async function createAction(data: CreateActionData): Promise<IContainmentAction> {
    try {
        console.log(`[Response] Creating containment action: ${data.type} on ${data.target}`);

        const action = await ContainmentAction.create({
            type: data.type,
            target: data.target,
            user: data.user,
            description: data.description || `${data.type} action on ${data.target}`,
            result: data.result || 'success',
            status: 'active',
            timestamp: new Date(),
            metadata: data.metadata,
        });

        console.log(`[Response] Action created: ${action._id}`);
        return action;
    } catch (error) {
        console.error('[Response] Error creating action:', error);
        throw new Error(`Failed to create action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get all active containment actions
 */
export async function getActiveContainments(): Promise<IContainmentAction[]> {
    try {
        console.log('[Response] Fetching active containments');
        const actions = await ContainmentAction.find({ status: 'active' })
            .sort({ timestamp: -1 })
            .limit(50);
        console.log(`[Response] Retrieved ${actions.length} active containments`);
        return actions;
    } catch (error) {
        console.error('[Response] Error fetching containments:', error);
        throw new Error(`Failed to fetch containments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get full action history (all statuses)
 */
export async function getActionHistory(limit: number = 100): Promise<IContainmentAction[]> {
    try {
        console.log('[Response] Fetching action history');
        const actions = await ContainmentAction.find({})
            .sort({ timestamp: -1 })
            .limit(limit);
        console.log(`[Response] Retrieved ${actions.length} history entries`);
        return actions;
    } catch (error) {
        console.error('[Response] Error fetching history:', error);
        throw new Error(`Failed to fetch history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Undo/resolve a containment action
 */
export async function undoAction(actionId: string): Promise<IContainmentAction | null> {
    try {
        console.log(`[Response] Undoing action: ${actionId}`);
        const action = await ContainmentAction.findByIdAndUpdate(
            actionId,
            { status: 'resolved' },
            { new: true }
        );

        if (!action) {
            console.warn(`[Response] Action ${actionId} not found`);
            return null;
        }

        console.log(`[Response] Action ${actionId} resolved`);
        return action;
    } catch (error) {
        console.error('[Response] Error undoing action:', error);
        throw new Error(`Failed to undo action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
