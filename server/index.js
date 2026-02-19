const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const io = new Server(server, {
    cors: {
        origin: corsOrigin,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));
app.use('/thumbnails', express.static('thumbnails'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Export io for use in controllers
app.set('io', io);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/video-stream-app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Video Stream App API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
