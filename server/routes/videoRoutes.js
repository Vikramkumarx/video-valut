const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');
const { auth, checkRole } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];
        if (!allowedExtensions.includes(ext)) {
            return cb(new Error('Only videos are allowed'));
        }
        cb(null, true);
    }
});

router.post('/upload', auth, checkRole(['editor', 'admin']), upload.single('video'), videoController.uploadVideo);
router.get('/', auth, videoController.getVideos);
router.get('/stream/:id', auth, videoController.streamVideo);
router.put('/:id', auth, checkRole(['admin', 'editor']), videoController.updateVideo);
router.delete('/:id', auth, checkRole(['admin', 'editor']), videoController.deleteVideo);
router.get('/download/:id', auth, videoController.downloadVideo);

module.exports = router;
