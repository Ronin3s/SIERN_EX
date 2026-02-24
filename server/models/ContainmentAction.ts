import mongoose, { Document, Schema } from 'mongoose';

export interface IContainmentAction extends Document {
    type: 'kill' | 'isolate' | 'quarantine';
    target: string;
    timestamp: Date;
    status: 'active' | 'resolved';
    user: string;
    description?: string;
    result: 'success' | 'failed';
    metadata?: Record<string, unknown>;
}

const schema = new Schema<IContainmentAction>({
    type: {
        type: String,
        enum: ['kill', 'isolate', 'quarantine'],
        required: true,
    },
    target: {
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
        enum: ['active', 'resolved'],
        default: 'active',
    },
    user: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    result: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success',
    },
    metadata: {
        type: Schema.Types.Mixed,
        required: false,
    },
}, {
    versionKey: false,
    timestamps: true,
});

schema.index({ status: 1, timestamp: -1 });
schema.index({ user: 1, timestamp: -1 });

const ContainmentAction = mongoose.model<IContainmentAction>('ContainmentAction', schema);

export default ContainmentAction;
