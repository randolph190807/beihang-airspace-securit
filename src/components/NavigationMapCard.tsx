import { useEffect, useRef, useState } from "react";

export interface NavigationMapProps {
  targetName: string;
  distance: number;
  directionText: string;
  enableDynamic?: boolean;
}

interface Point {
  x: number;
  y: number;
}

const NavigationMapCard = (props: NavigationMapProps) => {
  const { targetName, distance, directionText, enableDynamic = true } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 离屏画布：缓存静态背景网格，只渲染一次
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number>(0);
  const moveAnimIdRef = useRef<number>(0);

  const selfPos: Point = { x: 180, y: 780 };
  const [targetPos, setTargetPos] = useState<Point>({ x: 1100, y: 320 });

  // 1. 目标移动动画优化（增加防抖，StrictMode防重复执行）
  useEffect(() => {
		if (!enableDynamic) return;
		let offset = 0;
		let alive = true;
		// 目标初始坐标
		let currentX = 1100;
		let currentY = 320;
		// 我方固定坐标
		const targetSelfX = selfPos.x;
		const targetSelfY = selfPos.y;
	
		const animateTarget = () => {
			if (!alive) return;
			offset += 0.012;
	
			// 1. 持续向我方坐标靠近（每帧缩小差值，实现前进）
			const speed = 0.1; // 靠近速度，越大越快冲向你
			currentX += (targetSelfX - currentX) * 0.008 * speed;
			currentY += (targetSelfY - currentY) * 0.008 * speed;
	
			// 2. 叠加小幅正弦晃动（模拟飞行颠簸）
			const shakeX = Math.sin(offset) * 8;
			const shakeY = Math.cos(offset) * 6;
	
			setTargetPos({
				x: currentX + shakeX,
				y: currentY + shakeY,
			});
			moveAnimIdRef.current = requestAnimationFrame(animateTarget);
		};
		moveAnimIdRef.current = requestAnimationFrame(animateTarget);
	
		return () => {
			alive = false;
			cancelAnimationFrame(moveAnimIdRef.current);
		};
	}, [enableDynamic]);

  // 2. Canvas分层渲染（静态背景缓存 + 仅动态元素每帧重绘）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false }); // alpha:false 关闭透明，提升性能
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 1600;
    const height = 960;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 初始化离屏画布，绘制静态背景（仅执行1次）
    if (!offscreenCanvasRef.current) {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext("2d", { alpha: false })!;
      // 深色背景
      offCtx.fillStyle = "#141a29";
      offCtx.fillRect(0, 0, width, height);
      // 网格（静态，只画一次）
      offCtx.strokeStyle = "rgba(255,255,255,0.06)";
      offCtx.lineWidth = 1.5;
      for (let i = 0; i < width; i += 60) {
        offCtx.beginPath();
        offCtx.moveTo(i, 0);
        offCtx.lineTo(i, height);
        offCtx.stroke();
      }
      for (let i = 0; i < height; i += 60) {
        offCtx.beginPath();
        offCtx.moveTo(0, i);
        offCtx.lineTo(width, i);
        offCtx.stroke();
      }
      offscreenCanvasRef.current = offCanvas;
    }

    // 每帧只绘制动态内容
    const renderLoop = () => {
      // 1. 先贴静态背景（直接复制缓存画布，无计算）
      ctx.drawImage(offscreenCanvasRef.current!, 0, 0);

      // ========== 仅下面内容每帧重绘 ==========
      // 虚线连线
      ctx.setLineDash([18, 10]);
      ctx.strokeStyle = "#ffc845";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(selfPos.x, selfPos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // 中间距离文字
      const midX = (selfPos.x + targetPos.x) / 2;
      const midY = (selfPos.y + targetPos.y) / 2;
      ctx.fillStyle = "#ffc845";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      const dir = directionText.split("·")[0].trim();
      ctx.fillText(`≈ ${distance} m · ${dir}`, midX, midY - 14);

      // 己方绿色箭头
      ctx.save();
      ctx.translate(selfPos.x, selfPos.y);
      const angle = Math.atan2(targetPos.y - selfPos.y, targetPos.x - selfPos.x);
      ctx.rotate(angle);
      ctx.fillStyle = "#36d35e";
      ctx.beginPath();
      ctx.moveTo(38, 0);
      ctx.lineTo(-18, -22);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-18, 22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 己方文字
      ctx.fillStyle = "#cdd5e1";
      ctx.font = "34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("你的位置", selfPos.x, selfPos.y + 55);

      // 目标红圈外层
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, 52, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.fill();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.stroke();
      // 目标红点
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      // 目标名称
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 40px sans-serif";
      ctx.fillText(targetName, targetPos.x, targetPos.y - 58);

      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationIdRef.current = requestAnimationFrame(renderLoop);

    // 组件销毁清除动画
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [targetPos, targetName, distance, directionText]);

  return (
    <div className="w-full rounded-xl p-4 backdrop-blur-sm border bg-slate-900/70 border-slate-700/60 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧭</span>
        <span className="text-xl text-slate-200">导航 · 去哪里</span>
      </div>
      <canvas
        ref={canvasRef}
        width={1600}
        height={960}
        className="w-full rounded-xl overflow-hidden border border-slate-700/50"
      />
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 mt-6">
        <span className="text-slate-400 text-xl">目标方位</span>
        <span className="text-white text-right text-xl whitespace-nowrap">
          {directionText}
        </span>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 mt-3">
        <span className="text-slate-400 text-xl">距你距离</span>
        <span className="text-yellow-400 text-right text-xl whitespace-nowrap">
          ≈ {distance} m
        </span>
      </div>
    </div>
  );
};

export default NavigationMapCard;