#!/usr/bin/env node
/**
 * Build-time sanity check for dist/.
 *
 * Catches before-deploy mistakes:
 *   - Tree-shaken-out data (e.g., researchReports.ts not reachable from routes.tsx)
 *   - Missing lazy chunks (route was added but no chunk was generated)
 *   - Missing deploy assets (reports HTML not present)
 *
 * Fails CI if any assertion in .github/deploy-asserts.json is not satisfied.
 *
 * Usage:
 *   node scripts/verify-bundle.mjs
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = at least one check failed
 *   2 = cannot read asserts file
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Tiny glob → returns array of absolute paths matching pattern under cwd=ROOT. */
function globFiles(pattern) {
  // Pattern examples:
  //   "dist/assets/*.js"   — single-star, single dir
  //   "dist/assets/*.css"
  // No recursive ** support needed (we only glob dist/assets).
  const m = pattern.match(/^([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!m) return [];
  const [, d1, d2, file] = m;
  const absDir = resolve(ROOT, d1, d2);
  if (!existsSync(absDir)) return [];
  const starRE = new RegExp('^' + file.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
  return readdirSync(absDir)
    .filter((name) => starRE.test(name))
    .map((name) => resolve(absDir, name));
}

function grepCount(pattern, file) {
  try {
    const content = readFileSync(file, 'utf8');
    let count = 0;
    let idx = 0;
    while ((idx = content.indexOf(pattern, idx)) !== -1) {
      count++;
      idx += pattern.length;
    }
    return count;
  } catch {
    return 0;
  }
}

const results = [];
let failed = 0;
function check(label, ok, detail) {
  results.push({ label, ok, detail });
  if (!ok) failed++;
}

// ---------- Load asserts ----------
const ASSERTS_PATH = resolve(ROOT, '.github/deploy-asserts.json');
let asserts;
try {
  asserts = JSON.parse(readFileSync(ASSERTS_PATH, 'utf8'));
} catch (e) {
  console.error(`❌ Cannot read ${ASSERTS_PATH}: ${e.message}`);
  process.exit(2);
}

console.log(`\n🔍 Bundle verification (from ${ASSERTS_PATH.replace(ROOT + '/', '')})`);
console.log('─'.repeat(60));

// ---------- Check 1: each reportId appears in *some* bundled file ----------
if (Array.isArray(asserts.reportIds) && asserts.reportIds.length > 0) {
  const allJs = globFiles('dist/assets/*.js');
  if (allJs.length === 0) {
    check('dist/assets/*.js exists', false, 'No JS bundles built. Run `npm run build` first.');
  } else {
    for (const id of asserts.reportIds) {
      let totalHits = 0;
      const hitFiles = [];
      for (const file of allJs) {
        const c = grepCount(id, file);
        if (c > 0) {
          totalHits += c;
          hitFiles.push(`${file.split('/').pop()} (${c})`);
        }
      }
      const ok = totalHits > 0;
      check(
        `reportId "${id}" present in bundle`,
        ok,
        ok
          ? `${totalHits} hit(s) across: ${hitFiles.slice(0, 3).join(', ')}${hitFiles.length > 3 ? '…' : ''}`
          : `0 hits in any dist/assets/*.js — likely tree-shaken or route missing in src/routes.tsx!`
      );
    }
  }
}

// ---------- Check 2: requiredChunks glob + mustContainAny ----------
if (Array.isArray(asserts.requiredChunks)) {
  for (const chunk of asserts.requiredChunks) {
    const files = globFiles(chunk.glob);
    if (files.length === 0) {
      check(
        `chunk: ${chunk.name}`,
        false,
        `No files match ${chunk.glob} — likely missing from build output.`
      );
      continue;
    }
    let okOverall = false;
    const details = [];
    for (const file of files) {
      const matched = (chunk.mustContainAny || []).find((pat) => grepCount(pat, file) > 0);
      if (matched) {
        okOverall = true;
        details.push(`✓ ${file.split('/').pop()} matched "${matched}"`);
      } else {
        details.push(`✗ ${file.split('/').pop()} no match for [${(chunk.mustContainAny || []).join(', ')}]`);
      }
    }
    check(
      `chunk: ${chunk.name}`,
      okOverall,
      `${files.length} file(s) — ${details.join('; ')}`
    );
  }
}

// ---------- Check 3: deploy assets must exist ----------
if (asserts.deployTargets && Array.isArray(asserts.deployTargets.mustExist)) {
  for (const asset of asserts.deployTargets.mustExist) {
    const full = resolve(ROOT, asset);
    const ok = existsSync(full);
    let size = 0;
    if (ok) size = statSync(full).size;
    check(
      `asset: ${asset}`,
      ok,
      ok ? `${size} bytes` : 'MISSING — dist/ incomplete, do NOT deploy!'
    );
  }
}

// ---------- Report ----------
console.log('');
for (const r of results) {
  const icon = r.ok ? '✓' : '✗';
  console.log(`${icon} ${r.label}`);
  console.log(`   ${r.detail}`);
}
console.log('─'.repeat(60));

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed}/${total} checks passed`);

if (failed > 0) {
  console.log('\n🚫 Deployment blocked. Fix the failing checks above before pushing.');
  console.log('   See: DEPLOYMENT.md § 3 "踩过的坑" / .cursor/rules/deployment.mdc');
  process.exit(1);
}

console.log('✅ Bundle is deployment-ready.');
