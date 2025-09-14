// Utility to manage body scroll state
let scrollLockCount = 0;
let originalBodyStyle = '';

export const lockBodyScroll = () => {
  scrollLockCount++;
  if (scrollLockCount === 1) {
    // Store original body style only on first lock
    originalBodyStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
};

export const unlockBodyScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    // Restore original body style only when all locks are released
    document.body.style.overflow = originalBodyStyle || 'auto';
  }
};

export const forceUnlockBodyScroll = () => {
  scrollLockCount = 0;
  document.body.style.overflow = 'auto';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.documentElement.style.overflow = 'auto';
  
  // Force a reflow to ensure styles are applied
  void document.body.offsetHeight;
};

// Cleanup function to ensure scroll is restored when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', forceUnlockBodyScroll);
}
