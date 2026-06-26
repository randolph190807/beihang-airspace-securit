import { BarChart3, CircleGauge, Clock3, ShieldAlert } from "lucide-react";

const metrics = [
  { label: "今日飞行计划", value: "284", delta: "+18.4%" },
  { label: "自动放行率", value: "91.6%", delta: "+2.1%" },
  { label: "平均处置时长", value: "04:18", delta: "-37s" },
  { label: "重点区域覆盖", value: "98.2%", delta: "稳定" },
];

const riskItems = [
  { name: "未备案航迹", count: 7, level: "高" },
  { name: "低高度穿越", count: 12, level: "中" },
  { name: "通信质量下降", count: 4, level: "中" },
];

export function DashboardPage() {
  return (
    <section className="min-h-full rounded-lg border border-cyan-200/12 bg-[#071d3c]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_24px_70px_rgba(1,13,35,0.28)]">
      <div className="flex flex-col gap-3 border-b border-cyan-200/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/45">
            Command Dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-wide text-cyan-50">
            大盘数据
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/10 px-3 py-1.5 text-sm text-cyan-100/75">
          <Clock3 className="h-4 w-4" />
          数据更新 09:42
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/8 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <p className="text-sm text-blue-100/55">{item.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <span className="text-3xl font-semibold text-cyan-50">
                {item.value}
              </span>
              <span className="rounded-full bg-cyan-200/10 px-2 py-1 text-xs text-cyan-100/70">
                {item.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-cyan-200/10 bg-[#06162f] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-50">
              <BarChart3 className="h-5 w-5" />
              <h3 className="font-semibold">空域运行趋势</h3>
            </div>
            <span className="text-xs text-blue-100/45">近 12 小时</span>
          </div>
          <div className="mt-6 flex h-72 items-end gap-3 border-b border-l border-cyan-200/10 px-4 pb-4">
            {[42, 58, 48, 72, 64, 86, 76, 92, 68, 74, 88, 96].map(
              (height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-cyan-200/55 shadow-[0_0_18px_rgba(103,232,249,0.25)]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-blue-100/35">
                    {index + 1}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
            <div className="flex items-center gap-2 text-cyan-50">
              <CircleGauge className="h-5 w-5" />
              <h3 className="font-semibold">运行健康度</h3>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-3xl font-semibold text-emerald-100">
                94
              </div>
              <p className="text-sm leading-6 text-blue-100/55">
                系统整体稳定，重点关注东南扇区临时航线流量增长。
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200/15 bg-amber-300/8 p-4">
            <div className="flex items-center gap-2 text-amber-100">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-semibold">风险排行</h3>
            </div>
            <div className="mt-4 space-y-3">
              {riskItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-md bg-[#06162f]/65 px-3 py-2 text-sm"
                >
                  <span className="text-amber-50/72">{item.name}</span>
                  <span className="text-amber-100">
                    {item.count} · {item.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
