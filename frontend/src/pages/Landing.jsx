import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useRef, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const canvasRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Benefits data organized in groups of 3
  const benefitSlides = [
    [
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#lightning)" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="lightning" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24"/>
                <stop offset="1" stopColor="#f97316"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Lightning Fast",
        text: "Optimized performance ensures your operations run smoothly without delays"
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="url(#lock)" stroke="#10b981" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#fff"/>
            <defs>
              <linearGradient id="lock" x1="5" y1="11" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399"/>
                <stop offset="1" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Bank-Level Security",
        text: "Your data is encrypted and protected with industry-standard security protocols"
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="4" width="14" height="17" rx="2" fill="url(#phone)" stroke="#3b82f6" strokeWidth="2"/>
            <path d="M9 18h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <rect x="7" y="6" width="10" height="9" rx="1" fill="#1e40af" opacity="0.3"/>
            <defs>
              <linearGradient id="phone" x1="5" y1="4" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa"/>
                <stop offset="1" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Mobile Ready",
        text: "Access your business from anywhere, on any device, at any time"
      }
    ],
    [
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" fill="url(#coin)" stroke="#f59e0b" strokeWidth="2"/>
            <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">$</text>
            <defs>
              <linearGradient id="coin" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24"/>
                <stop offset="1" stopColor="#f59e0b"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Cost Effective",
        text: "Affordable pricing with no hidden fees. Pay only for what you use"
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" fill="url(#target)" stroke="#8b5cf6" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="1.5" fill="#fff"/>
            <defs>
              <linearGradient id="target" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Easy to Use",
        text: "Intuitive interface designed for users of all technical skill levels"
      },
      {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#rocket1)" stroke="#ec4899" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="rocket1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f472b6"/>
                <stop offset="1" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
        ),
        title: "Quick Setup",
        text: "Get started in minutes with our streamlined onboarding process"
      }
    ]
  ];

  // Auto-rotate slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefitSlides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [benefitSlides.length]);

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
      <div className="landing-overlay"></div>
      
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <img 
            src="/logo-full.svg" 
            alt="GoXpress" 
            className="landing-logo"
            onClick={() => navigate("/")}
          />
          <div className="landing-nav-buttons">
            <button 
              className="landing-nav-btn landing-nav-login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button 
              className="landing-nav-btn landing-nav-signup"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <span className="landing-badge-icon">✨</span>
            <span>Trusted by 500+ businesses</span>
          </div>
          <h1 className="landing-hero-title">
            Modern Business Management
            <span className="landing-hero-highlight"> Made Simple</span>
          </h1>
          <p className="landing-hero-subtitle">
            Streamline your operations with our all-in-one platform. Manage inventory, 
            track sales, and grow your business with confidence.
          </p>
          <div className="landing-hero-buttons">
            <button 
              className="landing-btn landing-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
              <span className="landing-btn-arrow">→</span>
            </button>
            <button 
              className="landing-btn landing-btn-secondary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
          
          {/* Stats */}
          <div className="landing-stats">
            <div className="landing-stat">
              <div className="landing-stat-value">99.9%</div>
              <div className="landing-stat-label">Uptime</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">500+</div>
              <div className="landing-stat-label">Active Users</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">24/7</div>
              <div className="landing-stat-label">Support</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="landing-features">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">📊</div>
            <h3 className="landing-feature-title">Real-time Analytics</h3>
            <p className="landing-feature-desc">
              Track your business performance with live dashboards and insights
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">💳</div>
            <h3 className="landing-feature-title">Secure Payments</h3>
            <p className="landing-feature-desc">
              Accept payments with Paystack integration and mobile money support
            </p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon">📦</div>
            <h3 className="landing-feature-title">Inventory Control</h3>
            <p className="landing-feature-desc">
              Manage stock levels, track products, and automate reordering
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="landing-testimonial-section">
        <div className="landing-testimonial-card">
          <div className="landing-testimonial-quote">"</div>
          <p className="landing-testimonial-text">
            GoXpress has transformed how we manage our business. The platform is 
            fast, reliable, and incredibly easy to use. Our team productivity increased by 40%.
          </p>
          <div className="landing-testimonial-author">
            <div className="landing-testimonial-avatar">A</div>
            <div>
              <div className="landing-testimonial-name">Anita Acheampong</div>
              <div className="landing-testimonial-role">Branch Manager, Nexus & Co.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="landing-why-section">
        <h2 className="landing-section-title">Why Choose GoXpress?</h2>
        <p className="landing-section-subtitle">
          Everything you need to run your business efficiently
        </p>
        
        {/* Carousel Container */}
        <div className="landing-carousel-container">
          <div 
            className="landing-benefits-slider"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {benefitSlides.map((slide, slideIndex) => (
              <div key={slideIndex} className="landing-benefits-slide">
                <div className="landing-benefits-grid">
                  {slide.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="landing-benefit">
                      <div className="landing-benefit-icon-wrapper">
                        {benefit.icon}
                      </div>
                      <h3 className="landing-benefit-title">{benefit.title}</h3>
                      <p className="landing-benefit-text">{benefit.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Indicators */}
          <div className="landing-carousel-indicators">
            {benefitSlides.map((_, index) => (
              <button
                key={index}
                className={`landing-carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="landing-cta-section">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to Transform Your Business?</h2>
          <p className="landing-cta-subtitle">
            Join hundreds of businesses already using GoXpress to streamline their operations
          </p>
          <div className="landing-cta-buttons">
            <button 
              className="landing-btn landing-btn-primary"
              onClick={() => navigate("/signup")}
            >
              Start Free Trial
              <span className="landing-btn-arrow">→</span>
            </button>
            <button 
              className="landing-btn landing-btn-secondary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
          <p className="landing-cta-note">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-main">
            <div className="landing-footer-brand">
              <img 
                src="/logo-full.svg" 
                alt="GoXpress" 
                className="landing-footer-logo"
              />
              <p className="landing-footer-tagline">
                Modern business management made simple
              </p>
            </div>
            
            <div className="landing-footer-links">
              <div className="landing-footer-column">
                <h4 className="landing-footer-heading">Product</h4>
                <a href="#features" className="landing-footer-link">Features</a>
                <a href="#pricing" className="landing-footer-link">Pricing</a>
                <a href="#security" className="landing-footer-link">Security</a>
                <a href="#updates" className="landing-footer-link">Updates</a>
              </div>
              
              <div className="landing-footer-column">
                <h4 className="landing-footer-heading">Company</h4>
                <a href="#about" className="landing-footer-link">About Us</a>
                <a href="#careers" className="landing-footer-link">Careers</a>
                <a href="#blog" className="landing-footer-link">Blog</a>
                <a href="#contact" className="landing-footer-link">Contact</a>
              </div>
              
              <div className="landing-footer-column">
                <h4 className="landing-footer-heading">Resources</h4>
                <a href="#docs" className="landing-footer-link">Documentation</a>
                <a href="#guides" className="landing-footer-link">Guides</a>
                <a href="#support" className="landing-footer-link">Support</a>
                <a href="#api" className="landing-footer-link">API</a>
              </div>
              
              <div className="landing-footer-column">
                <h4 className="landing-footer-heading">Legal</h4>
                <a href="#privacy" className="landing-footer-link">Privacy Policy</a>
                <a href="#terms" className="landing-footer-link">Terms of Service</a>
                <a href="#cookies" className="landing-footer-link">Cookie Policy</a>
                <a href="#compliance" className="landing-footer-link">Compliance</a>
              </div>
            </div>
          </div>
          
          <div className="landing-footer-bottom">
            <p className="landing-footer-copyright">
              © {new Date().getFullYear()} GoXpress. All rights reserved.
            </p>
            <div className="landing-footer-social">
              <a href="#twitter" className="landing-social-link" aria-label="Twitter">𝕏</a>
              <a href="#linkedin" className="landing-social-link" aria-label="LinkedIn">in</a>
              <a href="#facebook" className="landing-social-link" aria-label="Facebook">f</a>
              <a href="#instagram" className="landing-social-link" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
