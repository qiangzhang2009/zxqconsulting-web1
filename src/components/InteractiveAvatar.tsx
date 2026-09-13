import { useEffect, useRef, useState, useCallback } from 'react';

interface AvatarConfig {
  name: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  colsPerRow: number;
}

const AVATAR_CONFIGS: Record<string, AvatarConfig> = {
  synapse: {
    name: 'synapse',
    frameWidth: 600,
    frameHeight: 338,
    totalFrames: 32,
    colsPerRow: 32,
  },
};

const AVATAR_CHUNK_PATH = '/avatars/synapse-spritesheet-part';

interface InteractiveAvatarProps {
  /** 紧凑模式:隐藏帧号/进度条(用于吉祥物嵌入) */
  compact?: boolean;
  /** 加载占位背景色,适配深色容器 */
  loadingBg?: string;
  /** 紧凑模式下的可选小标签 */
  label?: string;
}

export const InteractiveAvatar = ({
  compact = false,
  loadingBg = '#FAF8F3',
  label,
}: InteractiveAvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spritesheetRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);

  const [currentAvatar] = useState('synapse');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const frameIndexRef = useRef(0);
  const targetFrameIndexRef = useRef(16);
  const lastMouseXRef = useRef<number | null>(null);

  const config = AVATAR_CONFIGS[currentAvatar];

  // 加载 4 个 chunk 并拼到一个 offscreen canvas
  useEffect(() => {
    const FRAME_W = config.frameWidth;
    const FRAME_H = config.frameHeight;
    const TOTAL_FRAMES = config.totalFrames;

    const combined = document.createElement('canvas');
    combined.width = TOTAL_FRAMES * FRAME_W;
    combined.height = FRAME_H;
    const ctx = combined.getContext('2d')!;

    const CHUNKS: [string, number][] = [
      [AVATAR_CHUNK_PATH + '0.webp', 10],
      [AVATAR_CHUNK_PATH + '1.webp', 10],
      [AVATAR_CHUNK_PATH + '2.webp', 10],
      [AVATAR_CHUNK_PATH + '3.webp', 2],
    ];

    let loadedCount = 0;
    let cancelled = false;

    const onChunkLoad = (i: number, xOffset: number) => {
      const [chunkPath, frames] = CHUNKS[i];
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        ctx.drawImage(img, xOffset, 0);
        loadedCount++;
        if (loadedCount === CHUNKS.length) {
          spritesheetRef.current = combined;
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        console.error('[Avatar] Chunk failed to load:', chunkPath);
      };
      img.src = chunkPath;
    };

    onChunkLoad(0, 0);
    // 预加载其余部分
    for (let k = 1; k < CHUNKS.length; k++) {
      onChunkLoad(k, CHUNKS.slice(0, k).reduce((acc, [, f]) => acc + f * FRAME_W, 0));
    }

    return () => {
      cancelled = true;
    };
  }, [config]);

  // 渲染帧 - cover mode
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const spritesheet = spritesheetRef.current;

    if (!canvas || !ctx || !spritesheet || !isLoaded) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const { frameWidth, frameHeight, colsPerRow } = config;

    const diff = targetFrameIndexRef.current - frameIndexRef.current;
    frameIndexRef.current += diff * 0.12;

    const frameNum = Math.round(frameIndexRef.current);
    const col = frameNum % colsPerRow;
    const row = Math.floor(frameNum / colsPerRow);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasAspect = canvas.width / canvas.height;
    const spriteAspect = frameWidth / frameHeight;

    let sx: number, sy: number, sWidth: number, sHeight: number;

    if (canvasAspect > spriteAspect) {
      const targetHeight = frameWidth / canvasAspect;
      sWidth = frameWidth;
      sHeight = targetHeight;
      sx = col * frameWidth;
      sy = row * frameHeight + (frameHeight - targetHeight) / 2;
    } else {
      const targetWidth = frameHeight * canvasAspect;
      sWidth = targetWidth;
      sHeight = frameHeight;
      sx = col * frameWidth + (frameWidth - targetWidth) / 2;
      sy = row * frameHeight;
    }

    ctx.drawImage(spritesheet, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    animationRef.current = requestAnimationFrame(renderFrame);
  }, [config, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      animationRef.current = requestAnimationFrame(renderFrame);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isLoaded, renderFrame]);

  // 鼠标交互
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastMouseXRef.current !== null) {
        const deltaX = e.clientX - lastMouseXRef.current;
        targetFrameIndexRef.current = Math.max(
          0,
          Math.min(config.totalFrames - 1, targetFrameIndexRef.current + deltaX * 0.5)
        );
      }
      lastMouseXRef.current = e.clientX;
    };

    const handleMouseLeave = () => {
      lastMouseXRef.current = null;
      const { totalFrames, colsPerRow } = config;
      const centerCol = Math.floor(colsPerRow / 2);
      const centerRow = Math.floor(Math.floor(totalFrames / colsPerRow) / 2);
      targetFrameIndexRef.current = centerRow * colsPerRow + centerCol;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config]);

  // canvas 尺寸跟随父容器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;

    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-full cursor-pointer overflow-hidden rounded-2xl
        transition-transform duration-500 ease-spring
        ${isHovered ? 'scale-[1.02]' : 'scale-100'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 加载状态 */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: loadingBg }}
        >
          <div
            className={`h-8 w-8 animate-spin rounded-full border-2 border-t-current ${
              compact ? 'border-amber-400/30' : 'border-[#2F5D57]/20'
            }`}
            style={{ color: compact ? '#fcd34d' : '#2F5D57' }}
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'contain' }}
      />

      {/* 紧凑模式:小 live 指示 + 可选标签 */}
      {compact ? (
        <>
          <div className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-1.5 py-0.5 backdrop-blur-sm z-10">
            <span className="h-1 w-1 rounded-full bg-amber-400 animate-ink-pulse" />
          </div>
          {label && (
            <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center z-10">
              <span className="text-[8px] font-bold uppercase tracking-widest text-amber-200/90">
                {label}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 帧号指示器 */}
          <div className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm z-10">
            <span className="h-1 w-1 rounded-full bg-[#C2473B] animate-ink-pulse" />
            {Math.round(frameIndexRef.current) + 1}/{config.totalFrames}
          </div>

          {/* 底部进度条 */}
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="h-1 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full bg-[#C2473B] transition-all duration-100"
                style={{ width: `${((Math.round(frameIndexRef.current) + 1) / config.totalFrames) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InteractiveAvatar;
