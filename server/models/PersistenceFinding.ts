import mongoose, { Document, Schema } from 'mongoose';

export interface IPersistenceFinding extends Document {
  nodeId: mongoose.Types.ObjectId;
  type: 'ssh' | 'cron' | 'service' | 'user' | 'file';
  name: string;
  indicator: string; // e.g. the SSH key, cron command, service name
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  status: 'active' | 'resolved' | 'ignored';
  firstSeen: Date;
  lastSeen: Date;
  metadata?: Record<string, unknown>;
}

const schema = new Schema<IPersistenceFinding>({
  nodeId: { type: Schema.Types.ObjectId, ref: 'ManagedNode', required: true },
  type: { type: String, enum: ['ssh', 'cron', 'service', 'user', 'file'], required: true },
  name: { type: String, required: true },
  indicator: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  description: { type: String, required: true },
  remediation: { type: String, default: '' },
  status: { type: String, enum: ['active', 'resolved', 'ignored'], default: 'active' },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
}, {
  versionKey: false,
  timestamps: true,
});

// Index for efficient queries
schema.index({ nodeId: 1, type: 1, status: 1 });

const PersistenceFinding = mongoose.model<IPersistenceFinding>('PersistenceFinding', schema);

export default PersistenceFinding;
