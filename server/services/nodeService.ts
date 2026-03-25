import ManagedNode, { IManagedNode } from '../models/ManagedNode';
import mongoose from 'mongoose';

/**
 * Register a new node
 */
export async function registerNode(nodeData: Partial<IManagedNode>): Promise<IManagedNode> {
    try {
        console.log(`[NodeService] Registering node: ${nodeData.name} (${nodeData.ip})`);
        const node = await ManagedNode.create(nodeData);
        return node;
    } catch (error) {
        console.error('[NodeService] Error registering node:', error);
        throw new Error(`Failed to register node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get all monitored nodes
 */
export async function getAllNodes(): Promise<IManagedNode[]> {
    try {
        return await ManagedNode.find({}).sort({ name: 1 });
    } catch (error) {
        console.error('[NodeService] Error fetching nodes:', error);
        throw new Error('Failed to fetch nodes');
    }
}

/**
 * Get a specific node by ID
 */
export async function getNodeById(nodeId: string): Promise<IManagedNode | null> {
    try {
        return await ManagedNode.findById(nodeId);
    } catch (error) {
        console.error('[NodeService] Error fetching node:', error);
        throw new Error('Failed to fetch node');
    }
}

/**
 * Update node status
 */
export async function updateNodeStatus(nodeId: string, status: IManagedNode['status']): Promise<IManagedNode | null> {
    try {
        return await ManagedNode.findByIdAndUpdate(
            nodeId,
            { status, lastSeen: new Date() },
            { new: true }
        );
    } catch (error) {
        console.error('[NodeService] Error updating node status:', error);
        throw new Error('Failed to update node status');
    }
}

/**
 * Delete a node
 */
export async function deleteNode(nodeId: string): Promise<boolean> {
    try {
        const result = await ManagedNode.findByIdAndDelete(nodeId);
        return !!result;
    } catch (error) {
        console.error('[NodeService] Error deleting node:', error);
        throw new Error('Failed to delete node');
    }
}
