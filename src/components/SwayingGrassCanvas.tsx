import React, { useEffect, useRef } from 'react';
import { GardenSeason } from '../types.ts';

interface SwayingGrassCanvasProps {
  season: GardenSeason;
  windSpeed?: number;
  interactive?: boolean;
}

export const SwayingGrassCanvas: React.FC<SwayingGrassCanvasProps> = ({
  season,
  windSpeed = 1.0,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({ x: -1000, y: -1000, radius: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initGrass();
    };
    window.addEventListener('resize', handleResize);

    // Grass Blade Structure
    interface Blade {
      x: number;
      baseHeight: number;
      width: number;
      bendAngle: number;
      targetBend: number;
      speed: number;
      color: string;
      tipColor: string;
      curveCtrl: number;
    }

    const blades: Blade[] = [];
    const bladeCount = Math.floor(width / 6); // dense lush grass

    const getSeasonColors = () => {
      switch (season) {
        case 'spring':
          return {
            base: ['#065f46', '#047857', '#059669', '#10b981'],
            tip: ['#34d399', '#6ee7b7', '#f472b6', '#a7f3d0'],
          };
        case 'summer':
          return {
            base: ['#064e3b', '#065f46', '#047857', '#0f766e'],
            tip: ['#10b981', '#34d399', '#4ade80', '#86efac'],
          };
        case 'autumn':
          return {
            base: ['#78350f', '#92400e', '#b45309', '#d97706'],
            tip: ['#fbbf24', '#f59e0b', '#f97316', '#fb923c'],
          };
        case 'winter':
          return {
            base: ['#1e293b', '#334155', '#475569', '#0f766e'],
            tip: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#38bdf8'],
          };
      }
    };

    const initGrass = () => {
      blades.length = 0;
      const colors = getSeasonColors();
      for (let i = 0; i < bladeCount; i++) {
        const h = Math.random() * 60 + 55; // 55px to 115px height
        const cIdx = Math.floor(Math.random() * colors.base.length);
        const tIdx = Math.floor(Math.random() * colors.tip.length);
        blades.push({
          x: (i / bladeCount) * width + (Math.random() * 8 - 4),
          baseHeight: h,
          width: Math.random() * 3 + 2,
          bendAngle: 0,
          targetBend: 0,
          speed: Math.random() * 0.03 + 0.02,
          color: colors.base[cIdx],
          tipColor: colors.tip[tIdx],
          curveCtrl: Math.random() * 0.4 + 0.8,
        });
      }
    };

    initGrass();

    // Floating seasonal particles above the grass (Cherry blossoms, fireflies, golden leaves, snowflakes)
    const particleCount = 24;
    const floatingParticles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      angle: number;
      rotSpeed: number;
    }> = [];

    for (let p = 0; p < particleCount; p++) {
      floatingParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedX: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.8 - 0.4,
        opacity: Math.random() * 0.7 + 0.3,
        angle: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 3,
      });
    }

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02 * windSpeed;

      // 1. Draw each swaying grass blade
      blades.forEach((blade, index) => {
        // Natural organic wind wave equation
        const naturalWind = Math.sin(time + blade.x * 0.008) * (20 * windSpeed) +
                            Math.sin(time * 2.3 + index) * 6;

        // Interactive mouse displacement (Grass pushed away by cursor)
        let mouseDisplacement = 0;
        if (interactive) {
          const dx = blade.x - mouseRef.current.x;
          const dy = height - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRef.current.radius) {
            const force = (1 - dist / mouseRef.current.radius) * 45;
            mouseDisplacement = dx > 0 ? force : -force;
          }
        }

        blade.targetBend = naturalWind + mouseDisplacement;
        blade.bendAngle += (blade.targetBend - blade.bendAngle) * 0.1;

        const startX = blade.x;
        const startY = height;
        const tipX = startX + blade.bendAngle;
        const tipY = height - blade.baseHeight;
        const cpX = startX + blade.bendAngle * blade.curveCtrl * 0.6;
        const cpY = height - blade.baseHeight * 0.5;

        // Gradient for grass blade depth
        const grad = ctx.createLinearGradient(startX, startY, tipX, tipY);
        grad.addColorStop(0, blade.color);
        grad.addColorStop(1, blade.tipColor);

        ctx.strokeStyle = grad;
        ctx.lineWidth = blade.width;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.stroke();
      });

      // 2. Render Seasonal Floating Petals/Particles
      floatingParticles.forEach((fp) => {
        fp.x += fp.speedX * windSpeed;
        fp.y += fp.speedY;
        fp.angle += fp.rotSpeed;

        if (fp.x > width + 20) fp.x = -20;
        if (fp.y > height + 20) fp.y = -20;
        if (fp.y < -20) fp.y = height + 20;

        ctx.save();
        ctx.translate(fp.x, fp.y);
        ctx.rotate((fp.angle * Math.PI) / 180);

        if (season === 'spring') {
          // Sakura petal
          ctx.fillStyle = `rgba(244, 114, 182, ${fp.opacity})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, fp.size, fp.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'summer') {
          // Firefly gentle glow
          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, fp.size * 2);
          glow.addColorStop(0, `rgba(52, 211, 153, ${fp.opacity})`);
          glow.addColorStop(1, 'rgba(52, 211, 153, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, fp.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'autumn') {
          // Golden Maple leaf shape
          ctx.fillStyle = `rgba(251, 191, 36, ${fp.opacity})`;
          ctx.beginPath();
          ctx.arc(0, 0, fp.size, 0, Math.PI);
          ctx.fill();
        } else {
          // Snow crystal flake
          ctx.fillStyle = `rgba(226, 232, 240, ${fp.opacity})`;
          ctx.beginPath();
          ctx.arc(0, 0, fp.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [season, windSpeed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-auto cursor-pointer"
      title="바람에 살랑이는 정원 잔디 (마우스로 스치면 풀이 부드럽게 흔들립니다)"
    />
  );
};
