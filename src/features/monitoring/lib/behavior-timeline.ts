import type { BehaviorEvent, ZoneLevel } from "@/features/monitoring/types";

function formatEventTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function zoneEventLabel(from: ZoneLevel, to: ZoneLevel): string | null {
  if (from === to) return null;
  if (from === "outside" && to !== "outside") return "雷达A首次发现";
  if (to === "track") return "进入跟踪区";
  if (to === "counter") return "进入反制区";
  return null;
}

export function appendZoneBehaviorEvents(
  timeline: BehaviorEvent[],
  fromZone: ZoneLevel,
  toZone: ZoneLevel,
  targetId: string,
): BehaviorEvent[] {
  const label = zoneEventLabel(fromZone, toZone);
  if (!label) return timeline;

  const eventId = `${targetId}-${label}-${toZone}`;
  if (timeline.some((item) => item.id === eventId)) return timeline;

  const now = new Date();
  const next: BehaviorEvent[] = [
    {
      id: eventId,
      timestamp: formatEventTime(now),
      label,
    },
    ...timeline,
  ];

  if (toZone === "counter" && !timeline.some((item) => item.label === "加速逼近核心区域")) {
    const accelDate = new Date(now.getTime() - 60_000);
    next.unshift({
      id: `${targetId}-accel`,
      timestamp: formatEventTime(accelDate),
      label: "加速逼近核心区域",
    });
  }

  return next;
}
