export function initFloatingParticles() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  if (!document.querySelector('#particle-styles')) {
    const style = document.createElement('style');
    style.id = 'particle-styles';
    style.textContent = `
      @keyframes float-up {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
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
