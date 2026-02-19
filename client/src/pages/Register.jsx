import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, Loader2, ShieldCheck } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        organization: '',
        role: 'viewer'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Registration failed';
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
                    <h1>Join StreamVault</h1>
                    <p>Create your secure account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Mail size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Building size={20} />
                        <input
                            type="text"
                            placeholder="Organization"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <ShieldCheck size={20} />
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="viewer">Viewer (Read-only)</option>
                            <option value="editor">Editor (Upload/Manage)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? <Loader2 className="spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>

            <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .login-card {
           width: 100%;
          max-width: 450px;
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
        }
        .input-group input, .input-group select {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          margin-left: 12px;
          font-size: 1rem;
        }
        .input-group select option {
          background: var(--bg-card);
        }
        .btn-primary {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          margin-top: 16px;
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
      `}</style>
        </div>
    );
}
