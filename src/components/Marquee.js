export function initMarquee() {
  const marquees = document.querySelectorAll('[data-marquee]');
  if (!marquees.length) return;

  marquees.forEach(track => {
    const sequence = track.querySelector('.marquee-sequence');
    if (!sequence) return;

    const clone = sequence.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    const speed = parseFloat(track.dataset.speed || 90);
    const duration = (sequence.offsetWidth / speed).toFixed(2);
    
    track.style.setProperty('--marquee-duration', `${duration}s`);
  });
}
