import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="notification-container">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`toast ${n.type}`}
                        >
                            <div className="toast-icon">
                                {n.type === 'success' && <CheckCircle size={20} />}
                                {n.type === 'error' && <AlertCircle size={20} />}
                                {n.type === 'info' && <Info size={20} />}
                            </div>
                            <span className="toast-message">{n.message}</span>
                            <button onClick={() => removeNotification(n.id)} className="toast-close">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .notification-container {
                    position: fixed;
                    top: 100px;
                    right: 40px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .toast {
                    pointer-events: auto;
                    background: var(--glass);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border);
                    padding: 16px 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: white;
                    min-width: 300px;
                    max-width: 450px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                }
                .toast.success { border-left: 4px solid var(--success); }
                .toast.error { border-left: 4px solid var(--error); }
                .toast.info { border-left: 4px solid var(--primary); }
                
                .toast-icon { display: flex; align-items: center; }
                .success .toast-icon { color: var(--success); }
                .error .toast-icon { color: var(--error); }
                .info .toast-icon { color: var(--primary); }
                
                .toast-message { font-size: 0.9rem; font-weight: 500; flex-grow: 1; }
                .toast-close { background: transparent; color: var(--text-muted); padding: 4px; border-radius: 50%; display: flex; }
                .toast-close:hover { color: white; background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
