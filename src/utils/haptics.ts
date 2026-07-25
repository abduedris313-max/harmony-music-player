export const triggerHaptic = (pattern: number | number[] = 12) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Browser might restrict vibration without direct gesture or permissions
    }
  }
};
