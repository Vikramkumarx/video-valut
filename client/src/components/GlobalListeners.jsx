import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotification } from '../context/NotificationContext';

export default function GlobalListeners({ user }) {
    const { addNotification } = useNotification();

    useEffect(() => {
        if (!user) return;

        // Connect to the Render backend directly for WebSockets (Vercel proxy has limitations with WS)
        const socket = io('https://video-valut.onrender.com');

        socket.on('videoStatus', ({ title, status, sensitivity }) => {
            if (status === 'completed') {
                const isFlagged = sensitivity === 'flagged';
                const type = isFlagged ? 'warning' : 'success';
                const prefix = isFlagged ? '🔒 [ALERT] ' : '🔓 [SECURE] ';
                addNotification(`${prefix} Asset "${title}" analysis complete. Classification: ${sensitivity.toUpperCase()}`, type);
            } else if (status === 'processing') {
                // addNotification(`🎥 Processing started for "${title}"`, 'info');
            }
        });

        // Simulating some engagement notifications if needed
        // socket.on('engagement', (data) => ...)

        return () => socket.disconnect();
    }, [user, addNotification]);

    return null;
}
