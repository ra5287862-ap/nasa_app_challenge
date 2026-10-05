import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  opacity: number;
  fadeSpeed: number;
  size: number;
  color: string;
}

interface SpaceDust {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
}

const STAR_COLORS = [
  "rgba(255, 255, 255, ",
  "rgba(186, 230, 253, ", // stellar blue
  "rgba(199, 210, 254, ", // indigo shimmer
  "rgba(165, 243, 252, ", // cyan glow
  "rgba(254, 240, 138, ", // warm golden star
];

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [warpMode, setWarpMode] = useState(false);
  const warpModeRef = useRef(warpMode);
  warpModeRef.current = warpMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width - 0.5) * 2;
      targetMouseY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    // Initialize stars
    let stars: Star[] = [];
    const STAR_COUNT = Math.min(Math.floor((width * height) / 6000), 280);

    const initStars = () => {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 2.2 + 0.4,
          radius: Math.random() * 1.6 + 0.35,
          baseAlpha: Math.random() * 0.6 + 0.35,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.035 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
    };

    initStars();

    // Cosmic dust particles (glowing slow-floating orbs)
    const dustParticles: SpaceDust[] = [];
    const DUST_COUNT = 24;
    for (let i = 0; i < DUST_COUNT; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1.2,
        color: i % 2 === 0 ? "rgba(56, 189, 248, " : "rgba(168, 85, 247, ",
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.28 + 0.08,
      });
    }

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 1500;

    const spawnShootingStar = () => {
      const angle = Math.PI / 4 + (Math.random() * 0.35 - 0.17); // ~45 deg diagonal streak
      const speed = Math.random() * 14 + 11;
      shootingStars.push({
        x: Math.random() * width * 0.85,
        y: Math.random() * (height * 0.45),
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: Math.random() * 120 + 80,
        speed,
        opacity: 1,
        fadeSpeed: Math.random() * 0.016 + 0.01,
        size: Math.random() * 1.8 + 1.2,
        color: Math.random() > 0.4 ? "rgba(125, 211, 252," : "rgba(224, 231, 255,",
      });
    };

    const render = () => {
      // Smooth mouse easing
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isWarp = warpModeRef.current;
      const speedMultiplier = isWarp ? 5.5 : 1;

      // 1. Draw cosmic nebula glows on canvas
      const g1 = ctx.createRadialGradient(
        width * 0.2 + mouseX * 25,
        height * 0.25 + mouseY * 25,
        10,
        width * 0.2 + mouseX * 25,
        height * 0.25 + mouseY * 25,
        width * 0.55
      );
      g1.addColorStop(0, "rgba(56, 189, 248, 0.08)");
      g1.addColorStop(0.5, "rgba(99, 102, 241, 0.04)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(
        width * 0.82 - mouseX * 25,
        height * 0.7 - mouseY * 25,
        10,
        width * 0.82 - mouseX * 25,
        height * 0.7 - mouseY * 25,
        width * 0.52
      );
      g2.addColorStop(0, "rgba(217, 70, 239, 0.06)");
      g2.addColorStop(0.6, "rgba(79, 70, 229, 0.03)");
      g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic dust particles
      for (const dust of dustParticles) {
        dust.x += dust.vx * speedMultiplier;
        dust.y += dust.vy * speedMultiplier;
        if (dust.x < 0) dust.x = width;
        if (dust.x > width) dust.x = 0;
        if (dust.y < 0) dust.y = height;
        if (dust.y > height) dust.y = 0;

        const dustGrad = ctx.createRadialGradient(
          dust.x,
          dust.y,
          0,
          dust.x,
          dust.y,
          dust.radius * 2.5
        );
        dustGrad.addColorStop(0, `${dust.color} ${dust.alpha})`);
        dustGrad.addColorStop(1, `${dust.color} 0)`);
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Stars (twinkling & parallax)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Cosmic drift downwards / outwards
        star.y += 0.12 * star.z * speedMultiplier;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase);
        star.alpha = Math.max(0.12, star.baseAlpha + twinkle * 0.4);

        // Parallax offset
        const px = star.x + mouseX * star.z * 20;
        const py = star.y + mouseY * star.z * 20;

        if (isWarp) {
          // Warp trails
          const streakLength = star.z * 22;
          ctx.beginPath();
          ctx.strokeStyle = `${star.color} ${Math.min(1, star.alpha * 1.2)})`;
          ctx.lineWidth = star.radius * 1.1;
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + streakLength);
          ctx.stroke();
        } else {
          // Sharp glowing star
          ctx.beginPath();
          ctx.arc(px, py, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color} ${star.alpha})`;
          ctx.fill();

          // Outer shimmer glow for brighter stars
          if (star.radius > 1.3) {
            ctx.beginPath();
            ctx.arc(px, py, star.radius * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `${star.color} ${star.alpha * 0.25})`;
            ctx.fill();
          }
        }
      }

      // 4. Shooting Stars
      const now = Date.now();
      if (now > nextShootingStarTime) {
        spawnShootingStar();
        nextShootingStarTime = now + (Math.random() * 4000 + 3000);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.opacity -= ss.fadeSpeed;

        if (ss.opacity <= 0 || ss.x > width + 200 || ss.y > height + 200) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - (ss.dx / ss.speed) * ss.length;
        const tailY = ss.y - (ss.dy / ss.speed) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `${ss.color} 0)`);
        grad.addColorStop(0.7, `${ss.color} ${ss.opacity * 0.6})`);
        grad.addColorStop(1, `${ss.color} ${ss.opacity})`);

        ctx.beginPath();
        ctx.lineWidth = ss.size;
        ctx.strokeStyle = grad;
        ctx.lineCap = "round";
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
        ctx.shadowColor = "rgba(125, 211, 252, 0.9)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Deep Cosmos background gradient */}
        <div className="absolute inset-0 bg-[#04060f] -z-20" />

        {/* Ambient Pulsing Cosmic Nebula Orbs (smooth CSS blur) */}
        <div
          className="absolute -top-32 -left-32 size-[550px] rounded-full bg-cyan-600/12 blur-[130px] animate-pulse -z-10 pointer-events-none"
          style={{ animationDuration: "14s" }}
        />
        <div
          className="absolute top-1/4 -right-36 size-[650px] rounded-full bg-purple-600/12 blur-[140px] animate-pulse -z-10 pointer-events-none"
          style={{ animationDuration: "18s", animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-36 left-1/3 size-[500px] rounded-full bg-indigo-600/10 blur-[130px] animate-pulse -z-10 pointer-events-none"
          style={{ animationDuration: "16s", animationDelay: "6s" }}
        />

        {/* Moving Satellite / Orbital Station */}
        <div className="space-satellite-orbit" />

        {/* Interactive canvas starfield & shooting stars */}
        <canvas ref={canvasRef} className="absolute inset-0 size-full pointer-events-none" />
      </div>

      {/* Floating Space Animation Mode Switcher */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setWarpMode((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-[#080d1a]/80 px-3.5 py-1.5 text-xs font-medium text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.2)] backdrop-blur-md transition-all hover:border-sky-400/60 hover:bg-[#0f172a] hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] active:scale-95"
          title="Click to toggle Hyperdrive / Warp Animation speed"
        >
          <span className="relative flex size-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                warpMode ? "bg-sky-400 animate-ping opacity-85" : "bg-cyan-500"
              }`}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                warpMode ? "bg-sky-300" : "bg-cyan-400"
              }`}
            />
          </span>
          <span className="font-display tracking-wider">
            {warpMode ? "⚡ WARP SPEED: ON" : "✨ SPACE VIEW: ORBIT"}
          </span>
        </button>
      </div>
    </>
  );
}
