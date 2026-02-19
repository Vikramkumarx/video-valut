import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, Shield, ShieldAlert, Calendar, HardDrive, Play, Clock, ThumbsUp, Share2, Download as DownloadIcon } from 'lucide-react';
import { demoVideos } from '../data/demoVideos';
import { useNotification } from '../context/NotificationContext';

export default function Player() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [allVideos, setAllVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [liked, setLiked] = useState(false);
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        setVideoError(false);
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch all videos for sidebar
            const res = await axios.get('/api/videos');
            const combined = [...demoVideos, ...res.data];
            setAllVideos(combined);

            // Find current video
            const found = combined.find(v => v._id === id);
            if (!found) throw new Error('Not found');
            setVideo(found);
        } catch (err) {
            console.error(err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="loader-container">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="loader" />
        </div>
    );

    const token = localStorage.getItem('token');
    const videoSrc = video.isDemo ? video.url : `/api/videos/stream/${id}?token=${token}`;
    const relatedVideos = allVideos.filter(v => v._id !== id).slice(0, 5);

    const handleLike = () => {
        setLiked(!liked);
        addNotification(liked ? 'Vote removed' : 'You liked this video!', 'info');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addNotification('Link copied to clipboard!', 'success');
    };

    const handleDownload = () => {
        addNotification('Initiating secure file transfer...', 'info');
        const token = localStorage.getItem('token');
        const downloadUrl = `/api/videos/download/${id}?token=${token}`;

        // Use a hidden anchor to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', video.originalName || video.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            addNotification('Asset transfer sequence started.', 'success');
        }, 1500);
    };

    return (
        <div className="player-container animate-fade">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} /> Back to Library
            </button>

            <div className="player-layout">
                <main className="video-section">
                    <div className="video-wrapper glass">
                        {videoError ? (
                            <div className="video-error-state">
                                <ShieldAlert size={48} />
                                <p>Playback failed. This could be due to an unsupported format or network restriction.</p>
                                <div className="error-actions">
                                    <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
                                    <a href={videoSrc} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                        Open Video Directly
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <video
                                key={id}
                                controls
                                autoPlay
                                muted
                                src={videoSrc}
                                className="main-video"
                                onError={() => setVideoError(true)}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>

                    <div className="video-header">
                        <div className="header-top">
                            <div className="title-area">
                                <h1>{video.title}</h1>
                                <div className="engagement-stats">
                                    <span>2.4k views</span> • <span>Joined {new Date(video.createdAt).getFullYear()}</span>
                                </div>
                            </div>
                            <div className="engagement-actions">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleLike}
                                    className={`action-btn ${liked ? 'active' : ''}`}
                                >
                                    <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} />
                                    <span>{liked ? '146' : '145'}</span>
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="action-btn">
                                    <Share2 size={20} />
                                    <span>Share</span>
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownload} className="action-btn">
                                    <DownloadIcon size={20} />
                                    <span>Download</span>
                                </motion.button>
                            </div>
                        </div>

                        <div className="video-meta-row">
                            <div className={`sensitivity-tag ${video.sensitivity === 'safe' ? 'bg-safe text-safe' : 'bg-flagged text-flagged'}`}>
                                {video.sensitivity === 'safe' ? <Shield size={16} /> : <ShieldAlert size={16} />}
                                {video.sensitivity === 'safe' ? 'Verified Safe' : 'Security Flagged'}
                            </div>
                            <div className="video-meta-pills">
                                <span className="meta-pill"><Calendar size={14} /> {new Date(video.createdAt).toLocaleDateString()}</span>
                                <span className="meta-pill"><HardDrive size={14} /> {(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                                <span className="meta-pill"><Clock size={14} /> {video.isDemo ? 'Industrial 4K' : 'Secure Upload'}</span>
                            </div>
                        </div>
                        <div className="glass description-card glass-hover">
                            <h3><Info size={18} /> Asset Description</h3>
                            <p>{video.description || 'No additional metadata provided for this asset.'}</p>
                        </div>
                    </div>
                </main>

                <aside className="related-sidebar">
                    <h3 className="sidebar-title">Vault Recommendations</h3>
                    <div className="related-list">
                        {relatedVideos.map(rv => (
                            <Link key={rv._id} to={`/video/${rv._id}`} className="related-item glass glass-hover">
                                <div className="related-thumb">
                                    <div className="thumb-play"><Play size={20} fill="white" /></div>
                                    {rv.isDemo && <span className="demo-label">Demo</span>}
                                </div>
                                <div className="related-info">
                                    <h4>{rv.title}</h4>
                                    <span>{rv.category || 'Asset'} • {(rv.size / (1024 * 1024)).toFixed(1)}MB</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>

            <style jsx>{`
                .player-container { padding: 100px 0 60px; }
                .loader-container { display: flex; justify-content: center; padding: 100px; }
                .loader { width: 40px; height: 40px; border: 3px solid var(--glass-border); border-top-color: var(--primary); border-radius: 50%; }

                .back-btn {
                    background: transparent;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .back-btn:hover { color: white; transform: translateX(-4px); }
                
                .player-layout {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 40px;
                }
                
                @media (max-width: 1200px) {
                    .player-layout { grid-template-columns: 1fr; }
                }
                
                .video-wrapper {
                    aspect-ratio: 16/9;
                    background: black;
                    overflow: hidden;
                    margin-bottom: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid var(--glass-border);
                }
                .main-video { width: 100%; height: 100%; outline: none; }
                
                .video-header { display: flex; flex-direction: column; gap: 24px; }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
                .title-area h1 { font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 4px; letter-spacing: -0.02em; }
                .engagement-stats { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }
                
                .engagement-actions { display: flex; gap: 12px; }
                .action-btn {
                    background: var(--glass);
                    border: 1px solid var(--glass-border);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .action-btn:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--primary); transform: translateY(-2px); }
                .action-btn.active { background: var(--primary); border-color: var(--primary); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
                
                .video-meta-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border); }
                .sensitivity-tag {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .video-meta-pills { display: flex; gap: 12px; }
                .meta-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 8px 14px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    border: 1px solid var(--glass-border);
                }
                
                .description-card { padding: 30px; border-radius: 20px; }
                .description-card h3 { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 1.1rem; color: var(--primary); font-weight: 800; }
                .description-card p { color: var(--text-muted); line-height: 1.8; font-size: 1rem; }


                /* Sidebar */
                .sidebar-title { font-size: 1.3rem; font-weight: 800; margin-bottom: 24px; color: white; border-left: 4px solid var(--primary); padding-left: 16px; }
                .related-list { display: flex; flex-direction: column; gap: 16px; }
                .related-item {
                    display: flex;
                    gap: 16px;
                    padding: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                }
                .related-item:hover {
                    transform: translateX(8px);
                    border-color: var(--primary);
                    background: rgba(129, 140, 248, 0.05);
                }
                .related-thumb {
                    width: 140px;
                    aspect-ratio: 16/9;
                    background: black;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                .thumb-play {
                    opacity: 0.6;
                    transition: all 0.3s ease;
                }
                .related-item:hover .thumb-play {
                    opacity: 1;
                    transform: scale(1.2);
                }
                .demo-label {
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    background: var(--gradient-primary);
                    font-size: 0.6rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                }
                .related-info h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 6px; color: white; line-height: 1.2; }
                .related-info span { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

                .video-error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    gap: 16px;
                    color: var(--error);
                    text-align: center;
                    padding: 40px;
                }
                .error-actions { display: flex; gap: 12px; margin-top: 10px; }
            `}</style>
        </div>
    );
}
