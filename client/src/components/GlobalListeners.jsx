import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNotification } from '../context/NotificationContext';

export default function GlobalListeners({ user }) {
    const { addNotification } = useNotification();

    useEffect(() => {
        if (!user) return;

        const socket = io();

        socket.on('videoStatus', ({ title, status, sensitivity }) => {
            if (status === 'completed') {
                const type = sensitivity === 'flagged' ? 'success' : 'success';
                const prefix = sensitivity === 'flagged' ? '⚠️ ' : '✅ ';
                addNotification(`${prefix} Video "${title}" is ready. Status: ${sensitivity}`, 'success');
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
