const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    filename: { type: String, required: true },
    originalName: { type: String },
    path: { type: String, required: true },
    processedPath: { type: String },
    thumbnail: { type: String },
    size: { type: Number },
    duration: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    sensitivity: {
        type: String,
        enum: ['unprocessed', 'safe', 'flagged'],
        default: 'unprocessed'
    },
    processingProgress: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
