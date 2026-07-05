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

  return (
    <header className="rounded-lg border border-gray-300/50 bg-[#04152d]/96 px-4 py-3 py-3backdrop-blur-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-medium text-cyan-50">{scene.title}</h2>
          <p className="mt-1 text-sm text-blue-100/72">
            {scene.venue.name} · {formatLocalTime(now)}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {scene.legend.map((item) => (
            <span key={item.key} className="flex items-center gap-1.5 text-xs text-blue-100/78">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
