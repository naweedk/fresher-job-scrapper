import Loading from './components/Loading';

/**
 * Next.js App Router global loading UI.
 * Shown automatically during page navigation / suspense boundaries.
 */
export default function GlobalLoading() {
  return <Loading fullPage message="Loading Fresher Jobs India…" />;
}
