import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileVideo, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 100 * 1024 * 1024) {
                setError('File size exceeds 100MB limit');
                return;
            }
            setFile(selectedFile);
            setTitle(selectedFile.name.split('.')[0]);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            await axios.post('/api/videos/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Failed to upload video. Check file type (mp4/mkv/avi).');
            setUploading(false);
        }
    };

    return (
        <div className="upload-container animate-fade">
            <div className="glass upload-card">
                <h1>Upload New Video</h1>
                <p>Prepare your content for sensitivity analysis and streaming</p>

                <form onSubmit={handleUpload}>
                    {!file ? (
                        <motion.div
                            className="dropzone-container"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <label className="dropzone glass glass-hover">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <UploadIcon size={48} className="upload-icon" />
                                </motion.div>
                                <span>Click to select or drag and drop</span>
                                <p>Industrial Formats: MP4, MKV or AVI (Max 100MB)</p>
                                <input type="file" onChange={handleFileChange} accept="video/*" hidden />
                            </label>
                        </motion.div>
                    ) : (
                        <div className="file-info glass glass-hover">
                            <div className="file-details">
                                <FileVideo size={32} className="text-primary" />
                                <div>
                                    <h4>{file.name}</h4>
                                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion</span>
                                </div>
                            </div>
                            <button type="button" className="close-btn" onClick={() => setFile(null)} disabled={uploading}>
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    <div className="input-field">
                        <label>Asset Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Assign a persistent title"
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label>Operational Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide context for sensitivity analysis..."
                            rows="3"
                        />
                    </div>

                    {error && (
                        <div className="error-box animate-fade">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {uploading ? (
                        <div className="upload-progress-container glass">
                            <div className="progress-text">
                                <span>Ingesting Asset...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-primary"
                            disabled={!file}
                        >
                            Start Secure Ingestion
                        </motion.button>
                    )}
                </form>

            </div>

            <style jsx>{`
        .upload-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 100px 0 40px;
        }
        .upload-card {
          padding: 40px;
        }
        .upload-card h1 { margin-bottom: 8px; }
        .upload-card p { color: var(--text-muted); margin-bottom: 32px; }
        
        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          border: 1px dashed rgba(129, 140, 248, 0.3);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
        }
        .dropzone:hover {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .upload-icon { color: var(--primary); margin-bottom: 20px; }
        
        .file-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          margin-bottom: 24px;
          border-radius: 16px;
        }
        .file-details { display: flex; align-items: center; gap: 16px; }
        .file-details h4 { margin: 0; font-size: 1.1rem; font-weight: 700; }
        .file-details span { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
        
        .close-btn {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .close-btn:hover { background: var(--error); color: white; }

        .input-field { margin-bottom: 24px; }
        .input-field label { display: block; margin-bottom: 10px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }
        .input-field input, .input-field textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 14px 18px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        .input-field input:focus, .input-field textarea:focus {
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .btn-primary {
          width: 100%;
          background: var(--gradient-primary);
          padding: 16px;
          border-radius: 14px;
          font-weight: 800;
          color: white;
          margin-top: 10px;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .upload-progress-container { margin-top: 24px; padding: 20px; border-radius: 16px; }
        .progress-text { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; font-weight: 700; color: var(--primary); }
        .progress-bar-bg { height: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 5px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--gradient-primary); }
        
        .error-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid var(--error);
          border-radius: 12px;
          color: var(--error);
          margin-bottom: 24px;
          font-size: 0.9rem;
          font-weight: 600;
        }
      `}</style>

        </div>
    );
}
