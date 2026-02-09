import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface FaceIdLoginProps {
    onSuccess: () => void;
}

export const FaceIdLogin: React.FC<FaceIdLoginProps> = ({ onSuccess }) => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'success' | 'failed'>('loading');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Track intervals for cleanup
    const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const verifyIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                // Use CDN for models to ensure they load without local files
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
                ]);
                setStatus('ready');
            } catch (err) {
                console.error("Failed to load face-api models", err);
                setErrorMsg(t('loadFailed'));
                setStatus('failed');
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        setStatus('scanning');
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Camera Error:", err);
                setErrorMsg(t('cameraDenied'));
                setStatus('failed');
                stopStream(); // Stop camera on permission denied
            });
    };

    const stopStream = () => {
        // Clear intervals
        if (drawIntervalRef.current) {
            clearInterval(drawIntervalRef.current);
            drawIntervalRef.current = null;
        }
        if (verifyIntervalRef.current) {
            clearInterval(verifyIntervalRef.current);
            verifyIntervalRef.current = null;
        }

        // Stop video stream
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => stopStream();
    }, []);

    // ... (rest of useEffect for models)


    const handleVideoPlay = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        // Store interval in ref for cleanup
        drawIntervalRef.current = setInterval(async () => {
            if (status === 'success' || !videoRef.current) {
                if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
                return;
            }

            try {
                // Detect Single Face (More lenient threshold)
                const detection = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                ).withFaceLandmarks().withFaceDescriptor();

                if (detection) {
                    const resized = faceapi.resizeResults(detection, displaySize);
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            // Custom tech overlay instead of default box
                            const box = resized.detection.box;

                            // Corners
                            ctx.strokeStyle = '#0ea5e9'; // Sky-500
                            ctx.lineWidth = 4;
                            const lineLen = 20;

                            // Top-Left
                            ctx.beginPath(); ctx.moveTo(box.x, box.y + lineLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + lineLen, box.y); ctx.stroke();
                            // Top-Right
                            ctx.beginPath(); ctx.moveTo(box.x + box.width - lineLen, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + lineLen); ctx.stroke();
                            // Bottom-Left
                            ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - lineLen); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + lineLen, box.y + box.height); ctx.stroke();
                            // Bottom-Right
                            ctx.beginPath(); ctx.moveTo(box.x + box.width - lineLen, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - lineLen); ctx.stroke();

                            // faceapi.draw.drawDetections(canvas, resized); // Disable default rect
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }, 100);

        // Parallel Verification Loop (every 1.5s) - store in ref
        verifyIntervalRef.current = setInterval(async () => {
            if (status === 'success' || !videoRef.current) {
                if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
                return;
            }

            if (videoRef.current.paused || videoRef.current.ended) return;

            try {
                const detection = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                ).withFaceLandmarks().withFaceDescriptor();

                if (detection) {
                    const descriptor = Array.from(detection.descriptor);
                    const res = await api.loginBio('face', { faceDescriptor: descriptor });

                    if (res.success && res.user) {
                        // Clear both intervals
                        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
                        if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
                        setStatus('success');
                        stopStream(); // Stop Camera Immediately!
                        setTimeout(onSuccess, 1500);
                    }
                } else {
                    // No face detected after 10 attempts, stop camera
                }
            } catch (e: any) {
                // Face not recognized - keep scanning (user can navigate away)
            }

        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden bg-black/50 rounded-xl border border-orange-500/20 shadow-inner">
            {/* Scan Line Animation Style */}
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scan-bar {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: #f59e0b; /* Amber-500 */
                    box-shadow: 0 0 15px #f59e0b, 0 0 30px #f59e0b;
                    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    z-index: 50;
                }
                /* Circular Radar Sweep */
                 @keyframes radar {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                    <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
                    <p className="text-orange-200">{t('initNeural')}</p>
                </div>
            )}

            {errorMsg && status === 'failed' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-center p-8">
                    <XCircle className="text-red-500 mb-4 drop-shadow-[0_0_10px_red]" size={48} />
                    <p className="text-red-200 text-lg font-mono">{errorMsg}</p>
                    <button onClick={() => setStatus('ready')} className="mt-4 text-orange-400 hover:text-white underline">{t('retry')}</button>
                </div>
            )}

            {/* Circular Camera Container */}
            <div className="relative w-[300px] h-[300px] rounded-full border-4 border-orange-500/30 bg-black shadow-[0_0_50px_rgba(255,165,0,0.1)] flex items-center justify-center overflow-hidden">

                {/* Static Ring */}
                <div className="absolute inset-0 rounded-full border border-orange-500/10 scale-90" />
                <div className="absolute inset-0 rounded-full border border-orange-500/10 scale-75" />

                {status !== 'failed' && (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        width={640}
                        height={480}
                        onPlay={handleVideoPlay}
                        // Cover to fill circle, Mirror
                        className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    />
                )}

                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none transform scale-x-[-1] w-full h-full" />

                {/* Scanning Overlay (Inside Circle) */}
                {status === 'scanning' && (
                    <>
                        <div className="scan-bar"></div>
                        {/* Radar Sweep Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/10 to-transparent animate-spin duration-[3000ms] pointer-events-none" style={{ animationDuration: '3s' }} />

                        {/* HUD Elements */}
                        <div className="absolute top-4 bg-red-600/80 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse border border-red-400">{t('rec')}</div>
                        <div className="absolute bottom-4 text-orange-300 font-mono text-xs tracking-widest drop-shadow-md">{t('searching')}</div>
                    </>
                )}

                {/* Start Button (Centered if not scanning) */}
                {status === 'ready' && !errorMsg && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 transition-all hover:bg-black/40 cursor-pointer group" onClick={startVideo}>
                        <div className="w-20 h-20 rounded-full border-2 border-orange-500 bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_orange]">
                            <Camera size={32} className="text-orange-400 group-hover:text-white transition-colors" />
                        </div>
                        <p className="mt-4 text-orange-200 font-bold tracking-wider group-hover:text-white">{t('initiateScan')}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="absolute inset-0 bg-emerald-950/90 z-20 flex flex-col items-center justify-center backdrop-blur-md">
                        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_#10b981] animate-in zoom-in">
                            <CheckCircle className="text-white" size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-1">{t('verified')}</h3>
                        <p className="text-emerald-200 text-sm font-mono">{t('identityConfirmed')}</p>
                    </div>
                )}
            </div>

            {/* Outer Decorative Rings */}
            <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-orange-500/20 animate-spin duration-[10000ms]" style={{ animationDuration: '20s' }} />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-orange-500/10" />

        </div>
    );
};
