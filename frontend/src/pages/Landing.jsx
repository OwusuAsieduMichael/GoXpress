import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useRef } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      
      // Reinitialize particles on resize
      particles = [];
      for (let i = 0; i < 400; i++) { // Increased from 150 to 400
        particles.push(new Particle());
      }
    };
    
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.radius = Math.random() * 0.8 + 0.5; // Micro particles (0.5 - 1.3px)
        const colors = ['#06b6d4', '#ec4899', '#84cc16', '#fbbf24', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        // Target orbit radius around cursor
        this.orbitRadius = Math.random() * 120 + 80; // Random orbit between 80-200px
        this.orbitAngle = Math.random() * Math.PI * 2; // Random starting angle
        this.orbitSpeed = (Math.random() - 0.5) * 0.02; // Slow orbital rotation
      }

      update() {
        // Very subtle upward drift when no mouse
        if (mouse.x === null || mouse.y === null) {
          this.vy -= 0.01;
          this.vx *= 0.92;
          this.vy *= 0.92;
          this.x += this.vx;
          this.y += this.vy;
        } else {
          // Calculate target position on orbit circle around cursor
          this.orbitAngle += this.orbitSpeed;
          const targetX = mouse.x + Math.cos(this.orbitAngle) * this.orbitRadius;
          const targetY = mouse.y + Math.sin(this.orbitAngle) * this.orbitRadius;
          
          // Move toward target orbital position
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 1) {
            // Smooth chase toward orbital position
            const speed = Math.min(distance * 0.08, 5); // Adaptive speed
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
          } else {
            // Slow down when close to target
            this.vx *= 0.9;
            this.vy *= 0.9;
          }
          
          this.x += this.vx;
          this.y += this.vy;
        }

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    };

    const parent = canvas.parentElement;
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('touchmove', handleTouchMove);
    
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (loading) {
    return <div className="fullscreen-center">Loading...</div>;
  }

  return (
    <div className="landing-screen">
      <canvas ref={canvasRef} className="landing-canvas" />
      <img 
        src="/welcome-image.jpg" 
        alt="Background" 
        className="landing-bg-image"
      />
      <div className="landing-overlay"></div>
      
      <div className="landing-content" style={{ pointerEvents: 'auto' }}>
        <div 
          onClick={() => navigate("/signup")}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "18px 30px",
            borderRadius: "12px",
            marginBottom: "36px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            display: "inline-block",
            pointerEvents: 'auto',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.15)';
            e.currentTarget.style.boxShadow = '0 28px 64px rgba(255, 141, 47, 0.4), 0 12px 32px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(255, 141, 47, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          <img 
            src="/logo-full.svg" 
            alt="GoXpress" 
            style={{ 
              height: "44px", 
              width: "auto",
              display: "block"
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="landing-tagline">
          Streamline Your Business Operations with Confidence
        </h1>
        <div className="landing-buttons">
          <button 
            className="landing-btn landing-btn-signup"
            onClick={() => navigate("/signup")}
            style={{ pointerEvents: 'auto' }}
          >
            Sign up
          </button>
          <button 
            className="landing-btn landing-btn-login"
            onClick={() => navigate("/login")}
            style={{ pointerEvents: 'auto' }}
          >
            Login
          </button>
        </div>
      </div>

      <div className="landing-info-section">
        <div className="landing-name-tag">
          <h2 className="landing-customer-name">Mrs Anita Acheampong</h2>
          <p className="landing-customer-title">Branch Manager, Nexus & Co.</p>
        </div>
        <div className="landing-testimonial">
          <p className="landing-quote">
            "GoXpress has transformed how we manage our business. Fast, reliable, and incredibly easy to use!"
          </p>
          <p className="landing-role">Proud Customer</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
