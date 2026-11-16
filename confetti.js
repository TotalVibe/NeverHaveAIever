// Lightweight particle confetti engine for reactions and milestone celebrations
export class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 35, colors = ['#ff2d75', '#ff922b', '#20c997', '#748ffc', '#ffd43b'], shape = 'rect') {
    if (!this.ctx) return;
    const originX = x ?? window.innerWidth / 2;
    const originY = y ?? window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const isLargeDroplet = shape === 'droplet' && Math.random() < 0.06;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: shape === 'droplet'
          ? isLargeDroplet ? Math.random() * 5 + 9 : Math.random() * 3 + 4
          : Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1,
        decay: shape === 'droplet' ? Math.random() * 0.012 + 0.01 : Math.random() * 0.02 + 0.015,
        shape
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  loop() {
    if (this.particles.length === 0) {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.animationId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      if (p.shape === 'droplet') {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size * 0.55, -p.size * 0.45, p.size * 0.9, p.size * 0.2, 0, p.size);
        this.ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.2, -p.size * 0.55, -p.size * 0.45, 0, -p.size);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      this.ctx.restore();
    }

    this.animationId = requestAnimationFrame(() => this.loop());
  }
}
