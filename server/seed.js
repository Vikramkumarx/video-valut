const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Video = require('./models/Video');
require('dotenv').config();

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PROCESSED_DIR = path.join(__dirname, 'processed');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR);

const demoVideos = [
    {
        title: "Big Buck Bunny Intro",
        description: "Classic open-source animation sample.",
        url: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
        title: "Ocean Waves",
        description: "High quality nature footage for streaming tests.",
        url: "https://vjs.zencdn.net/v/oceans.mp4"
    },
    {
        title: "Classroom Monitoring",
        description: "AI training sample video of a classroom.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/classroom.mp4"
    },
    {
        title: "Walking Demographics",
        description: "Public space analytics sample footage.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/face-demographics-walking-and-pause.mp4"
    },
    {
        title: "Face Detection Test",
        description: "Close up portrait for facial recognition testing.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/head-pose-face-detection-female.mp4"
    },
    {
        title: "I Can Eat Glass",
        description: "Artistic/Abstract sample video content.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/i-can-eat-glass.mp4"
    },
    {
        title: "People Detection",
        description: "Security camera style footage for detection pipelines.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/people-detection.mp4"
    },
    {
        title: "Store Aisle Analysis",
        description: "Retail monitoring sample video.",
        url: "https://github.com/intel-iot-devkit/sample-videos/raw/master/store-aisle-detection.mp4"
    },
    {
        title: "Sample MP4 1MB",
        description: "Lightweight video for quick processing tests.",
        url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
    }
];

async function downloadVideo(url, filename) {
    const filePath = path.join(UPLOADS_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    console.log(`Downloading: ${url} -> ${filename}`);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/video-stream-app');
        console.log('Connected to MongoDB');

        // Create Demo Admin User
        let admin = await User.findOne({ email: 'admin@streamvault.com' });
        if (!admin) {
            admin = new User({
                name: "Demo Admin",
                email: "admin@streamvault.com",
                password: "password123",
                role: "admin",
                organization: "StreamVault"
            });
            await admin.save();
            console.log('Demo Admin created: admin@streamvault.com / password123');
        }

        console.log('Starting video downloads (Total: 9)...');

        for (let i = 0; i < demoVideos.length; i++) {
            const v = demoVideos[i];
            const filename = `demo-${i + 1}.mp4`;

            try {
                await downloadVideo(v.url, filename);

                const stats = fs.statSync(path.join(UPLOADS_DIR, filename));

                const videoDoc = new Video({
                    title: v.title,
                    description: v.description,
                    filename: filename,
                    originalName: filename,
                    path: path.join('uploads', filename),
                    size: stats.size,
                    status: 'completed',
                    sensitivity: i % 4 === 0 ? 'flagged' : 'safe', // Mock some flagged videos
                    userId: admin._id,
                    organization: admin.organization,
                    processingProgress: 100
                });

                await videoDoc.save();
                console.log(`Successfully seeded: ${v.title}`);
            } catch (err) {
                console.error(`Error downloading ${v.title}:`, err.message);
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
