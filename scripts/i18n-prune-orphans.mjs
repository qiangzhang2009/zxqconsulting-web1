#!/usr/bin/env node
// 清理 ja.json: 删除代码中不存在的孤儿 key(extra)。
// 只删 zh.json 里没有、且代码里也没引用的 key —— 这些永远不会被渲染。
import fs from 'node:fs';

function flat(o, p = '', out = {}) {
  if (Array.isArray(o)) o.forEach((v, i) => flat(v, `${p}[${i}]`, out));
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) flat(o[k], p ? `${p}.${k}` : k, out);
  else out[p] = o;
  return out;
}

const F = 'src/locales/ja.json';
const ja = JSON.parse(fs.readFileSync(F, 'utf8'));
const zhFlat = flat(JSON.parse(fs.readFileSync('src/locales/zh.json', 'utf8')));

const used = new Set();
const walk = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'locales') continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) {
      const src = fs.readFileSync(p, 'utf8');
      for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) used.add(m[1]);
      for (const m of src.matchAll(/\bt\(\s*"([^"]+)"/g)) used.add(m[1]);
    }
  }
};
walk('src');

const jaFlat = flat(ja);
const orphans = Object.keys(jaFlat).filter(k => !(k in zhFlat) && !used.has(k));

const drop = new Set(orphans);
function prune(node, path = '') {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) prune(node[i], `${path}[${i}]`);
    return;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      const p = path ? `${path}.${k}` : k;
      if (node[k] && typeof node[k] === 'object') { prune(node[k], p); continue; }
      if (drop.has(p)) delete node[k];
    }
    for (const k of Object.keys(node)) {
      if (node[k] && typeof node[k] === 'object' && Object.keys(node[k]).length === 0) delete node[k];
    }
  }
}
prune(ja);
fs.writeFileSync(F, JSON.stringify(ja, null, 2) + '\n');

console.log(`删除孤儿 key: ${orphans.length}`);
orphans.forEach(k => console.log('  - ' + k));