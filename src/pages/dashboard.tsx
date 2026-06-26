// export function DashboardPage() {
//   return (
//     <section className="h-full rounded-md border border-sky-300/20 bg-[#0a254d] p-6 shadow-[inset_0_1px_0_rgba(186,230,253,0.08)]">
//       <h2 className="text-xl font-semibold text-sky-100">大盘数据</h2>
//     </section>
//   );
// }

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import StatCard from "../components/StatCard";
import { dashBtnVariants, cn, chartCardVariants } from "../components/ui/dashboard-variants";

// 模拟指标数据，和截图完全对齐
const statData = [
  {
    value: "1,284",
    label: "本周探测目标",
    compareText: "12% 环比",
    compareType: "up" as const,
    valueColor: "white" as const,
    highlight: "default" as const,
  },
  {
    value: "23",
    label: "威胁事件",
    compareText: "3 起",
    compareType: "up" as const,
    valueColor: "red" as const,
    highlight: "red" as const,
  },
  {
    value: "91",
    suffix: "%",
    label: "处置成功率",
    compareText: "2%",
    compareType: "up" as const,
    valueColor: "green" as const,
    highlight: "green" as const,
  },
  {
    value: "48",
    suffix: "s",
    label: "平均处置时长",
    compareText: "7s",
    compareType: "down" as const,
    valueColor: "white" as const,
    highlight: "default" as const,
  },
];

// 时间筛选下拉选项
const timeOptions = ["今日", "本周", "本月", "本年度"];

// 图表模拟数据
// 1.每日探测目标趋势
const trend7Data = [
  { day: "周一", count: 120 },
  { day: "周二", count: 168 },
  { day: "周三", count: 140 },
  { day: "周四", count: 195 },
  { day: "周五", count: 210 },
  { day: "周六", count: 182 },
  { day: "周日", count: 279 },
];

// 2.威胁等级分布 饼图
const threatPieData = [
  { name: "警报", value: 23, color: "#ef4444" },
  { name: "预警", value: 58, color: "#eab308" },
  { name: "注意", value: 120, color: "#22c55e" },
  { name: "非威胁", value: 340, color: "#3b82f6" },
];

// 3.处置结果横向柱状
const handleResultData = [
  { name: "已驱离(最高偏黄)", value: 42, color: "#3b82f6" },
  { name: "物理捕获(网捕)", value: 31, color: "#22c55e" },
  { name: "飞手查获·移交公安", value: 12, color: "#a855f7" },
  { name: "仅告警监视", value: 10, color: "#eab308" },
  { name: "逃逸/未达效果", value: 5, color: "#ef4444" },
];

// 4.入侵来源方位雷达图
const radarData = [
  { dir: "北", val: 10 },
  { dir: "东北", val: 30 },
  { dir: "东", val: 40 },
  { dir: "东南", val: 80 },
  { dir: "南", val: 50 },
  { dir: "西南", val: 20 },
  { dir: "西", val: 15 },
  { dir: "西北", val: 25 },
];

// 5.机型出现TOP5
const droneTopData = [
  { name: "大疆 Mavic", val: 312 },
  { name: "大疆 Air", val: 208 },
  { name: "穿越机", val: 158 },
  { name: "中型航(岛/气球)", val: 98 },
  { name: "六旋翼", val: 64 },
];

// 6.目标身份分布横向条
const identityData = [
  { name: "确认威胁", val: 18, color: "#ef4444" },
  { name: "未知待研判", val: 28, color: "#eab308" },
  { name: "固定翼", val: 39, color: "#22c55e" },
  { name: "己方报备", val: 15, color: "#3b82f6" },
];

// 7.飞行高度分层
const heightData = [
  { name: "超低空<50m", val: 22, color: "#ef4444" },
  { name: "低空 50-120m", val: 48, color: "#eab308" },
  { name: "中空 120-300m", val: 24, color: "#3b82f6" },
  { name: ">300m", val: 6, color: "#64748b" },
];

