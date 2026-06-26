import { cva, type VariantProps, cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// 合并className工具
export function cn(...inputs: any[]) {
	return twMerge(cx(inputs));
}

// 大屏统计卡片变体
export const statCardVariants = cva(
	"w-full rounded-xl bg-[#08244a] border border-slate-700/60 backdrop-blur-sm p-5",
	{
		variants: {
			highlight: {
				default: "",
				red: "border-red-800/50",
				green: "border-emerald-800/50",
				blue: "border-sky-800/50",
			},
		},
		defaultVariants: {
			highlight: "default",
		},
	}
);
export type StatCardVariant = VariantProps<typeof statCardVariants>;

// 图表容器卡片
export const chartCardVariants = cva(
  "w-full rounded-lg bg-slate-900/70 border border-slate-700/60 p-4 backdrop-blur-sm",
  {
		variants: {
			highlight: {
				default: "",
				red: "border-red-800/50",
				green: "border-emerald-800/50",
				blue: "border-sky-800/50",
			},
		},
	}
);

// 顶部操作按钮
export const dashBtnVariants = cva(
	"px-5 py-2 rounded-lg text-sm font-medium transition-all",
	{
		variants: {
			mode: {
				dark: "bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700",
				primary: "bg-sky-600 text-white hover:bg-sky-500 border border-sky-500",
			},
		},
		defaultVariants: {
			mode: "dark",
		},
	}
);
export type DashBtnVariant = VariantProps<typeof dashBtnVariants>;