import mongoose, { Document } from 'mongoose';
export interface IAlert extends Document {
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    source: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}
declare const Alert: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, {}> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Alert;
//# sourceMappingURL=Alert.d.ts.map