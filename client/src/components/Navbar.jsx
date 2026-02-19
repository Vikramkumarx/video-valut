import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Upload, LogOut, Video } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="nav-brand">
          <div className="brand-logo">
            <Video size={24} />
          </div>
          <span>StreamVault</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <LayoutDashboard size={18} />
            <span>Library</span>
          </Link>

          {(user?.role === 'editor' || user?.role === 'admin') && (
            <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>
              <Upload size={18} />
              <span>Upload</span>
            </Link>
          )}
        </div>

        <div className="user-section">
          <div className="user-account glass">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-meta">{user?.role} • {user?.organization}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
                .navbar {
                    margin-top: 20px;
                    padding: 12px 0;
                    position: sticky;
                    top: 20px;
                    z-index: 100;
                    border: 1px solid var(--glass-border);
                }
                .nav-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 800;
                    font-size: 1.4rem;
                    color: white;
                    letter-spacing: -0.02em;
                }
                .brand-logo {
                    background: var(--gradient-primary);
                    padding: 8px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                
                .nav-links {
                    display: flex;
                    gap: 32px;
                }
                .nav-links a {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    padding: 8px 16px;
                    border-radius: 10px;
                }
                .nav-links a:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }
                .nav-links a.active {
                    color: white;
                    background: rgba(129, 140, 248, 0.1);
                }
                
                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .user-account {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 16px 6px 6px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 40px;
                }
                .avatar {
                    width: 32px;
                    height: 32px;
                    background: var(--gradient-primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: white;
                }
                .user-details {
                    display: flex;
                    flex-direction: column;
                }
                .user-name { font-weight: 700; font-size: 0.85rem; color: white; }
                .user-meta { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
                
                .logout-btn {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                    padding: 10px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .logout-btn:hover {
                    background: var(--error);
                    color: white;
                    transform: rotate(90deg);
                }
            `}</style>
    </nav>
  );
}
