import mongoose, { Document, Schema } from 'mongoose';

export interface IAnomaly extends Document {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  process: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'simulated';
  metadata?: Record<string, unknown>;
}

const schema = new Schema<IAnomaly>({
  ruleId: {
    type: String,
    required: true,
    index: true,
  },
  ruleName: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true,
  },
  process: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'simulated'],
    default: 'active',
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, {
  versionKey: false,
  timestamps: true,
});

schema.index({ timestamp: -1, severity: 1 });
schema.index({ status: 1, timestamp: -1 });

const Anomaly = mongoose.model<IAnomaly>('Anomaly', schema);

export default Anomaly;
