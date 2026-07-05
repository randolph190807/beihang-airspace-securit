import { Slider } from "@/components/ui/slider";

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;

export function clampMapScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(1))));
}

export function MapScaleControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="absolute right-4 top-[64px] z-[3] flex w-12 flex-col items-center rounded-md border border-cyan-200/10 bg-[#06162f]/90 px-1 py-4  text-blue-100/60 shadow-[0_8px_24px_rgba(2,6,23,0.28)]">
      <span className="text-xs text-cyan-50">{Math.round(value * 100)}%</span>
      <div className="mt-2 flex h-28 items-center justify-center">
        <Slider
          orientation="vertical"
          min={MIN_SCALE}
          max={MAX_SCALE}
          step={STEP}
          value={[value]}
          onValueChange={(nextValue) => {
            const [next] = nextValue;
            if (typeof next === "number") {
              onChange(clampMapScale(next));
            }
          }}
          aria-label="地图缩放比例"
          className="h-full"
        />
      </div>
    </div>
  );
}
