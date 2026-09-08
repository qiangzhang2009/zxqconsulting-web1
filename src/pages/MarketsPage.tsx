import { lazy, Suspense } from 'react';

const Markets = lazy(() => import('../sections/Markets'));

export default function MarketsPage() {
  return (
    <main className="bg-[#07111a]">
      <Suspense fallback={<div className="min-h-screen" />}>
        <Markets />
      </Suspense>
    </main>
  );
}
