import { throttle } from '../utils/throttle.js';

export function initParallax() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduceMotion) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const updateParallax = () => {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    const visual = hero.querySelector('.hero-visual');
    if (visual) {
      const translateX = targetX * 0.02;
      const translateY = targetY * 0.02;
      visual.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    rafId = requestAnimationFrame(updateParallax);
  };

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
    mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
    if (!rafId) updateParallax();
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });
}

export function initEnhancedParallax() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
