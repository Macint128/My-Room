import React, { useEffect, useRef } from 'react';

interface SteamCanvasProps {
  tintColor?: string; // Color of the tea steam
  intensity?: number;
}

export const SteamCanvas: React.FC<SteamCanvasProps> = ({
  tintColor = 'rgba(255, 255, 255, 0.45)',
  intensity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = (canvas.width = 120);
    const height = (canvas.height = 140);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      wobbleSpeed: number;
      wobbleOffset: number;
    }

    const particles: Particle[] = [];
    const maxParticles = Math.floor(25 * intensity);

    const createParticle = (): Particle => ({
      x: width / 2 + (Math.random() * 20 - 10),
      y: height - 10,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 0.9 + 0.6,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.3,
      fadeSpeed: Math.random() * 0.005 + 0.003,
      wobbleSpeed: Math.random() * 0.05 + 0.02,
      wobbleOffset: Math.random() * Math.PI * 2,
    });

    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.y = height - Math.random() * height * 0.8;
      particles.push(p);
    }

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.05;

      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(t * p.wobbleSpeed + p.wobbleOffset) * 0.3;
        p.size += 0.08;
        p.opacity -= p.fadeSpeed;

        if (p.y < 0 || p.opacity <= 0) {
          particles[idx] = createParticle();
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, tintColor.replace(/[\d\.]+\)$/, `${p.opacity})`));
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [tintColor, intensity]);

  return <canvas ref={canvasRef} className="w-[120px] h-[140px] pointer-events-none" />;
};
