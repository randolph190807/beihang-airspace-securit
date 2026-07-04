import { Check } from "lucide-react";
import { cn } from "./ui/mobile-variants";

interface ProcessStepProps {
  label: string;
  finished: boolean;
  active: boolean;
}

export default function ProcessStep({ label, finished, active }: ProcessStepProps) {
  return (
    <div className="flex items-center gap-3 text-lg">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
          finished
            ? "bg-emerald-500 border-emerald-400"
            : active
            ? "border-amber-400 bg-amber-900/30"
            : "border-slate-600"
        )}
      >
        {finished && <Check size={16} className="text-white" />}
      </div>
      <span
        className={cn(
          "transition-colors duration-300",
          finished ? "text-emerald-300" : active ? "text-amber-300" : "text-slate-400"
        )}
      >
        {label}
      </span>
    </div>
  );
}