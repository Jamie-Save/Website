import { lerp } from '../utils/lerp.js';

export function initCustomCursor() {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduceMotion || window.innerWidth < 768) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
  
  const cursorDot = cursor.querySelector('.cursor-dot');
  const cursorRing = cursor.querySelector('.cursor-ring');
  
  document.body.appendChild(cursor);
  document.body.style.cursor = 'none';

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let rafId = null;

  const updateCursor = () => {
    if (!cursor.classList.contains('visible')) {
      rafId = null;
      return;
    }
    
    cursorX = lerp(cursorX, mouseX, 0.15);
    cursorY = lerp(cursorY, mouseY, 0.15);
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    rafId = requestAnimationFrame(updateCursor);
  };

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursor.classList.contains('visible')) {
      cursor.classList.add('visible');
    }
    
    if (!rafId) updateCursor();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  const clickableSelectors = 'a, button, .btn, [role="button"], input[type="submit"], input[type="button"], .carousel, .carousel-dot, [data-carousel]';
  const clickableElements = document.querySelectorAll(clickableSelectors);

  clickableElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorDot.classList.add('expand');
      cursorRing.classList.add('expand');
    }, { passive: true });

    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorDot.classList.remove('expand');
      cursorRing.classList.remove('expand');
    }, { passive: true });

    element.addEventListener('mousedown', () => {
      cursor.classList.add('click');
    }, { passive: true });

    element.addEventListener('mouseup', () => {
      cursor.classList.remove('click');
    }, { passive: true });
  });

  const observer = new MutationObserver(() => {
    const newClickables = document.querySelectorAll(clickableSelectors);
    newClickables.forEach(element => {
      if (!element.dataset.cursorAttached) {
        element.dataset.cursorAttached = 'true';
        
        element.addEventListener('mouseenter', () => {
          cursor.classList.add('hover');
          cursorDot.classList.add('expand');
          cursorRing.classList.add('expand');
        }, { passive: true });

        element.addEventListener('mouseleave', () => {
          cursor.classList.remove('hover');
          cursorDot.classList.remove('expand');
          cursorRing.classList.remove('expand');
        }, { passive: true });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
