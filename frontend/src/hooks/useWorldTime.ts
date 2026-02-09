import { useState, useEffect } from 'react';

export const useWorldTime = () => {
    const [time, setTime] = useState(new Date());
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        const fetchTime = async () => {
            try {
                // Determine if we need to fetch. 
                // To avoid rate-limiting, we only fetch once on mount.
                // In a real production app, we might NTP sync.
                const res = await fetch('http://worldtimeapi.org/api/timezone/Asia/Kolkata');
                if (res.ok) {
                    // const data = await res.json();
                    // Calculate offset if needed, but for now just setting time
                    // const now = new Date();
                    // const offset = serverTime.getTime() - now.getTime();

                    // We'll trust the local clock + offset
                    // But for simplicity in this demo, just confirming we got internet time
                    setIsSynced(true);
                }
            } catch (err) {
                console.warn("Could not fetch world time, falling back to system time.", err);
            }
        };

        fetchTime();

        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format for display: "Thursday, 22 January 2026"
    const formattedDate = time.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return { date: formattedDate, time: formattedTime, isSynced };
};
