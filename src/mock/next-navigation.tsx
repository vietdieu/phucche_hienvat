import React from 'react';

// Simple mock for Next.js navigation in SPA
export function useRouter() {
  return {
    back: () => {
      // custom back or window back
      if (typeof window !== 'undefined') {
        const customBackEvent = new CustomEvent('spa-back-navigation');
        window.dispatchEvent(customBackEvent);
      }
    },
    push: (href: string) => {
      if (typeof window !== 'undefined') {
        const customPushEvent = new CustomEvent('spa-push-navigation', { detail: { href } });
        window.dispatchEvent(customPushEvent);
      }
    },
    replace: (href: string) => {
      if (typeof window !== 'undefined') {
        const customPushEvent = new CustomEvent('spa-push-navigation', { detail: { href } });
        window.dispatchEvent(customPushEvent);
      }
    },
    prefetch: () => {},
  };
}

export function useParams() {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const lastPart = parts[parts.length - 1] || '';
    return { id: lastPart };
  }
  return { id: '' };
}

export function usePathname() {
  return typeof window !== 'undefined' ? window.location.pathname : '';
}
