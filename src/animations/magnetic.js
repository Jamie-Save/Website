export function initMagneticButtons() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
