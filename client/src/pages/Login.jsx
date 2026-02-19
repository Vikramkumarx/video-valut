import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      if (message.includes('Network Error')) {
        setError('Cannot connect to server. Please check your internet or ensure backend is running.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass login-card animate-fade">
        <div className="brand">
          <h1>StreamVault</h1>
          <p>Secure Video Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          text-align: center;
        }
        .brand h1 {
          font-size: 2.5rem;
          background: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .brand p {
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .input-group {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .input-group:focus-within {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
        }
        .input-group input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          margin-left: 12px;
          font-size: 1rem;
        }
        .btn-primary {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          margin-top: 16px;
        }
        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-text {
          color: var(--error);
          font-size: 0.875rem;
          margin-bottom: 16px;
        }
        .auth-footer {
          margin-top: 24px;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
