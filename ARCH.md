# Architecture & Technical Design

## System Overview

StreamVault follows a classic **Micro-Split Monolith** architecture, separating the concerns of the Frontend (Client) and Backend (Server) while maintaining a clean, modular structure.

### 🏗 Component Structure

```text
[ Client (React/Vite) ] <--- Socket.io / REST ---> [ Server (Express/Node) ]
          |                                               |
[ AuthContext / Router ]                        [ Auth Middleware (JWT/RBAC) ]
          |                                               |
[ Dashboard / Player ]                          [ Video Controller / FFmpeg ]
                                                          |
                                                [ Storage (Disk) / MongoDB ]
```

## 🔐 Security & Multi-Tenancy

### 1. Data Segregation
Every `Video` and `User` document in MongoDB is tagged with an `organization` field.
- Middlewares and Controllers enforce an implicit `where organization = current_user.org` on all queries.
- Primary keys are non-sequential (UUIDs/ObjectIDs) to prevent ID enumeration.

### 2. RBAC (Role-Based Access Control)
Roles are enforced at the Route level:
- **Viewer**: can only `GET` videos.
- **Editor**: can `POST` and `PUT` video content.
- **Admin**: bypasses user isolation checks within their organization.

## 💾 Data Flow: Video Lifecycle

1. **Upload**: User sends multipart/form-data. Multer saves raw file to `uploads/`.
2. **Persistence**: Video metadata is saved to MongoDB with status `pending`.
3. **Trigger**: Processing pipeline starts. Status becomes `processing`.
4. **Processing (FFmpeg)**:
   - File is optimized.
   - Progress events are piped through **Socket.io** to the specific user.
5. **Sensitivity Analysis**: Post-processing, content is scanned (mocked) and tagged as `safe` or `flagged`.
6. **Streaming**: Frontend uses standard `<video>` tag pointing to the Stream endpoint, which serves the file via `fs.createReadStream` with Range header support.

## 🚀 Scalability Considerations
- **Stateless Auth**: JWT allows horizontal scaling of the API.
- **Async Processing**: Video processing happens out-of-band, meaning the API remains responsive during heavy transcoding tasks.
- **Streaming**: Range requests prevent loading entire files into memory, keeping the server lean even with multiple concurrent viewers.
