import type { Point, ZoneLevel } from "@/features/monitoring/types";

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function detectZone(
  pos: Point,
  center: Point,
  zones: { warning: number; track: number; counter: number },
): ZoneLevel {
  const d = dist(pos, center);
  if (d <= zones.counter) return "counter";
  if (d <= zones.track) return "track";
  if (d <= zones.warning) return "warning";
  return "outside";
}

function segmentRatioToCenter(from: Point, to: Point, center: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  const t = ((center.x - from.x) * dx + (center.y - from.y) * dy) / lenSq;
  return Math.min(1, Math.max(0, t));
}

function polygonPerimeter(vertices: Point[]): number {
  let total = 0;
  for (let i = 0; i < vertices.length; i++) {
    total += dist(vertices[i], vertices[(i + 1) % vertices.length]);
  }
  return total;
}

export function evalPolygonLoop(
  vertices: Point[],
  lapDurationSec: number,
  nowMs: number,
  originMs: number,
  speedMultiplier: number,
): Point {
  const perimeter = polygonPerimeter(vertices);
  const lapDuration = lapDurationSec / speedMultiplier;
  const speed = perimeter / lapDuration;
  const elapsed = (((nowMs - originMs) / 1000) % lapDuration + lapDuration) % lapDuration;
  let distAlong = speed * elapsed;

  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const edgeLen = dist(a, b);
    if (distAlong <= edgeLen || i === vertices.length - 1) {
      const t = edgeLen === 0 ? 0 : distAlong / edgeLen;
      return lerpPoint(a, b, Math.min(1, t));
    }
    distAlong -= edgeLen;
  }

  return vertices[0];
}

export function evalLinear(
  from: Point,
  to: Point,
  center: Point,
  toCoreSec: number,
  altitude: { from: number; to: number },
  elapsedSec: number,
  speedMultiplier: number,
): { position: Point; altitudeM: number; done: boolean; progress: number } {
  const coreFrac = segmentRatioToCenter(from, to, center);
  const totalLen = dist(from, to);
  const lenToCore = totalLen * coreFrac;
  const effectiveSec = toCoreSec / speedMultiplier;
  const speed = lenToCore > 0 ? lenToCore / effectiveSec : totalLen / effectiveSec;
  const totalDuration = totalLen / speed;
  const progress = Math.min(1, Math.max(0, elapsedSec / totalDuration));

  return {
    position: lerpPoint(from, to, progress),
    altitudeM: lerp(altitude.from, altitude.to, progress),
    done: progress >= 1,
    progress,
  };
}

export function normToViewBox(
  point: Point,
  viewBox: [number, number, number, number],
): Point {
  const [, , w, h] = viewBox;
  return { x: point.x * w, y: point.y * h };
}
