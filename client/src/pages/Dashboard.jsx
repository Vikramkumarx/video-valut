import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Play, Shield, ShieldAlert, Clock, Search, BarChart3, Video as VideoIcon, Activity, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { demoVideos } from '../data/demoVideos';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Animation', 'Nature', 'My Uploads'];

  useEffect(() => {
    fetchVideos();
    const socket = io('https://video-valut.onrender.com');

    socket.on('videoStatus', ({ id, status, progress, sensitivity }) => {
      setVideos(prev => prev.map(v => {
        if (v._id === id) {
          return { ...v, status, processingProgress: progress, sensitivity: sensitivity || v.sensitivity };
        }
        return v;
      }));
    });

    return () => socket.disconnect();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('/api/videos');
      setVideos([...demoVideos, ...res.data]);
    } catch (err) {
      console.error(err);
      setVideos(demoVideos);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' ||
      (activeCategory === 'My Uploads' ? !v.isDemo : v.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to purge this asset from the vault? This action is irreversible.')) return;
    try {
      await axios.delete(`/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVideos(prev => prev.filter(v => v._id !== videoId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete asset. Ensure you have sufficient permissions.');
    }
  };

  const stats = useMemo(() => {
    const total = videos.length;
    const safe = videos.filter(v => v.sensitivity === 'safe').length;
    const flagged = videos.filter(v => v.sensitivity === 'flagged').length;
    const processing = videos.filter(v => v.status === 'processing').length;
    return { total, safe, flagged, processing };
  }, [videos]);

  const featuredVideo = demoVideos[0];

  return (
    <div className="dashboard-container">
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-stats-bar glass"
        >
          <div className="stat-item">
            <div className="stat-icon bg-primary-soft"><VideoIcon size={18} /></div>
            <div className="stat-details">
              <span>Total Vault</span>
              <strong>{stats.total}</strong>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon bg-success-soft"><Shield size={18} className="text-safe" /></div>
            <div className="stat-details">
              <span>Verified Safe</span>
              <strong>{stats.safe}</strong>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon bg-error-soft"><ShieldAlert size={18} className="text-flagged" /></div>
            <div className="stat-details">
              <span>Flagged Content</span>
              <strong>{stats.flagged}</strong>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon bg-warning-soft"><Activity size={18} className="animate-pulse-slow" /></div>
            <div className="stat-details">
              <span>Active Processing</span>
              <strong>{stats.processing}</strong>
            </div>
          </div>
        </motion.div>
      )}

      {!loading && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-section glass"
        >
          <div className="hero-content">
            <span className="hero-badge">Featured Video</span>
            <h1>{featuredVideo.title}</h1>
            <p>{featuredVideo.description}</p>
            <div className="hero-actions">
              <Link to={`/video/${featuredVideo._id}`} className="btn-primary">
                <Play size={20} fill="currentColor" /> Play Now
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-gradient" />
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80" alt="Hero Background" />
          </div>
        </motion.section>
      )}

      <div className="controls-bar">
        <div className="categories-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-bar glass">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loader"
          />
        </div>
      ) : (
        <div className="video-grid">
          <AnimatePresence mode='popLayout'>
            {filteredVideos.map((video) => (
              <motion.div
                key={video._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="video-card glass glass-hover"
              >
                <div className="video-thumb" style={{ backgroundImage: video.thumbnail ? `url(/${video.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {video.status === 'completed' ? (
                    <Link to={`/video/${video._id}`} className="play-overlay">
                      <Play size={48} fill="white" />
                    </Link>
                  ) : (
                    <div className="processing-overlay" style={{ background: 'rgba(0,0,0,0.7)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={32} />
                      <span>{video.status === 'processing' ? `${video.processingProgress}%` : video.status}</span>
                    </div>
                  )}
                  <div className={`status-badge ${video.sensitivity}`}>
                    {video.sensitivity === 'safe' && <Shield size={14} />}
                    {video.sensitivity === 'flagged' && <ShieldAlert size={14} />}
                    {video.sensitivity}
                  </div>

                  {(user?.role === 'admin' || (user?.role === 'editor' && video.userId === user?._id)) && (
                    <button
                      className="delete-card-btn glass"
                      onClick={(e) => { e.preventDefault(); handleDeleteVideo(video._id); }}
                      title="Purge Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p>{video.description || 'No description'}</p>
                  <div className="video-meta">
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                </div>

                {video.status === 'processing' && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${video.processingProgress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredVideos.length === 0 && !loading && (
        <div className="empty-state glass">
          <VideoIcon size={48} className="text-muted" />
          <h3>No videos found</h3>
          <p>Try adjusting your category or search.</p>
        </div>
      )}


      <style jsx>{`
        .dashboard-container {
          padding: 80px 0 60px;
        }

        /* Admin Stats Bar */
        .admin-stats-bar {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 24px;
          margin-bottom: 40px;
          border: 1px solid rgba(129, 140, 248, 0.2);
          background: linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          justify-content: center;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .stat-details {
          display: flex;
          flex-direction: column;
        }
        .stat-details span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-details strong {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }
        .stat-divider {
          width: 1px;
          height: 30px;
          background: var(--glass-border);
        }

        .bg-primary-soft { background: rgba(99, 102, 241, 0.1); }
        .bg-success-soft { background: rgba(16, 185, 129, 0.1); }
        .bg-error-soft { background: rgba(239, 68, 68, 0.1); }
        .bg-warning-soft { background: rgba(245, 158, 11, 0.1); }

        /* Hero Section */
        .hero-section {
          height: 400px;
          margin-bottom: 40px;
          overflow: hidden;
          display: flex;
          position: relative;
        }
        .hero-content {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 2;
          max-width: 600px;
        }
        .hero-badge {
          background: var(--gradient-primary);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          width: fit-content;
          margin-bottom: 16px;
        }
        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 16px;
          line-height: 1.1;
          color: white;
        }
        .hero-content p {
          color: var(--text-muted);
          font-size: 1.1rem;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .hero-visual {
          position: absolute;
          top: 0;
          right: 0;
          width: 60%;
          height: 100%;
          z-index: 1;
        }
        .hero-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--bg-card) 0%, transparent 100%);
          z-index: 1;
        }

        /* Controls Bar */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }
        .categories-pills {
          display: flex;
          gap: 12px;
        }
        .pill {
          padding: 8px 20px;
          border-radius: 30px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .pill:hover {
          border-color: var(--primary);
          color: white;
        }
        .pill.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 15px rgba(129, 140, 248, 0.3);
        }

        .search-bar {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 12px;
          width: 300px;
        }
        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          margin-left: 10px;
          width: 100%;
          font-size: 0.875rem;
        }

        /* Video Grid */
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }
        .video-card {
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--glass-border);
        }
        .video-thumb {
          aspect-ratio: 16/9;
          background: #000;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .play-overlay {
          color: white;
          opacity: 0;
          transition: all 0.3s ease;
          background: rgba(0,0,0,0.4);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          backdrop-filter: blur(4px);
        }
        .video-card:hover .play-overlay {
          opacity: 1;
        }
        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
          z-index: 2;
        }
        .status-badge.safe { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
        .status-badge.flagged { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        
        .video-info { padding: 24px; }
        .video-info h3 { margin-bottom: 8px; font-size: 1.25rem; font-weight: 700; }
        .video-info p {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 20px;
          line-height: 1.5;
          height: 2.6em;
          overflow: hidden;
        }
        .video-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }

        .loader-container { display: flex; justify-content: center; padding: 100px; }
        .loader {
          width: 50px;
          height: 50px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
        }

        .empty-state { 
          text-align: center; 
          padding: 100px 20px; 
          color: var(--text-muted); 
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .hero-section { height: auto; flex-direction: column; }
          .hero-visual { position: relative; width: 100%; aspect-ratio: 16/9; }
          .hero-content { padding: 30px; }
          .hero-content h1 { font-size: 2rem; }
          .controls-bar { flex-direction: column; align-items: stretch; }
          .categories-pills { overflow-x: auto; padding-bottom: 10px; }
          .search-bar { width: 100%; }
        }
        .delete-card-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--error);
          opacity: 0;
          transition: all 0.3s ease;
          border: 1px solid rgba(239, 68, 68, 0.2);
          z-index: 10;
        }
        .video-card:hover .delete-card-btn {
          opacity: 1;
        }
        .delete-card-btn:hover {
          background: var(--error) !important;
          color: white;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
