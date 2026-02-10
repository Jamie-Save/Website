export function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  if (!animatedElements.length) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = parseInt(element.dataset.delay || 0, 10);
        
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
