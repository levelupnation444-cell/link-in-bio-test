"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
};

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.3,
    speedY: -(Math.random() * 0.4 + 0.1),
    speedX: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.4 + 0.1,
    life: 0,
    maxLife: Math.random() * 200 + 100,
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 80 }, () =>
        createParticle(canvas.width, canvas.height),
      );
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life += 1;

        if (particle.life > particle.maxLife || particle.y < 0) {
          Object.assign(particle, createParticle(canvas.width, canvas.height));
          particle.y = canvas.height;
        }

        context.save();
        context.globalAlpha = particle.opacity * (1 - particle.life / particle.maxLife);
        context.fillStyle = "#C9A84C";
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lun-particles" aria-hidden="true" />;
}
