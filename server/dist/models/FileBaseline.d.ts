import mongoose, { Document } from 'mongoose';
export interface IFileBaseline extends Document {
    filePath: string;
    hash: string;
    size: number;
    lastModified: Date;
    permissions?: string;
    owner?: string;
    baselineCreatedAt: Date;
    lastChecked?: Date;
}
declare const FileBaseline: mongoose.Model<IFileBaseline, {}, {}, {}, mongoose.Document<unknown, {}, IFileBaseline, {}, {}> & IFileBaseline & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default FileBaseline;
//# sourceMappingURL=FileBaseline.d.ts.map