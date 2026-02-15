import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
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
const FileBaseline = mongoose.model('FileBaseline', schema);
export default FileBaseline;
//# sourceMappingURL=FileBaseline.js.map