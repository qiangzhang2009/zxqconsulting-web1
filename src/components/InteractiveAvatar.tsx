import { useEffect, useRef, useState, useCallback } from 'react';

interface AvatarConfig {
  name: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  colsPerRow: number;
  scale?: number;
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

// 4 WebP chunks that together form the full spritesheet (19200x338)
const CHUNK_COUNT = 4;
const AVATAR_CHUNK_PATH = '/avatars/synapse-spritesheet-part';

export const InteractiveAvatar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spritesheetRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);

  const [currentAvatar, setCurrentAvatar] = useState('synapse');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const frameIndexRef = useRef(0);
  const targetFrameIndexRef = useRef(16); // Start at center
  const lastMouseXRef = useRef<number | null>(null);

  const config = AVATAR_CONFIGS[currentAvatar];

  // Load all WebP chunks and combine them into a single offscreen canvas
  useEffect(() => {
    const FRAME_W = config.frameWidth;
    const FRAME_H = config.frameHeight;
    const TOTAL_FRAMES = config.totalFrames;
    const COLS = config.colsPerRow;

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

    const loadChunk = (i: number, xOffset: number) => {
      if (i >= CHUNKS.length) return;
      const [chunkPath, frames] = CHUNKS[i];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, xOffset, 0);
        loadedCount++;
        if (loadedCount === CHUNKS.length) {
          spritesheetRef.current = combined;
          setIsLoaded(true);
        }
        loadChunk(i + 1, xOffset + frames * FRAME_W);
      };
      img.onerror = () => {
        console.error('[Avatar] Chunk failed to load:', chunkPath);
      };
      img.src = chunkPath;
    };

    loadChunk(0, 0);

    return () => {
      CHUNKS.forEach(() => {});
    };
  }, [config]);

  // Render frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const spritesheet = spritesheetRef.current;

    if (!canvas || !ctx || !spritesheet || !isLoaded) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const { frameWidth, frameHeight, totalFrames, colsPerRow } = config;

    // Smooth interpolation
    const diff = targetFrameIndexRef.current - frameIndexRef.current;
    frameIndexRef.current += diff * 0.12;

    const frameNum = Math.round(frameIndexRef.current);
    const col = frameNum % colsPerRow;
    const row = Math.floor(frameNum / colsPerRow);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate source rect - cover mode (may crop edges, no gaps)
    const canvasAspect = canvas.width / canvas.height;
    const spriteAspect = frameWidth / frameHeight;
    
    let sx: number, sy: number, sWidth: number, sHeight: number;

    if (canvasAspect > spriteAspect) {
      // Canvas is wider than sprite - crop top/bottom of sprite to fill height
      // e.g. canvas 700x450 (1.778), sprite 600x338 (1.775) → fit by width
      const targetHeight = frameWidth / canvasAspect;
      sWidth = frameWidth;
      sHeight = targetHeight;
      sx = col * frameWidth;
      sy = row * frameHeight + (frameHeight - targetHeight) / 2;
    } else {
      // Canvas is taller than sprite - crop left/right of sprite to fill width
      // e.g. canvas 450x600 (0.75), sprite 600x338 (1.775) → fit by height
      const targetWidth = frameHeight * canvasAspect;
      sWidth = targetWidth;
      sHeight = frameHeight;
      sx = col * frameWidth + (frameWidth - targetWidth) / 2;
      sy = row * frameHeight;
    }
    
    ctx.drawImage(
      spritesheet,
      sx, sy, sWidth, sHeight,
      0, 0, canvas.width, canvas.height
    );

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [config, isLoaded]);

  // Start render loop
  useEffect(() => {
    if (isLoaded) {
      animationRef.current = requestAnimationFrame(renderFrame);
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, renderFrame]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;

      if (lastMouseXRef.current !== null) {
        const deltaX = mouseX - lastMouseXRef.current;
        const sensitivity = 0.5;
        const frameDelta = deltaX * sensitivity;

        const { totalFrames, colsPerRow } = config;
        const maxFrame = totalFrames - 1;

        targetFrameIndexRef.current = Math.max(
          0,
          Math.min(maxFrame, targetFrameIndexRef.current + frameDelta)
        );
      }

      lastMouseXRef.current = mouseX;
    };

    const handleMouseLeave = () => {
      lastMouseXRef.current = null;
      // Return to center
      const { totalFrames, colsPerRow } = config;
      const centerCol = Math.floor(colsPerRow / 2);
      const centerRow = Math.floor((totalFrames / colsPerRow) / 2);
      targetFrameIndexRef.current = centerRow * colsPerRow + centerCol;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [config]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full cursor-pointer
        transition-all duration-500 ease-out
        ${isHovered ? 'scale-[1.02]' : 'scale-120'}
      `}
      style={{ 
        height: '90%',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '3 / 5'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-3xl blur-3xl
          transition-all duration-500
          ${isHovered
            ? 'bg-emerald-500/20 opacity-100'
            : 'bg-emerald-500/10 opacity-60'
          }
        `}
      />

      {/* Avatar container */}
      <div
        className={`
          relative h-full w-full overflow-hidden rounded-3xl
          border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent
          backdrop-blur-sm
          transition-all duration-300
          ${isHovered ? 'border-emerald-400/30' : ''}
        `}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'contain' }}
        />

        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
          </div>
        )}

        {/* Floating animation */}
        <div
          className={`
            absolute inset-0 pointer-events-none
            transition-transform duration-1000 ease-in-out
            ${isHovered ? 'translate-y-0' : '-translate-y-1'}
          `}
          style={{
            animation: 'avatarFloat 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Hint label */}
      <div
        className={`
          absolute -bottom-10 left-1/2 -translate-x-1/2
          text-xs text-slate-500 transition-opacity duration-300
          ${isHovered ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="animate-pulse">←</span>
          move to interact
          <span className="animate-pulse">→</span>
        </span>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default InteractiveAvatar;
