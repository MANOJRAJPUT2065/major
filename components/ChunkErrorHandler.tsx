'use client';

import { useEffect } from 'react';

/**
 * Watches for Webpack chunk load errors that can happen after a hot reload
 * or deployment and refreshes the page so the browser fetches fresh bundles.
 */
const ChunkErrorHandler = () => {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent | ErrorEvent | any) => {
      const error = event?.reason ?? event?.error ?? event;
      const message =
        typeof error === 'string'
          ? error
          : typeof error?.message === 'string'
          ? error.message
          : '';
      const name = typeof error?.name === 'string' ? error.name : '';

      if (
        name === 'ChunkLoadError' ||
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk')
      ) {
        console.warn('ChunkLoadError detected. Forcing full reload to recover.');
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);

    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);

  return null;
};

export default ChunkErrorHandler;

