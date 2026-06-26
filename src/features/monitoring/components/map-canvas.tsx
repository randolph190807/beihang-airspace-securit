import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { normToViewBox } from "@/features/monitoring/lib/coordinates";
import { THREAT_COLORS } from "@/features/monitoring/types";

export function MapCanvas() {
  const { scene, targets, selectedTargetId, selectTarget, showTrack } =
    useMonitoring();

  if (!scene) return null;

  const [vx, vy, vw, vh] = scene.map.viewBox;
  const center = normToViewBox(scene.venue.center, scene.map.viewBox);
  const radii = {
    warning: scene.zones.warning.radiusNorm * vw,
    track: scene.zones.track.radiusNorm * vw,
    counter: scene.zones.counter.radiusNorm * vw,
  };

  const ppi = scene.map.radarPpi;
  const ppiCenter = normToViewBox(ppi.position, scene.map.viewBox);
  const ppiR = (ppi.diameterNorm * vw) / 2;

  const corePoints = scene.coreArea.polygon
    .map((p) => normToViewBox(p, scene.map.viewBox))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const visibleTargets = targets.filter((t) => t.visible);

  return (
    <div className="relative overflow-hidden rounded-lg border border-cyan-200/10 bg-[#031025]">
      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className="aspect-square w-full"
        role="img"
        aria-label="区域监控地图"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="100%" stopColor="rgba(3,16,37,0)" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={vw} height={vh} fill="#031025" />
        <rect x={0} y={0} width={vw} height={vh} fill="url(#mapGlow)" />

        <circle
          cx={center.x}
          cy={center.y}
          r={radii.warning}
          fill="none"
          stroke="rgba(56,189,248,0.18)"
          strokeWidth={2}
          strokeDasharray="8 6"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={radii.track}
          fill="none"
          stroke="rgba(234,179,8,0.22)"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={radii.counter}
          fill="none"
          stroke="rgba(239,68,68,0.35)"
          strokeWidth={2}
        />

        <polygon
          points={corePoints}
          fill="rgba(239,68,68,0.12)"
          stroke="rgba(239,68,68,0.55)"
          strokeWidth={2}
        />

        <text
          x={center.x}
          y={center.y - radii.counter - 12}
          textAnchor="middle"
          fill="rgba(248,113,113,0.85)"
          fontSize={14}
        >
          {scene.coreArea.name}
        </text>

        {visibleTargets.map((target) => {
          if (!showTrack || target.trackPoints.length < 2) return null;
          const points = target.trackPoints
            .map((p) => normToViewBox(p, scene.map.viewBox))
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polyline
              key={`track-${target.targetId}`}
              points={points}
              fill="none"
              stroke={THREAT_COLORS[target.threatLevel]}
              strokeWidth={2}
              strokeOpacity={0.55}
            />
          );
        })}

        {visibleTargets.map((target) => {
          const pos = normToViewBox(target.position, scene.map.viewBox);
          const selected = selectedTargetId === target.targetId;
          const color = THREAT_COLORS[target.threatLevel];

          return (
            <g
              key={target.targetId}
              className="cursor-pointer"
              onClick={() => selectTarget(target.targetId)}
            >
              {selected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={16}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={8}
                fill={color}
                style={{ filter: `drop-shadow(0 0 8px ${color})` }}
              />
              <text
                x={pos.x + 12}
                y={pos.y - 10}
                fill="#e2e8f0"
                fontSize={13}
                fontWeight={600}
              >
                {target.callsign}
              </text>
              <text
                x={pos.x + 12}
                y={pos.y + 8}
                fill="rgba(148,163,184,0.9)"
                fontSize={11}
              >
                {Math.round(target.altitudeM)}m
              </text>
            </g>
          );
        })}

        <g transform={`translate(${ppiCenter.x - ppiR}, ${ppiCenter.y - ppiR})`}>
          <circle
            cx={ppiR}
            cy={ppiR}
            r={ppiR}
            fill="rgba(6,22,47,0.85)"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth={2}
          />
          <g className="radar-sweep" style={{ transformOrigin: `${ppiR}px ${ppiR}px` }}>
            <line
              x1={ppiR}
              y1={ppiR}
              x2={ppiR}
              y2={ppiR * 0.15}
              stroke="rgba(34,211,238,0.85)"
              strokeWidth={2}
            />
            <path
              d={`M ${ppiR} ${ppiR} L ${ppiR} ${ppiR * 0.15} A ${ppiR} ${ppiR} 0 0 1 ${ppiR + ppiR * 0.22} ${ppiR - ppiR * 0.08} Z`}
              fill="rgba(34,211,238,0.12)"
            />
          </g>
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 rounded-md border border-cyan-200/10 bg-[#06162f]/90 px-3 py-2 text-xs text-blue-100/55">
        <div>{scene.zones.warning.label} {scene.zones.warning.rangeKm}km</div>
        <div>{scene.zones.track.label} {scene.zones.track.rangeKm}km</div>
        <div>{scene.zones.counter.label} {scene.zones.counter.rangeKm}km</div>
      </div>
    </div>
  );
}
