import { lazy, Suspense } from 'react';

const CountryAssessmentHub = lazy(() => import('../sections/CountryAssessmentHub'));

export default function CountryAssessmentPage() {
  return (
    <main className="bg-[#07111a] text-slate-100">
      <Suspense fallback={<div className="min-h-screen" />}>
        <CountryAssessmentHub />
      </Suspense>
    </main>
  );
}
