import { useEffect } from "react";
import { cn, statCardVariants, StatCardVariant } from "./ui/dashboard-variants";
import { useCountUp } from "../hooks/useCountUp";

interface StatCardProps extends StatCardVariant {
  value: string | number;
  label: string;
  compareText?: string;
  compareType: "up" | "down" | "none";
  valueColor?: "white" | "red" | "green" | "blue";
	suffix?: string;
}

export default function StatCard({
  value,
  label,
  compareText,
  compareType,
  valueColor = "white",
  highlight,
	suffix,
}: StatCardProps) {
	const animateNum = useCountUp(value, 1400);

  return (
    <div className={cn(statCardVariants({ highlight }), "animate-fadeIn")}>
      {/* 核心数字 */}
      <div
        className={cn("text-5xl font-bold mb-2 tracking-wide transition-all duration-700", {
          "text-white": valueColor === "white",
          "text-red-500": valueColor === "red",
          "text-emerald-500": valueColor === "green",
          "text-sky-400": valueColor === "blue",
        })}
      >
        {animateNum}{suffix || ""}
      </div>
      {/* 卡片标题 */}
      <div className="text-slate-400 text-lg mb-3">{label}</div>
      {/* 环比变化 */}
      {compareText && (
        <div
          className={cn("text-base flex items-center gap-1", {
            "text-red-400": compareType === "up",
            "text-emerald-400": compareType === "down",
          })}
        >
          {compareType === "up" ? "▲" : "▼"} {compareText}
        </div>
      )}
    </div>
  );
}