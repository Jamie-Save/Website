export function initSecurityBadges() {
  const cards = document.querySelectorAll('.security-card[data-badge]');
  if (!cards.length) return;

  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduceMotion) return;

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

  setInterval(() => {
    currentIndex = (currentIndex + 1) % cards.length;
    activateBadge(currentIndex);
  }, 2500);

  activateBadge(0);
}

export function init3DTilt() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
