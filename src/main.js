import { initNavScroll } from './components/Navigation.js';
import { initCarousel } from './components/Carousel.js';
import { initMarquee } from './components/Marquee.js';
import { initSecurityBadges, init3DTilt } from './components/SecurityCards.js';
import { initCustomCursor } from './components/CustomCursor.js';
import { initScrollAnimations } from './animations/scroll.js';
import { initParallax, initEnhancedParallax } from './animations/parallax.js';
import { initFloatingParticles } from './animations/particles.js';
import { initMagneticButtons } from './animations/magnetic.js';

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

function initTextReveal() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

function initPerformanceOptimizations() {
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

function init() {
  // Core components
  initNavScroll();
  initCarousel();
  initMarquee();
  initSecurityBadges();
  initSmoothScroll();
  
  // Animations (lazy load on desktop)
  if (window.innerWidth > 768) {
    initScrollAnimations();
    initParallax();
    initEnhancedParallax();
    initFloatingParticles();
    init3DTilt();
    initMagneticButtons();
    initTextReveal();
    initCustomCursor();
  }
  
  // Always load
  initRippleEffect();
  initPerformanceOptimizations();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-initialize scroll animations on dynamic content
if (window.MutationObserver) {
  const observer = new MutationObserver(() => {
    initScrollAnimations();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
