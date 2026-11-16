'use client';

import { useEffect } from 'react';
import ErrorDisplay from './components/ErrorDisplay';

/**
 * Next.js App Router global error boundary.
 * Catches unhandled errors during rendering.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorDisplay
          title="Application error"
          message={
            process.env.NODE_ENV === 'development'
              ? error.message
              : 'An unexpected error occurred. Please refresh the page.'
          }
          onRetry={reset}
        />
      </body>
    </html>
  );
}
