import axios from './api';

export interface ManagedNode {
  _id: string;
  name: string;
  ip: string;
  user: string;
  password?: string;
  status: 'online' | 'offline' | 'unauthorized' | 'unknown';
  findingsCount: number;
  lastSeen: string;
  labels: string[];
  os: 'linux' | 'windows' | 'macos' | 'unknown';
}

export interface PersistenceFinding {
  _id: string;
  nodeId: string;
  type: 'ssh' | 'cron' | 'service' | 'user' | 'file';
  name: string;
  indicator: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  status: 'active' | 'resolved' | 'ignored';
  firstSeen: string;
  lastSeen: string;
}

/**
 * Node Management
 */
export const getAllNodes = async (): Promise<ManagedNode[]> => {
  const response = await axios.get('/api/nodes');
  return response.data;
};

export const registerNode = async (nodeData: Partial<ManagedNode>): Promise<ManagedNode> => {
  const response = await axios.post('/api/nodes', nodeData);
  return response.data;
};

export const getNodeById = async (nodeId: string): Promise<ManagedNode> => {
  const response = await axios.get(`/api/nodes/${nodeId}`);
  return response.data;
};

export const deleteNode = async (nodeId: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(`/api/nodes/${nodeId}`);
  return response.data;
};

/**
 * Persistence Audit
 */
export const auditNodePersistence = async (nodeId: string): Promise<PersistenceFinding[]> => {
  const response = await axios.post(`/api/nodes/${nodeId}/audit`);
  return response.data;
};

export const getFindingsByNode = async (nodeId: string): Promise<PersistenceFinding[]> => {
  const response = await axios.get(`/api/nodes/${nodeId}/findings`);
  return response.data;
};

export const resolveFinding = async (findingId: string): Promise<PersistenceFinding> => {
  const response = await axios.post(`/api/nodes/findings/${findingId}/resolve`);
  return response.data;
};

export const analyzeFindingWithAI = async (findingId: string): Promise<{
  analysis: string;
  steps: string[];
  riskScore: number;
  toolsNeeded: string[];
}> => {
  const response = await axios.post(`/api/nodes/findings/${findingId}/ai-analyze`);
  return response.data;
};
