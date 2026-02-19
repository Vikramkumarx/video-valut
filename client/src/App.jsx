import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Player from './pages/Player';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

    return children;
};

import GlobalListeners from './components/GlobalListeners';

function AppContent() {
    const { user } = useAuth();

    return (
        <>
            {user && <Navbar />}
            <GlobalListeners user={user} />
            <div className="container">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/upload" element={
                        <ProtectedRoute roles={['editor', 'admin']}>
                            <Upload />
                        </ProtectedRoute>
                    } />
                    <Route path="/video/:id" element={
                        <ProtectedRoute>
                            <Player />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
