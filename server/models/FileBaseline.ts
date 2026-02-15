import mongoose, { Document, Schema } from 'mongoose';

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

const schema = new Schema<IFileBaseline>({
  filePath: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  hash: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  lastModified: {
    type: Date,
    required: true,
  },
  permissions: {
    type: String,
    required: false,
  },
  owner: {
    type: String,
    required: false,
  },
  baselineCreatedAt: {
    type: Date,
    default: Date.now,
  },
  lastChecked: {
    type: Date,
    required: false,
  },
}, {
  versionKey: false,
});

const FileBaseline = mongoose.model<IFileBaseline>('FileBaseline', schema);

export default FileBaseline;