// 底部飞手战果指标
const arrestStat = [
  { value: "78%", label: "飞手查获战果(断源·抓现行)", compareType: "none" as const, valueColor: "green" as const },
  { value: "5", label: "移交公安(起)", compareType: "none" as const, valueColor: "white" as const },
  { value: "4.2min", label: "平均定位耗时", compareType: "none" as const, valueColor: "white" as const },
];

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState("本周");

  return (
    <div className="min-h-screen text-slate-100">
      {/* 页面顶部标题操作栏 */}
      <div className="flex items-center justify-between bg-[#0b2d5d] p-3">
        <h2 className="text-2xl font-semibold text-slate-50">数据分析看板</h2>
        <div className="flex gap-4 items-center">
          {/* 时间下拉 带自定义箭头 */}
          <div className="relative inline-block">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={cn(dashBtnVariants({ mode: "dark" }), "appearance-none pr-8 cursor-pointer")}
            >
              {timeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
              ▾
            </span>
          </div>
          <button className={dashBtnVariants({ mode: "dark" })}>导出报表</button>
          <button className={dashBtnVariants({ mode: "primary" })}>自定义报表</button>
        </div>
      </div>
      <div className="min-h-screen text-slate-100 p-4">
        {/* 核心指标卡片 四栏网格布局 */}
        <div className="grid grid-cols-4 gap-6">
          {statData.map((item, idx) => (
            <StatCard key={idx} {...item} />
          ))}
        </div>
        {/* =========下方图表区域预留位置========= */}
        {/* 第二行：折线图 + 环形饼图 */}
        <div className="mt-5 grid grid-cols-2 gap-4 mb-6">
          {/* 左：每日探测趋势 */}
          <div className={cn(chartCardVariants(), "animate-fadeIn delay-500")}>
            <h3 className="text-sm text-slate-300 mb-3">每日探测目标趋势（近 7 天）</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend7Data}>
                <CartesianGrid stroke="#333a54" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2e", borderColor: "#475569" }} />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={{ fill: "#38bdf8", r:4 }} animationDuration={1400} animationEasing="ease-out"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* 右：威胁等级环形饼图 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-3">威胁等级分布</h3>
            <div className="flex items-center justify-between h-[300px]">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={threatPieData} innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                    {threatPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1a1d2e", borderColor: "#475569" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-sm space-y-2 pr-2">
                {threatPieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{backgroundColor: item.color}}></span>
                    <span className="text-slate-300">{item.name} {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 第三行：处置结果横向柱状 + 入侵方位雷达 */}
        <div className="mt-5 grid grid-cols-2 gap-4 mb-6">
          {/* 左：处置结果构成 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-3">处置结果构成（闭环结果分布）</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={handleResultData}>
                <CartesianGrid stroke="#333a54" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={140} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2e", borderColor: "#475569" }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {handleResultData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-2">体系下开采/驱赶出/抓飞手的实际闭环结果，逃逸/未达效果需复查</p>
          </div>
          {/* 右：入侵来源方位雷达 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-3">入侵来源方位分布（8 方位）</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#333a54" />
                <PolarAngleAxis dataKey="dir" stroke="#94a3b8" fontSize={12} />
                <Radar dataKey="val" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2e", borderColor: "#475569" }} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-2">东南方向最高频发 → 指导布防加密布控</p>
          </div>
        </div>

        {/* 第四行：三列布局 机型TOP5 / 身份+高度双柱状 / 底部飞手战果 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 左：机型出现排行TOP5 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-3">机型出现排行 TOP5</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={droneTopData}>
                <CartesianGrid stroke="#333a54" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2e", borderColor: "#475569" }} />
                <Bar dataKey="val" fill="#38bdf8" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* 中：24h热力 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-2">⏰ 24h时段热力（颜色越深越高发）</h3>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({length:24}).map((_,i)=>{
                // 18-20点最深红色高发
                let bg = "bg-red-950/40";
                if(i>=18 && i<=20) bg = "bg-red-600/80";
                else if(i>=16 && i<=22) bg = "bg-red-700/60";
                else if(i>=10 && i<=15) bg = "bg-red-800/45";
                return <div key={i} className={`h-6 rounded-sm ${bg}`} title={`${i}时`}></div>
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">高发时段：傍晚 18–20 时</p>
          </div>
          {/* 右：目标身份与飞行高度 */}
          <div className={chartCardVariants()}>
            <h3 className="text-sm text-slate-300 mb-3">目标身份与飞行高度构成</h3>
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">目标身份构成</p>
              {identityData.map((item,i)=>(
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-2 rounded-sm" style={{backgroundColor:item.color}}></span>
                  <span className="text-xs text-slate-300 w-20">{item.name}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${item.val}%`,backgroundColor:item.color}}></div>
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{item.val}%</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">飞行高度分层（低空/超低空特征）</p>
              {heightData.map((item,i)=>(
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-2 rounded-sm" style={{backgroundColor:item.color}}></span>
                  <span className="text-xs text-slate-300 w-20">{item.name}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${item.val}%`,backgroundColor:item.color}}></div>
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
