import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const navigate = useNavigate();
    const recognitionRef = useRef<any>(null);

    const handleCommand = useCallback((command: string) => {
        console.log("Voice Command:", command);

        if (command.includes('pay') || command.includes('electricity') || command.includes('bill')) {
            navigate('/bills/electricity');
        } else if (command.includes('home') || command.includes('dashboard')) {
            navigate('/dashboard');
        } else if (command.includes('complaint') || command.includes('grievance') || command.includes('help')) {
            navigate('/grievance');
        } else if (command.includes('logout') || command.includes('exit')) {
            navigate('/');
        }
    }, [navigate]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice Assistant not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = false; // Auto-stop after one sentence
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onstart = () => {
                setIsListening(true);
                setTranscript('');
            };

            recognition.onresult = (event: any) => {
                const command = event.results[0][0].transcript.toLowerCase();
                setTranscript(command);
                handleCommand(command);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognition.start();
        } catch (e) {
            console.error("Failed to start voice recognition", e);
            setIsListening(false);
        }
    }, [handleCommand]);

    return { isListening, transcript, startListening, stopListening };
};
