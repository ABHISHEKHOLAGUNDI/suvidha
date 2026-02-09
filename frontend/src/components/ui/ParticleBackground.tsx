import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            angle: number;
            radius: number;
            center: { x: number, y: number };

            constructor() {
                this.center = { x: canvas!.width / 2, y: canvas!.height / 2 };
                // Random position
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;

                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.2;
                this.speedY = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;

                // For circular motion - distance from center
                this.radius = Math.sqrt(Math.pow(this.x - this.center.x, 2) + Math.pow(this.y - this.center.y, 2));
                this.angle = Math.atan2(this.y - this.center.y, this.x - this.center.x);
            }

            update() {
                // Circular Orbit Logic (Slow rotation)
                this.angle += 0.001; // Rotation speed

                // Add some noise/drift
                this.radius += Math.sin(this.angle * 5) * 0.5;

                this.x = this.center.x + Math.cos(this.angle) * this.radius;
                this.y = this.center.y + Math.sin(this.angle) * this.radius;

                // Wrap around if too far (not strictly needed for pure rotation but good for drift)
                if (this.x < -100 || this.x > canvas!.width + 100 || this.y < -100 || this.y > canvas!.height + 100) {
                    this.radius = Math.random() * (Math.max(canvas!.width, canvas!.height) / 1.5);
                    this.angle = Math.random() * Math.PI * 2;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = 150; // Density
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};
