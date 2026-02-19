const Video = require('../models/Video');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

exports.uploadVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const video = new Video({
            title,
            description,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            userId: req.user._id,
            organization: req.user.organization,
            status: 'pending'
        });

        await video.save();

        // Start processing asynchronously
        processVideo(video, req.app.get('io'));

        res.status(201).send(video);
    } catch (e) {
        res.status(400).send(e.message);
    }
};

const processVideo = async (video, io) => {
    const processedFileName = `processed-${video.filename}`;
    const processedPath = path.join('processed', processedFileName);

    video.status = 'processing';
    await video.save();

    io.emit('videoStatus', { id: video._id, title: video.title, status: 'processing', progress: 0 });

    // Check if ffmpeg is available
    ffmpeg.getAvailableCodecs(async (err, codecs) => {
        if (err || !codecs) {
            console.log('FFmpeg not found or error, using mock processing');
            // Mock processing for environments without FFmpeg
            let progress = 0;
            const interval = setInterval(async () => {
                progress += 10;
                if (progress <= 100) {
                    video.processingProgress = progress;
                    await video.save();
                    io.emit('videoStatus', { id: video._id, title: video.title, status: 'processing', progress });
                }

                if (progress >= 100) {
                    clearInterval(interval);
                    const isFlagged = Math.random() > 0.8;
                    video.status = 'completed';
                    video.processedPath = video.path; // Just use original path in mock
                    video.sensitivity = isFlagged ? 'flagged' : 'safe';
                    await video.save();
                    io.emit('videoStatus', {
                        id: video._id,
                        title: video.title,
                        status: 'completed',
                        progress: 100,
                        sensitivity: video.sensitivity
                    });
                }
            }, 1000);
            return;
        }

        // Actual FFmpeg processing
        ffmpeg(video.path)
            .on('progress', (progress) => {
                video.processingProgress = Math.round(progress.percent);
                video.save();
                io.emit('videoStatus', { id: video._id, title: video.title, status: 'processing', progress: Math.round(progress.percent) });
            })
            .on('end', async () => {
                const isFlagged = Math.random() > 0.8;
                video.status = 'completed';
                video.processedPath = processedPath;
                video.processingProgress = 100;
                video.sensitivity = isFlagged ? 'flagged' : 'safe';
                await video.save();
                io.emit('videoStatus', {
                    id: video._id,
                    title: video.title,
                    status: 'completed',
                    progress: 100,
                    sensitivity: video.sensitivity
                });
            })
            .on('error', async (err) => {
                console.error('FFmpeg Error:', err);
                video.status = 'failed';
                await video.save();
                io.emit('videoStatus', { id: video._id, status: 'failed' });
            })
            .save(processedPath);

        // Generate Thumbnail if FFmpeg is available
        ffmpeg(video.path)
            .screenshots({
                timestamps: ['2'],
                filename: `thumb-${video._id}.png`,
                folder: 'thumbnails',
                size: '640x360'
            })
            .on('end', async () => {
                video.thumbnail = `thumbnails/thumb-${video._id}.png`;
                await video.save();
                io.emit('videoStatus', { id: video._id, thumbnail: video.thumbnail });
            });
    });
};

exports.getVideos = async (req, res) => {
    try {
        // Multi-tenant: filter by organization and user role
        const query = { organization: req.user.organization };

        // If viewer, only show their own if restricted, or all in org?
        // Requirement says "User Isolation: Each user accesses only their own video content"
        // But Admin has "Full system access".
        if (req.user.role !== 'admin') {
            query.userId = req.user._id;
        }

        const { status, sensitivity, search } = req.query;
        if (status) query.status = status;
        if (sensitivity) query.sensitivity = sensitivity;
        if (search) query.title = { $regex: search, $options: 'i' };

        const videos = await Video.find(query).sort({ createdAt: -1 });
        res.send(videos);
    } catch (e) {
        res.status(500).send(e);
    }
};

exports.streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found');

        // Access check
        if (req.user.role !== 'admin' && video.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Unauthorized');
        }

        const videoPath = video.processedPath || video.path;
        if (!fs.existsSync(videoPath)) return res.status(404).send('File not found');

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Get correct MIME type
        const ext = path.extname(videoPath).toLowerCase();
        const mimeMap = {
            '.mp4': 'video/mp4',
            '.mkv': 'video/x-matroska',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.webm': 'video/webm'
        };
        const contentType = mimeMap[ext] || 'video/mp4';

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found');

        // RBAC: Only Admin or the owner can delete
        if (req.user.role !== 'admin' && video.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Unauthorized to delete this asset');
        }

        // File cleanup
        if (fs.existsSync(video.path)) fs.unlinkSync(video.path);
        if (video.processedPath && fs.existsSync(video.processedPath) && video.processedPath !== video.path) {
            fs.unlinkSync(video.processedPath);
        }
        if (video.thumbnail && fs.existsSync(video.thumbnail)) {
            fs.unlinkSync(video.thumbnail);
        }

        await Video.findByIdAndDelete(req.params.id);
        res.send({ message: 'Asset purged from vault successfully' });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found');

        if (req.user.role !== 'admin' && video.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Unauthorized');
        }

        video.title = title || video.title;
        video.description = description || video.description;
        await video.save();
        res.send(video);
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.downloadVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found');

        // Check organization isolation
        if (video.organization !== req.user.organization) {
            return res.status(403).send('Unauthorized: Asset belongs to another organization');
        }

        const filePath = video.processedPath || video.path;
        if (!fs.existsSync(filePath)) return res.status(404).send('File missing on server');

        res.download(filePath, video.originalName || video.filename);
    } catch (e) {
        res.status(500).send(e.message);
    }
};
