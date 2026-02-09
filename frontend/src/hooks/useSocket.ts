import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socketRef.current.on('connect', () => {
            console.log('🔌 Socket connected:', socketRef.current?.id);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
        });

        // Cleanup
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const emit = (event: string, data: any) => {
        socketRef.current?.emit(event, data);
    };

    const on = (event: string, callback: (data: any) => void) => {
        socketRef.current?.on(event, callback);
    };

    const off = (event: string, callback?: (data: any) => void) => {
        if (callback) {
            socketRef.current?.off(event, callback);
        } else {
            socketRef.current?.off(event);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off
    };
};
