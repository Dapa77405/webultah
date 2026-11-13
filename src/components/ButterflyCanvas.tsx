import { useEffect, useRef } from "react";

type Butterfly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  speed: number;
  hue: number;
};

type Sparkle = { x: number; y: number; life: number; size: number };
type Ripple = { x: number; y: number; life: number };

const randomButterfly = (width: number, height: number, x?: number, y?: number): Butterfly => ({
  x: x ?? Math.random() * width,
  y: y ?? Math.random() * height,
  vx: (Math.random() - 0.5) * 0.65,
  vy: (Math.random() - 0.5) * 0.55,
  size: 7 + Math.random() * 9,
  phase: Math.random() * Math.PI * 2,
  speed: 0.035 + Math.random() * 0.045,
  hue: [198, 208, 215, 225][Math.floor(Math.random() * 4)],
});
const MAX_BUTTERFLIES = 150;
const MAX_SPARKLES = 260;

export default function ButterflyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let animationId = 0;
    const pointer = { x: width / 2, y: height / 2, active: false };
    const butterflies = Array.from({ length: 28 }, () => randomButterfly(width, height));
    const sparkles: Sparkle[] = [];
    const ripples: Ripple[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const movePointer = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (Math.random() > 0.58 && sparkles.length < MAX_SPARKLES) {
        sparkles.push({ x: pointer.x, y: pointer.y, life: 1, size: 1 + Math.random() * 2 });
      }
    };

    const addRipple = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, input, textarea, label, .memory-card, .gift-card, .modal-card, .opening-curtain")) return;
      ripples.push({ x: event.clientX, y: event.clientY, life: 1 });
      for (let index = 0; index < 5 && butterflies.length < MAX_BUTTERFLIES; index += 1) {
        butterflies.push(randomButterfly(width, height, event.clientX, event.clientY));
      }
      for (let index = 0; index < 18 && sparkles.length < MAX_SPARKLES; index += 1) {
        sparkles.push({ x: event.clientX, y: event.clientY, life: 1, size: 1 + Math.random() * 3 });
      }
    };

    const summon = () => {
      for (let index = 0; index < 34 && butterflies.length < MAX_BUTTERFLIES; index += 1) {
        const fromLeft = Math.random() > 0.5;
        butterflies.push(randomButterfly(width, height, fromLeft ? -12 : width + 12, Math.random() * height));
      }
      for (let index = 0; index < 50 && sparkles.length < MAX_SPARKLES; index += 1) {
        sparkles.push({ x: Math.random() * width, y: Math.random() * height, life: 1, size: 1 + Math.random() * 2.5 });
      }
    };

    const drawButterfly = (butterfly: Butterfly) => {
      const flap = Math.sin(frame * butterfly.speed + butterfly.phase);
      const wingWidth = butterfly.size * (0.62 + Math.abs(flap) * 0.45);
      context.save();
      context.translate(butterfly.x, butterfly.y);
      context.rotate(Math.atan2(butterfly.vy, butterfly.vx) * 0.22);
      context.shadowBlur = 14;
      context.shadowColor = `hsla(${butterfly.hue}, 95%, 66%, .75)`;
      context.fillStyle = `hsla(${butterfly.hue}, 88%, ${78 + Math.sin(frame * 0.03 + butterfly.phase) * 8}%, .76)`;
      context.beginPath();
      context.ellipse(-wingWidth * 0.54, -butterfly.size * 0.2, wingWidth * 0.57, butterfly.size * 0.38, -0.5, 0, Math.PI * 2);
      context.ellipse(wingWidth * 0.54, -butterfly.size * 0.2, wingWidth * 0.57, butterfly.size * 0.38, 0.5, 0, Math.PI * 2);
      context.ellipse(-wingWidth * 0.35, butterfly.size * 0.22, wingWidth * 0.38, butterfly.size * 0.25, 0.5, 0, Math.PI * 2);
      context.ellipse(wingWidth * 0.35, butterfly.size * 0.22, wingWidth * 0.38, butterfly.size * 0.25, -0.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 3;
      context.fillStyle = "rgba(255,255,255,.9)";
      context.fillRect(-0.7, -butterfly.size * 0.22, 1.4, butterfly.size * 0.58);
      context.restore();
    };

    const animate = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);

      for (let index = butterflies.length - 1; index >= 0; index -= 1) {
        const butterfly = butterflies[index];
        butterfly.phase += 0.006;
        butterfly.vx += Math.sin(frame * 0.008 + butterfly.phase) * 0.008;
        butterfly.vy += Math.cos(frame * 0.006 + butterfly.phase) * 0.007;
        if (pointer.active) {
          const dx = pointer.x - butterfly.x;
          const dy = pointer.y - butterfly.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 220 && distance > 1) {
            butterfly.vx += (dx / distance) * 0.012;
            butterfly.vy += (dy / distance) * 0.012;
          }
        }
        butterfly.vx *= 0.985;
        butterfly.vy *= 0.985;
        butterfly.x += butterfly.vx;
        butterfly.y += butterfly.vy + Math.sin(frame * butterfly.speed + butterfly.phase) * 0.22;
        if (butterfly.x < -32) butterfly.x = width + 20;
        if (butterfly.x > width + 32) butterfly.x = -20;
        if (butterfly.y < -28) butterfly.y = height + 18;
        if (butterfly.y > height + 28) butterfly.y = -18;
        drawButterfly(butterfly);
      }

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        const radius = (1 - ripple.life) * 100;
        context.beginPath();
        context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(56, 189, 248, ${ripple.life * 0.42})`;
        context.lineWidth = 2;
        context.stroke();
        ripple.life -= 0.018;
        if (ripple.life <= 0) ripples.splice(index, 1);
      }

      for (let index = sparkles.length - 1; index >= 0; index -= 1) {
        const sparkle = sparkles[index];
        context.beginPath();
        context.arc(sparkle.x, sparkle.y, sparkle.size * sparkle.life, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${sparkle.life})`;
        context.shadowBlur = 10;
        context.shadowColor = "#38bdf8";
        context.fill();
        context.shadowBlur = 0;
        sparkle.x += (Math.random() - 0.5) * 1.3;
        sparkle.y -= 0.35;
        sparkle.life -= 0.025;
        if (sparkle.life <= 0) sparkles.splice(index, 1);
      }
      animationId = window.requestAnimationFrame(animate);
    };

    resize();
    animationId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("pointerdown", addRipple);
    window.addEventListener("summon-swarm", summon);
    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("pointerdown", addRipple);
      window.removeEventListener("summon-swarm", summon);
    };
  }, []);

  return <canvas ref={canvasRef} className="butterfly-canvas" aria-hidden="true" />;
}
