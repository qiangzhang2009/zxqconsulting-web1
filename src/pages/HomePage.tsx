import { lazy, Suspense } from 'react';
import Hero from '../sections/Hero';
import ReviewComments from '../sections/ReviewComments';

// 不再预加载 InteractiveAvatar (羊驼) — 该视觉元素属于"工具审美",
// 不符合"出海陪跑型决策伙伴"的品牌定位。

const About = lazy(() => import('../sections/About'));
const Services = lazy(() => import('../sections/Services'));

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Suspense fallback={null}>
        <About />
        <Services />
      </Suspense>
      <ReviewComments />
    </main>
  );
}