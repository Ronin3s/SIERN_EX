import mongoose, { Document, Schema } from 'mongoose';

export interface IManagedNode extends Document {
  name: string;
  ip: string;
  user: string;
  password?: string;
  sshKeyPath?: string;
  sshPassword?: string; // encrypted in reality, but for this SOC project we'll store as is or mock
  status: 'online' | 'offline' | 'unauthorized' | 'unknown';
  findingsCount: number;
  lastSeen: Date;
  labels: string[];
  os: 'linux' | 'windows' | 'macos' | 'unknown';
}

const schema = new Schema<IManagedNode>({
  name: { type: String, required: true },
  ip: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  password: { type: String },
  sshKeyPath: { type: String },
  sshPassword: { type: String },
  status: { type: String, enum: ['online', 'offline', 'unauthorized', 'unknown'], default: 'unknown' },
  findingsCount: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now },
  labels: [{ type: String }],
  os: { type: String, enum: ['linux', 'windows', 'macos', 'unknown'], default: 'linux' },
}, {
  versionKey: false,
  timestamps: true,
});

const ManagedNode = mongoose.model<IManagedNode>('ManagedNode', schema);

export default ManagedNode;
