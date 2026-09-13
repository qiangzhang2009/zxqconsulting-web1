import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import {
  NETWORK_NODES,
  NETWORK_EDGES,
  type NetworkNode,
  type NodeCategory,
  type EdgeType,
} from './industryNetworkData';

/**
 * IndustryNetworkGraph · 产业关系图(生产版)
 *
 * matter.js 物理引擎驱动的拓扑图,替代手摆坐标 SVG。
 * 数据基于两份真实尽调报告(insitro 顶级研究尽调 / 易赛腾 ECYTON 顶级研究尽调,2026 Q3)。
 *
 * 视觉特性:
 * - 双 focal 节点(insitro / ECYTON)做恒星呼吸效果
 * - 5 类节点关系 + 5 色编码:capital(资本)/customer(客户)/supplier(供应)/partner(合作)/competitor(竞对)
 * - 浅色主题:cream 背景 + 深绿文本,适配 Hero 容器(#FAF8F3)
 * - 3 列布局:INSITRO · 海外旗舰 / 共享 MNC / ECYTON · 中国新势力
 * - Hover tooltip 显示节点详情(类别徽章 + meta)
 *
 * 性能与可访问性:
 * - DPR-aware 渲染
 * - 收敛检测(KE < 阈值时跳过物理更新,仅绘制)
 * - prefers-reduced-motion 适配(静态布局)
 * - 完整 ARIA 标签 + 屏幕阅读器友好描述
 */

const W = 1100;
const H = 540;
const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

const COLOR: Record<NodeCategory, string> = {
  focal: '#f59e0b',       // amber
  capital: '#10b981',     // emerald
  customer: '#d97706',    // amber-deep
  supplier: '#06b6d4',    // cyan
  partner: '#7c3aed',     // violet
  competitor: '#ef4444',  // red
};

const TEXT = '#1B2520';
const TEXT_MUTED = '#5b6661';
const GRID = 'rgba(47,93,87,0.08)';
const BG_TINT = 'rgba(250,248,243,0.4)';
const LABEL_BG = 'rgba(255,255,255,0.95)';

const LABEL: Record<NodeCategory, string> = {
  focal: '焦点',
  capital: '资本',
  customer: '客户',
  supplier: '供应',
  partner: '合作',
  competitor: '竞对',
};

/**
 * 改良的初始位置 —— 三列分区 + 避免重叠
 * INSITRO zone: x 30–360 | 共享 MNC: x 380–720 | ECYTON zone: x 730–1080
 */
const POS: Record<string, { x: number; y: number }> = {
  // ====== INSITRO ======
  insitro: { x: 200, y: 290 },

  // 资本(顶部两行)
  a16z: { x: 50, y: 70 },
  arch: { x: 130, y: 45 },
  cpp: { x: 215, y: 45 },
  softbank: { x: 305, y: 70 },
  blackrock: { x: 80, y: 140 },
  temasek: { x: 285, y: 140 },

  // 客户(右侧靠中线)
  bms: { x: 350, y: 220 },
  gilead: { x: 350, y: 360 },

  // 合作伙伴(底部)
  stanford: { x: 60, y: 415 },
  ukb: { x: 185, y: 445 },
  cz: { x: 310, y: 415 },

  // 竞对(最左列,纵向)
  recursion: { x: 30, y: 215 },
  insilico: { x: 30, y: 290 },
  schrodinger: { x: 30, y: 365 },
  isomorphic: { x: 30, y: 440 },
  xaira: { x: 135, y: 440 },

  // ====== 共享 MNC ======
  lilly: { x: 545, y: 225 },

  // ====== ECYTON ======
  ecyton: { x: 905, y: 290 },

  // 资本(顶部)
  china_vc_1: { x: 760, y: 70 },
  china_vc_2: { x: 905, y: 45 },

  // 客户(左侧列)
  恒瑞: { x: 760, y: 145 },
  roche: { x: 760, y: 220 },
  biogen: { x: 760, y: 295 },
  绿叶: { x: 760, y: 370 },

  // 客户(右侧列)
  az: { x: 1050, y: 200 },
  abbvie: { x: 1050, y: 360 },

  // 供应商(底部 2×3 网格)
  bd_bio: { x: 800, y: 430 },
  '10x': { x: 880, y: 430 },
  qiagen: { x: 960, y: 430 },
  agilent: { x: 1040, y: 430 },
  opm: { x: 800, y: 480 },
  yx: { x: 880, y: 480 },

  // 合作伙伴(底部)
  cas: { x: 720, y: 480 },
  wuxi: { x: 960, y: 480 },
  nmpa: { x: 1040, y: 480 },

  // 竞对(右侧列,纵向)
  axosim: { x: 1060, y: 130 },
  sigilon: { x: 1060, y: 265 },
  xtalpi: { x: 1060, y: 425 },
};

