export const lerp = (start, end, factor) => start + (end - start) * factor;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
