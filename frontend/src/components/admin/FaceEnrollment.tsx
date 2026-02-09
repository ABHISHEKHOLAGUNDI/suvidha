import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { TouchButton } from '../ui/TouchButton';

interface FaceEnrollmentProps {
    onCapture: (descriptor: number[]) => void;
    onCancel: () => void;
}

export const FaceEnrollment: React.FC<FaceEnrollmentProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'captured' | 'failed'>('loading');
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);

    // Stop camera stream helper
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setStatus('ready');
            } catch (err) {
                console.error("Failed to load models", err);
                setStatus('failed');
            }
        };
        loadModels();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            streamRef.current = stream; // Store reference
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStatus('scanning');
        } catch (err) {
            console.error(err);
            setStatus('failed');
        }
    };

    const handleScan = async () => {
        if (!videoRef.current) return;

        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detections) {
            setDescriptor(detections.descriptor);
            setStatus('captured');

            // Draw result
            if (canvasRef.current) {
                const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resized = faceapi.resizeResults(detections, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, displaySize.width, displaySize.height);
                    faceapi.draw.drawDetections(canvasRef.current, resized);
                }
            }
        } else {
            alert("No face detected. Please ensure good lighting and face the camera.");
        }
    };

    const confirmCapture = () => {
        if (descriptor) {
            stopCamera(); // Stop camera before calling callback
            onCapture(Array.from(descriptor));
        }
    };

    const handleCancel = () => {
        stopCamera(); // Stop camera before closing
        onCancel();
    };

    const retry = () => {
        setDescriptor(null);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setStatus('scanning');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Camera className="text-emerald-400" /> Face Enrollment
                    </h3>
                    <button onClick={handleCancel} className="text-slate-400 hover:text-white"><XCircle /></button>
                </div>

                <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-6 flex items-center justify-center border-2 border-slate-700">
                    {status === 'loading' && (
                        <div className="text-sky-400 flex flex-col items-center">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            Loading Models...
                        </div>
                    )}

                    {(status === 'ready' || status === 'scanning' || status === 'captured') && (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full h-full object-cover"
                                onPlay={() => { }}
                            />
                            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
                        </>
                    )}

                    {status === 'ready' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <TouchButton onClick={startCamera} variant="primary">Start Camera</TouchButton>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-end">
                    {status === 'scanning' && (
                        <TouchButton onClick={handleScan} variant="primary" className="w-full">
                            Capture Face
                        </TouchButton>
                    )}

                    {status === 'captured' && (
                        <>
                            <TouchButton onClick={retry} variant="outline">
                                <RefreshCw className="mr-2" /> Retake
                            </TouchButton>
                            <TouchButton onClick={confirmCapture} variant="primary" className="bg-emerald-600 hover:bg-emerald-500">
                                <CheckCircle className="mr-2" /> Save & Enroll
                            </TouchButton>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