interface HoveredNode {
  node: NetworkNode;
  canvasX: number;
  canvasY: number;
}

function nodeRadius(category: NodeCategory, weight: number): number {
  if (category === 'focal') return 22;
  return 9 + (weight - 1) * 4;
}

export const IndustryNetworkGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HoveredNode | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // reduced-motion 偏好
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    ctx.scale(DPR, DPR);

    // ============ Physics world ============
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engine.positionIterations = 6;
    engine.velocityIterations = 6;
    const world = engine.world;

    // 边界墙(防止节点飞出)
    const wallT = 30;
    const walls = [
      Matter.Bodies.rectangle(W / 2, -wallT / 2, W, wallT, { isStatic: true }),
      Matter.Bodies.rectangle(W / 2, H + wallT / 2, W, wallT, { isStatic: true }),
      Matter.Bodies.rectangle(-wallT / 2, H / 2, wallT, H, { isStatic: true }),
      Matter.Bodies.rectangle(W + wallT / 2, H / 2, wallT, H, { isStatic: true }),
    ];
    Matter.Composite.add(world, walls);

    // 节点 bodies
    const bodies = new Map<string, Matter.Body>();
    for (const n of NETWORK_NODES) {
      const pos = POS[n.id];
      if (!pos) continue;
      const r = nodeRadius(n.category, n.weight);
      const body = Matter.Bodies.circle(pos.x, pos.y, r, {
        frictionAir: 0.05,
        restitution: 0.2,
        isStatic: n.category === 'focal',
        label: n.id,
      });
      bodies.set(n.id, body);
      Matter.Composite.add(world, body);
    }

    // 边数据 + 弹簧约束(竞对用排斥)
    type EdgeRecord = { edge: typeof NETWORK_EDGES[0]; bodyA: Matter.Body; bodyB: Matter.Body };
    const edgeDrawData: EdgeRecord[] = [];
    const competitorPairs: Array<[Matter.Body, Matter.Body, number]> = [];

    for (const edge of NETWORK_EDGES) {
      const a = bodies.get(edge.from);
      const b = bodies.get(edge.to);
      if (!a || !b) continue;
      edgeDrawData.push({ edge, bodyA: a, bodyB: b });

      const w = edge.weight ?? 1;
      if (edge.type === 'competitor') {
        competitorPairs.push([a, b, 90]);
      } else {
        const stiffness = 0.004 + w * 0.012;
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const restLen = Math.sqrt(dx * dx + dy * dy);
        const c = Matter.Constraint.create({
          bodyA: a,
          bodyB: b,
          stiffness,
          damping: 0.08,
          length: restLen,
        });
        Matter.Composite.add(world, c);
      }
    }

    // ============ Animation loop ============
    let raf = 0;
    let last = performance.now();
    let alive = true;
    let mouseX = -9999;
    let mouseY = -9999;
    let hoveredId: string | null = null;
    let totalKE = Infinity; // 收敛检测:从 infinity 启动,逐步下降
    const settleFrames = { count: 0 }; // 连续静止帧数

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) * W) / rect.width;
      mouseY = ((e.clientY - rect.top) * H) / rect.height;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);

    // ---- Draw helpers ----
    const drawBackground = () => {
      ctx.fillStyle = BG_TINT;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    };

    const drawZones = () => {
      // 分隔线
      ctx.strokeStyle = 'rgba(47,93,87,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(380, 38);
      ctx.lineTo(380, H - 38);
      ctx.moveTo(720, 38);
      ctx.lineTo(720, H - 38);
      ctx.stroke();
      ctx.setLineDash([]);

      // 列标题
      ctx.fillStyle = TEXT;
      ctx.font = '700 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('INSITRO · 海外旗舰', 200, 18);
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = '700 9px system-ui, -apple-system, sans-serif';
      ctx.fillText('共享 MNC 客户', 550, 20);
      ctx.fillStyle = TEXT;
      ctx.font = '700 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('ECYTON · 中国新势力', 905, 18);
    };

    const drawEdges = () => {
      for (const { edge, bodyA, bodyB } of edgeDrawData) {
        const w = edge.weight ?? 1;
        const c = COLOR[edge.type];
        ctx.strokeStyle = c;
        ctx.globalAlpha = edge.type === 'competitor' ? 0.4 : 0.55;
        ctx.lineWidth = 1.2 + w * 0.45;
        ctx.setLineDash(edge.type === 'competitor' ? [5, 4] : []);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(bodyA.position.x, bodyA.position.y);
        ctx.lineTo(bodyB.position.x, bodyB.position.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    const drawEdgeLabels = () => {
      for (const { edge, bodyA, bodyB } of edgeDrawData) {
        if (!edge.label || (edge.weight ?? 0) < 2) continue;
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) continue;

        // 跳过靠近 focal 节点的边 label(避免压住 meta / halo)
        const midX = (bodyA.position.x + bodyB.position.x) / 2;
        const midY = (bodyA.position.y + bodyB.position.y) / 2;

        // 真正避开:把 label 沿远离最近 focal 方向偏移 25px
        let bestMidX = midX;
        let bestMidY = midY;
        let bestDist = 0;
        for (const n of NETWORK_NODES) {
          if (n.category !== 'focal') continue;
          const fb = bodies.get(n.id);
          if (!fb) continue;
          const d = Math.sqrt((midX - fb.position.x) ** 2 + (midY - fb.position.y) ** 2);
          if (d < 70 && d > bestDist) {
            bestDist = d;
            const vx = midX - fb.position.x;
            const vy = midY - fb.position.y;
            const vlen = Math.sqrt(vx * vx + vy * vy) || 1;
            bestMidX = midX + (vx / vlen) * 25;
            bestMidY = midY + (vy / vlen) * 25;
          }
        }

        ctx.font = '500 9px system-ui, -apple-system, sans-serif';
        const labelW = ctx.measureText(edge.label).width + 10;
        const labelH = 15;
        const lx = bestMidX - labelW / 2;
        const ly = bestMidY - labelH / 2;

        ctx.globalAlpha = 0.92;
        ctx.fillStyle = LABEL_BG;
        ctx.fillRect(lx, ly, labelW, labelH);
        ctx.strokeStyle = COLOR[edge.type] + '60';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(lx + 0.5, ly + 0.5, labelW - 1, labelH - 1);

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = COLOR[edge.type];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, bestMidX, bestMidY + 0.5);
      }
      ctx.globalAlpha = 1;
      ctx.textBaseline = 'alphabetic';
    };

    const drawNodes = (t: number) => {
      const breath = 1 + Math.sin(t * 0.0012) * 0.18;

      for (const n of NETWORK_NODES) {
        const body = bodies.get(n.id);
        if (!body) continue;
        const r = nodeRadius(n.category, n.weight);
        const c = COLOR[n.category];
        const isFocal = n.category === 'focal';
        const isHovered = hoveredId === n.id;
        const effectiveR = isHovered ? r * 1.18 : r;

        // focal 双层光晕(降低 alpha,避免压住邻近 label)
        if (isFocal) {
          const haloR1 = effectiveR * 3.0 * breath;
          const grad1 = ctx.createRadialGradient(
            body.position.x, body.position.y, 0,
            body.position.x, body.position.y, haloR1
          );
          grad1.addColorStop(0, c + '1a');
          grad1.addColorStop(0.5, c + '08');
          grad1.addColorStop(1, c + '00');
          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, haloR1, 0, Math.PI * 2);
          ctx.fill();

          const haloR2 = effectiveR * 1.5;
          const grad2 = ctx.createRadialGradient(
            body.position.x, body.position.y, 0,
            body.position.x, body.position.y, haloR2
          );
          grad2.addColorStop(0, c + '70');
          grad2.addColorStop(0.6, c + '20');
          grad2.addColorStop(1, c + '00');
          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, haloR2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 节点填充
        ctx.globalAlpha = isFocal ? 1 : 0.6;
        ctx.fillStyle = isFocal ? c : `${c}28`;
        ctx.beginPath();
        ctx.arc(body.position.x, body.position.y, effectiveR, 0, Math.PI * 2);
        ctx.fill();

        // 描边
        ctx.globalAlpha = isHovered ? 1 : 0.9;
        ctx.strokeStyle = c;
        ctx.lineWidth = isFocal ? 2.5 : isHovered ? 1.8 : 1.2;
        ctx.stroke();

        // 节点标签(下)
        ctx.globalAlpha = 1;
        ctx.font = `${isFocal ? 'bold ' : ''}${isFocal ? 12 : 10}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = isFocal ? COLOR.focal : TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.short || n.name, body.position.x, body.position.y + effectiveR + 3);

        // focal:meta(上,深绿文字 + 半透明白底)
        if (isFocal && n.meta) {
          ctx.font = '500 9px system-ui, -apple-system, sans-serif';
          const metaW = ctx.measureText(n.meta).width + 8;
          const metaH = 14;
          const mx = body.position.x - metaW / 2;
          const my = body.position.y - effectiveR - metaH - 2;
          ctx.globalAlpha = 0.92;
          ctx.fillStyle = LABEL_BG;
          ctx.fillRect(mx, my, metaW, metaH);
          ctx.globalAlpha = 1;
          ctx.fillStyle = TEXT;
          ctx.textBaseline = 'middle';
          ctx.fillText(n.meta, body.position.x, my + metaH / 2);
        }

        // 非焦点:地区旗(上,小)
        if (!isFocal && n.region) {
          ctx.font = '9px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = TEXT_MUTED;
          ctx.textBaseline = 'bottom';
          ctx.fillText(n.region, body.position.x, body.position.y - effectiveR - 1);
        }
      }
      ctx.textBaseline = 'alphabetic';
    };

    const drawLegend = () => {
      const items: Array<{ cat: NodeCategory; label: string }> = [
        { cat: 'capital', label: '资本' },
        { cat: 'customer', label: '客户' },
        { cat: 'supplier', label: '供应' },
        { cat: 'partner', label: '合作' },
        { cat: 'competitor', label: '竞对' },
      ];
      ctx.font = '600 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = TEXT;
      ctx.textBaseline = 'middle';

      const y = H - 12;
      let x = 30;
      for (const item of items) {
        const c = COLOR[item.cat];
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.5;
        ctx.setLineDash(item.cat === 'competitor' ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x + 10, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = TEXT;
        ctx.textAlign = 'left';
        ctx.fillText(item.label, x + 28, y);
        x += 100;
      }
    };

    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min(now - last, 33);
      last = now;

      // ---- Physics update (only when not settled or motion enabled) ----
      const physicsActive = reducedMotion ? false : totalKE > 0.08;

      if (physicsActive) {
        // competitor repulsion
        for (const [a, b, minDist] of competitorPairs) {
          const dx = b.position.x - a.position.x;
          const dy = b.position.y - a.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < minDist) {
            const f = ((minDist - dist) / minDist) * 0.0006;
            const fx = (dx / dist) * f * a.mass;
            const fy = (dy / dist) * f * a.mass;
            Matter.Body.applyForce(a, a.position, { x: -fx, y: -fy });
            Matter.Body.applyForce(b, b.position, { x: fx, y: fy });
          }
        }
        Matter.Engine.update(engine, dt);

        // KE sum
        let ke = 0;
        for (const body of bodies.values()) {
          const v = body.velocity;
          ke += body.mass * (v.x * v.x + v.y * v.y);
        }
        totalKE = ke;
        settleFrames.count = 0;
      } else {
        // 静止:逐步降低 KE 计数(用于 re-trigger 判定)
        totalKE *= 0.92;
        settleFrames.count++;
      }

      // ---- Draw ----
      ctx.clearRect(0, 0, W, H);
      drawBackground();
      drawZones();
      drawEdges();
      drawEdgeLabels();
      drawNodes(now);
      drawLegend();

      // ---- Hover detection ----
      if (mouseX > 0 && mouseY > 0) {
        let foundId: string | null = null;
        for (const n of NETWORK_NODES) {
          const body = bodies.get(n.id);
          if (!body) continue;
          const r = nodeRadius(n.category, n.weight);
          const dx = mouseX - body.position.x;
          const dy = mouseY - body.position.y;
          if (Math.sqrt(dx * dx + dy * dy) < r + 4) {
            foundId = n.id;
            break;
          }
        }
        if (foundId !== hoveredId) {
          hoveredId = foundId;
          if (foundId) {
            const node = NETWORK_NODES.find((nn) => nn.id === foundId)!;
            const rect = canvas.getBoundingClientRect();
            setHovered({
              node,
              canvasX: (mouseX * rect.width) / W,
              canvasY: (mouseY * rect.height) / H,
            });
          } else {
            setHovered(null);
          }
        } else if (foundId) {
          const rect = canvas.getBoundingClientRect();
          setHovered((h) =>
            h
              ? {
                  ...h,
                  canvasX: (mouseX * rect.width) / W,
                  canvasY: (mouseY * rect.height) / H,
                }
              : h
          );
        }
      } else if (hoveredId) {
        hoveredId = null;
        setHovered(null);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      Matter.Engine.clear(engine);
      Matter.World.clear(world, false);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        aria-label="insitro 与 ECYTON 产业关系图 · 物理引擎驱动拓扑,显示 5 类关系(资本、客户、供应、合作、竞对)"
        role="img"
        className="block w-full h-auto"
      />

      {/* Hover Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: hovered.canvasX + 14,
            top: hovered.canvasY - 8,
            transform: hovered.canvasX > W * 0.7 ? 'translateX(-110%)' : 'none',
          }}
        >
          <div className="bg-white/95 border border-[#2F5D57]/15 rounded-lg p-3 shadow-lg backdrop-blur-sm min-w-[180px] max-w-[240px]">
            <div className="flex items-start gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: COLOR[hovered.node.category] }}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#1B2520] leading-tight">
                  {hovered.node.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: COLOR[hovered.node.category] + '15',
                      color: COLOR[hovered.node.category],
                    }}
                  >
                    {LABEL[hovered.node.category]}
                  </span>
                  {hovered.node.region && (
                    <span className="text-[10px] text-[#5b6661]">
                      {hovered.node.region}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {hovered.node.meta && (
              <div className="mt-2 text-[11px] text-[#1B2520]/80 bg-[#FAF8F3] rounded p-1.5 leading-relaxed">
                {hovered.node.meta}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen reader fallback */}
      <div className="sr-only">
        产业关系拓扑图,基于两份真实尽调报告(2026 Q3):39 个节点,涵盖 2 个焦点公司(insitro、ECYTON)、8 个资本方、9 个客户(MNC 药企)、6 个供应商、6 个合作伙伴、8 个竞对。
        insitro 与 ECYTON 共享客户 Lilly,体现两家公司在中国 AI 制药赛道的间接关联。
        颜色编码:绿色=资本方,橙色=客户,青色=供应商,紫色=合作伙伴,红色虚线=竞对。
        节点大小代表影响力(1–5 星)。
      </div>
    </div>
  );
};
