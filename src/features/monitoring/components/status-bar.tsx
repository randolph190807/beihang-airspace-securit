import { useEffect, useState } from "react";
import { useMonitoring } from "@/features/monitoring/monitoring-context";

function formatLocalTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function StatusBar() {
  const { scene, alertCounts, targets } = useMonitoring();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!scene) return null;

  const visibleCount = targets.filter(
    (t) => t.visible && t.motionState !== "disposed",
  ).length;

  return (
    <header className="rounded-lg border border-cyan-200/12 bg-[#06162f]/90 px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-cyan-50">{scene.title}</h2>
          <p className="mt-1 text-sm text-blue-100/55">
            {scene.venue.name} · {formatLocalTime(now)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-red-400">
              警报 <strong className="text-lg">{alertCounts.alert}</strong>
            </span>
            <span className="text-amber-300">
              预警 <strong className="text-lg">{alertCounts.warning}</strong>
            </span>
          </div>

          <span className="rounded-md border border-cyan-200/15 px-2 py-1 text-cyan-100/80">
            指挥官 · 用户1
          </span>

          <span className="text-blue-100/55">
            空中目标 <strong className="text-cyan-50">{visibleCount}</strong>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-cyan-200/10 pt-3">
        {scene.legend.map((item) => (
          <span key={item.key} className="flex items-center gap-1.5 text-xs text-blue-100/65">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </header>
  );
}
