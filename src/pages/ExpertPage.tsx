import { lazy, Suspense } from 'react';

const ExpertAdvisors = lazy(() => import('../sections/ExpertAdvisors'));
const Contact = lazy(() => import('../sections/Contact'));

export default function ExpertPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <ExpertAdvisors />
      </Suspense>
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </main>
  );
}