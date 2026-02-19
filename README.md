# StreamVault | Secure Video Management & Streaming

StreamVault is a comprehensive full-stack application for industrial video management. It enables secure uploads, automated sensitivity analysis, and seamless streaming with real-time processing updates.

## 🚀 Quick Start

### Prerequisites
- Node.js (Latest LTS)
- MongoDB (Running locally or on Atlas)
- FFmpeg (Optional, falls back to mock processing if not found)

### Setup Instructions

1. **Clone and Install Backend**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the `server` directory (one is already provided in the scratch folder):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/video-stream-app
   JWT_SECRET=your_jwt_secret
   ```

3. **Install Frontend**
   ```bash
   cd client
   npm install
   ```

4. **Running the Application**
   - Start Backend: `cd server && node index.js`
   - Start Frontend: `cd client && npm run dev`

## 🛠 Features

### 1. Robust Video Upload & Processing
- **Multer-powered Uploads**: Supports MP4, MKV, and AVI.
- **FFmpeg Pipeline**: Automated processing for web-optimization.
- **Mock Fallback**: Graceful degradation if FFmpeg is unavailable.

### 2. Multi-Tenant Architecture
- **Organization Isolation**: Data is segregated by organization ID.
- **User Isolation**: Standard users only see their own content.

### 3. Role-Based Access Control (RBAC)
- **Viewer**: Read-only access to assigned videos.
- **Editor**: Can upload and manage videos within their organization.
- **Admin**: Full system control.

### 4. Real-Time Tracking
- **Socket.io Integration**: Live progress bars for uploads and background processing steps.
- **Status Indicators**: Instant UI updates for 'Processing', 'Safe', or 'Flagged' status.

### 5. Premium Streaming
- **HTTP Range Requests**: Supports seeking and efficient bandwidth usage.
- **Glassmorphism UI**: High-end aesthetic with responsive layouts.

## 📖 API Documentation Summary

- `POST /api/auth/register`: User registration with RBAC roles.
- `POST /api/auth/login`: Identity verification and JWT issuance.
- `GET /api/videos`: Multi-tenant filtered video library.
- `POST /api/videos/upload`: Multipart video upload (Editors/Admins).
- `GET /api/videos/stream/:id`: Range-request based video streaming.

## 💡 Assumptions & Design Decisions
- **Local Storage**: For this demo, videos are stored in the `server/uploads` and `server/processed` folders.
- **Sensitivity Threshold**: A 20% random flag rate is simulated to demonstrate the 'Flagged' vs 'Safe' UI states.
- **Tech Stack**: React + Vite for speed, Express for modularity, and MongoDB for flexible video metadata.

---
Developed for the Full-Stack Engineering Assignment.
