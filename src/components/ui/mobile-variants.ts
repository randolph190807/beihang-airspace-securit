import { cva, type VariantProps, cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: unknown[]) {
  return twMerge(cx(inputs));
}

// 移动端卡片基础变体
export const mobileCardVariants = cva(
  "w-full rounded-xl p-4 backdrop-blur-sm border",
  {
    variants: {
      theme: {
        dark: "bg-slate-900/70 border-slate-700/60",
        danger: "bg-red-950/30 border-red-700/60",
        success: "bg-emerald-950/30 border-emerald-700/60",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);
export type MobileCardVariant = VariantProps<typeof mobileCardVariants>;

// 状态标签
export const tagVariants = cva(
  "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5",
  {
    variants: {
      mode: {
        danger: "bg-red-600/20 border border-red-500 text-red-400",
        warning: "bg-amber-600/20 border border-amber-500 text-amber-400",
        success: "bg-emerald-600/20 border border-emerald-500 text-emerald-400",
      },
    },
    defaultVariants: {
      mode: "dark",
    },
  }
);

// 底部操作大按钮
export const actionBtnVariants = cva(
  "w-full py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-2",
  {
    variants: {
      type: {
        danger: "bg-red-500 text-white",
        success: "bg-emerald-500 text-white",
      },
    },
    defaultVariants: {
      type: "danger",
    },
  }
);