(() => {
  'use strict';

  // =========================================================
  // Configuration
  // =========================================================

  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ANIMATION_DELAY = 100;
  const CAROUSEL_INTERVAL = 5000;

  // =========================================================
  // Utilities
  // =========================================================

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lerp = (start, end, factor) => start + (end - start) * factor;

  const debounce = (fn, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, limit = 16) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // =========================================================
  // Scroll Animations
  // =========================================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (!animatedElements.length) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = parseInt(element.dataset.delay || 0, 10);
          
          // Stagger animations for lists
          const parent = element.closest('.features-list, .security-grid');
          if (parent) {
            const siblings = Array.from(parent.children);
            const siblingIndex = siblings.indexOf(element);
            const staggerDelay = siblingIndex * 100;
            element.style.setProperty('--stagger-delay', staggerDelay);
          }
          
          setTimeout(() => {
            element.classList.add('animate');
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  // =========================================================
  // Navigation Scroll Effect
  // =========================================================

  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScroll = 0;
    let ticking = false;

    const updateNav = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      } else {
        nav.style.background = 'rgba(255, 255, 255, 0.8)';
        nav.style.boxShadow = 'none';
      }

      lastScroll = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNav();
  }

  // =========================================================
  // Carousel
  // =========================================================

  function initCarousel() {
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const stage = carousel.querySelector('.carousel-stage');
    
    if (!slides.length || !dotsContainer || !stage) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isPaused = false;

    // Create dots
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides[currentIndex].classList.remove('active');
      dots[currentIndex].classList.remove('active');

      currentIndex = index;

      slides[currentIndex].classList.add('active');
      dots[currentIndex].classList.add('active');

      resetAutoplay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function startAutoplay() {
      if (prefersReduceMotion || isPaused) return;
      autoplayTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Click navigation
    stage.addEventListener('click', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const third = rect.width / 3;

      if (x < third) {
        goToSlide(currentIndex - 1);
      } else {
        goToSlide(currentIndex + 1);
      }
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      isPaused = true;
      stopAutoplay();
    });

    carousel.addEventListener('mouseleave', () => {
      isPaused = false;
      startAutoplay();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // Start autoplay
    startAutoplay();

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // =========================================================
  // Marquee
  // =========================================================

  function initMarquee() {
    const marquees = document.querySelectorAll('[data-marquee]');
    if (!marquees.length) return;

    marquees.forEach(track => {
      const sequence = track.querySelector('.marquee-sequence');
      if (!sequence) return;

      // Clone sequence for seamless loop
      const clone = sequence.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);

      const speed = parseFloat(track.dataset.speed || 90);
      const duration = (sequence.offsetWidth / speed).toFixed(2);
      
      track.style.setProperty('--marquee-duration', `${duration}s`);
    });
  }

  // =========================================================
  // Security Badge Animation
  // =========================================================

  function initSecurityBadges() {
    const cards = document.querySelectorAll('.security-card[data-badge]');
    if (!cards.length || prefersReduceMotion) return;

    let currentIndex = 0;

    function activateBadge(index) {
      cards.forEach((card, i) => {
        const badge = card.querySelector('.security-badge');
        if (badge) {
          if (i === index) {
            badge.style.transform = 'translateY(-4px) scale(1.05)';
            badge.style.opacity = '1';
          } else {
            badge.style.transform = 'translateY(0) scale(1)';
            badge.style.opacity = '0.6';
          }
        }
      });
    }

    // Cycle through badges
    setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      activateBadge(currentIndex);
    }, 2500);

    // Initial activation
    activateBadge(0);
  }

  // =========================================================
  // Smooth Scroll
  // =========================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href.startsWith('#')) return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // =========================================================
  // Parallax Effect
  // =========================================================

  function initParallax() {
    if (prefersReduceMotion) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const updateParallax = () => {
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      const visual = hero.querySelector('.hero-visual');
      if (visual) {
        const translateX = targetX * 0.02;
        const translateY = targetY * 0.02;
        visual.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }

      requestAnimationFrame(updateParallax);
    };

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
      mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    updateParallax();
  }

  // =========================================================
  // Button Ripple Effect
  // =========================================================

  function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // =========================================================
  // Magnetic Button Effect
  // =========================================================

  function initMagneticButtons() {
    if (prefersReduceMotion) return;
    
    const buttons = document.querySelectorAll('.btn-magnetic, .btn-primary, .btn-free-trial');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.15;
        const moveY = y * 0.15;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      }, { passive: true });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  }

  // =========================================================
  // Enhanced Parallax Scroll
  // =========================================================

  function initEnhancedParallax() {
    if (prefersReduceMotion) return;

    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementCenter = elementTop + rect.height / 2;
        const viewportCenter = scrollY + windowHeight / 2;
        
        const distance = viewportCenter - elementCenter;
        const speed = parseFloat(element.dataset.parallax || '0.5');
        const translateY = distance * speed;
        
        element.style.transform = `translateY(${translateY}px)`;
      });
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // =========================================================
  // Text Reveal Animation
  // =========================================================

  function initTextReveal() {
    if (prefersReduceMotion) return;

    const textElements = document.querySelectorAll('.hero-title, .section-title');
    
    textElements.forEach(element => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'text-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(element);
    });
  }

  // =========================================================
  // Floating Particles Background
  // =========================================================

  function initFloatingParticles() {
    if (prefersReduceMotion) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    particlesContainer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 20 + 15;
      const delay = Math.random() * 5;
      const x = Math.random() * 100;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(44, 62, 80, 0.15) 0%, transparent 70%);
        border-radius: 50%;
        left: ${x}%;
        bottom: -10px;
        animation: float-up ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;
      
      particlesContainer.appendChild(particle);
    }

    // Add float-up animation
    if (!document.querySelector('#particle-styles')) {
      const style = document.createElement('style');
      style.id = 'particle-styles';
      style.textContent = `
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    hero.appendChild(particlesContainer);
  }

  // =========================================================
  // 3D Tilt Effect on Cards
  // =========================================================

  function init3DTilt() {
    if (prefersReduceMotion) return;

    const cards = document.querySelectorAll('.security-card, .feature-item');
    
    cards.forEach(card => {
      card.classList.add('tilt-3d');
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      }, { passive: true });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // =========================================================
  // Performance Optimizations
  // =========================================================

  function initPerformanceOptimizations() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // =========================================================
  // Initialize Everything
  // =========================================================

  function init() {
    initNavScroll();
    initScrollAnimations();
    initCarousel();
    initMarquee();
    initSecurityBadges();
    initSmoothScroll();
    initParallax();
    initEnhancedParallax();
    initRippleEffect();
    initMagneticButtons();
    initTextReveal();
    initFloatingParticles();
    init3DTilt();
    initPerformanceOptimizations();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on dynamic content (for SPAs)
  if (window.MutationObserver) {
    const observer = new MutationObserver(() => {
      initScrollAnimations();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

})();
