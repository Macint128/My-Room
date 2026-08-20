import React, { useEffect, useRef } from 'react';
import { RoomLightingState, TimeOfDay, WeatherType } from '../types.ts';

interface AmbientBackdropProps {
  lighting: RoomLightingState;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
}

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({
  lighting,
  timeOfDay,
  weather,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine base sky background depending on time of day
  const getTimeBg = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'from-slate-950 via-amber-950/20 to-slate-900';
      case 'afternoon':
        return 'from-slate-950 via-sky-950/30 to-slate-900';
      case 'sunset':
        return 'from-slate-950 via-orange-950/30 to-slate-900';
      case 'night':
      default:
        return 'from-slate-950 via-slate-900 to-black';
    }
  };

  // Weather particle canvas animation (Rain, Snow, Sakura petals, Fireflies, Starlight)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate particles according to weather
    const particleCount = weather === 'rain' ? 80 : weather === 'sakura' ? 45 : weather === 'fireflies' ? 35 : 50;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      angle?: number;
      angleSpeed?: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: weather === 'rain' ? Math.random() * 2 + 1 : weather === 'sakura' ? Math.random() * 6 + 4 : Math.random() * 3 + 1,
        speedY: weather === 'rain' ? Math.random() * 7 + 8 : weather === 'sakura' ? Math.random() * 1.2 + 0.8 : Math.random() * 0.4 - 0.2,
        speedX: weather === 'rain' ? Math.random() * 1 - 0.5 : weather === 'sakura' ? Math.random() * 1.5 + 0.5 : Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        angle: Math.random() * 360,
        angleSpeed: (Math.random() - 0.5) * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (weather === 'rain') {
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 2);
          ctx.stroke();
        } else if (weather === 'sakura') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(((p.angle || 0) * Math.PI) / 180);
          ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.angle !== undefined && p.angleSpeed !== undefined) {
            p.angle += p.angleSpeed;
          }
        } else if (weather === 'fireflies') {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glow.addColorStop(0, `rgba(253, 224, 71, ${p.opacity})`);
          glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === 'snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Clear night starlight
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Update movement
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weather]);

  return (
    <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 bg-gradient-to-b ${getTimeBg()} -z-10 overflow-hidden`}>
      {/* Primary Ambient Glow Orbs */}
      <div
        className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] opacity-40 transition-all duration-1000 ${
          lighting.candleFlicker ? 'animate-candle' : lighting.breatheEffect ? 'animate-breathe-glow' : ''
        }`}
        style={{
          backgroundColor: lighting.glowColor,
          opacity: (lighting.brightness / 100) * 0.45,
        }}
      />

      <div
        className={`absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-35 transition-all duration-1000 ${
          lighting.candleFlicker ? 'animate-candle' : ''
        }`}
        style={{
          backgroundColor: lighting.color,
          opacity: (lighting.brightness / 100) * 0.35,
        }}
      />

      <div
        className="absolute -bottom-40 left-1/4 w-[750px] h-[550px] rounded-full blur-[180px] opacity-30 transition-all duration-1000"
        style={{
          backgroundColor: lighting.glowColor,
          opacity: (lighting.brightness / 100) * 0.3,
        }}
      />

      {/* Weather Particle Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* Subtle Noise / Grid Texture for Apple frosted texture */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
    </div>
  );
};
