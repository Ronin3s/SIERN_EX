import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    metadata: {
        type: Schema.Types.Mixed,
        required: false,
    },
    acknowledged: {
        type: Boolean,
        default: false,
    },
    acknowledgedBy: {
        type: String,
        required: false,
    },
    acknowledgedAt: {
        type: Date,
        required: false,
    },
}, {
    versionKey: false,
    timestamps: true,
});
// Index for efficient queries
schema.index({ timestamp: -1, severity: 1 });
schema.index({ acknowledged: 1, timestamp: -1 });
const Alert = mongoose.model('Alert', schema);
export default Alert;
//# sourceMappingURL=Alert.js.map