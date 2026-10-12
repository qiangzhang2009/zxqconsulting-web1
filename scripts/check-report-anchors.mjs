#!/usr/bin/env node
// 扫描所有报告 HTML：统计内部锚点 vs 目标 id，检出死链与依赖锚点的报告
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../public/_reports/', import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith('.html')).sort();

let totalAnchorReports = 0;
let totalDead = 0;

console.log('file'.padEnd(42), 'anchors', 'dead', 'smooth', 'status');
console.log('-'.repeat(78));

for (const f of files) {
  const html = readFileSync(join(dir, f), 'utf8');

  // 收集所有 id
  const ids = new Set();
  for (const m of html.matchAll(/\sid=["']([^"']+)["']/g)) ids.add(m[1]);

  // 收集所有内部锚点链接 href="#xxx"
  const anchors = [];
  for (const m of html.matchAll(/href=["']#([^"']+)["']/g)) anchors.push(m[1]);

  const dead = [...new Set(anchors)].filter((a) => !ids.has(a));

  const smooth = /scroll-behavior\s*:\s*smooth/.test(html);
  const hasNav = /class=["'][^"']*nav-list/.test(html);

  if (anchors.length > 0) totalAnchorReports++;
  totalDead += dead.length;

  const status = dead.length === 0 ? 'ok' : `DEAD(${dead.length})`;
  console.log(
    f.slice(0, 42).padEnd(42),
    String(anchors.length).padStart(7),
    String(dead.length).padStart(4),
    String(smooth).padStart(6),
    '  ' + status + (hasNav ? ' [nav]' : ''),
  );

  if (dead.length) {
    console.log('      dead →', [...new Set(dead)].slice(0, 12).join(', '));
  }
}

console.log('-'.repeat(78));
console.log(`reports total: ${files.length}`);
console.log(`reports using internal anchors: ${totalAnchorReports}`);
console.log(`total dead anchors: ${totalDead}`);