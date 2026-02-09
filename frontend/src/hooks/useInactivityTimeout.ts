import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 2 Minute Timeout
const TIMEOUT_MS = 2 * 60 * 1000;

export const useInactivityTimeout = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                // Logout Action
                // alert("Session Expired due to inactivity."); // Removed alert for smoother kiosk UX
                navigate('/');
                i18n.changeLanguage('en'); // Reset lang
            }, TIMEOUT_MS);
        };

        // Events to track
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer(); // Init

        return () => {
            clearTimeout(timer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [navigate, i18n]);
};
