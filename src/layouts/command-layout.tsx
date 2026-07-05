import { Activity, LayoutDashboard, Radar, UserCircle } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/realtime", label: "区域监控", icon: Radar },
  { to: "/dataBoard", label: "驾驶舱", icon: LayoutDashboard },
];

function PlatformLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="platform-logo-core"
          x1="14"
          y1="12"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B7F7CF" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient
          id="platform-logo-wing"
          x1="18"
          y1="20"
          x2="46"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DCFCE7" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <path
        d="M32 6L51 14V29C51 41.7 43.06 53.08 32 58C20.94 53.08 13 41.7 13 29V14L32 6Z"
        fill="url(#platform-logo-core)"
        fillOpacity="0.18"
        stroke="#BBF7D0"
        strokeWidth="2.4"
      />
      <path d="M20 24H44" stroke="#86EFAC" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      <path d="M24 19.5H40" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M24 28.5H40" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path
        d="M32 17L38.2 28.6L32 26.6L25.8 28.6L32 17Z"
        fill="url(#platform-logo-wing)"
        stroke="#4ADE80"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M32 27V44" stroke="#4ADE80" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M25 38L32 44L39 38"
        stroke="#4ADE80"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="44" r="3.2" fill="#DCFCE7" />
      <path
        d="M18 35C22.2 31.4 27.08 29.6 32 29.6C36.92 29.6 41.8 31.4 46 35"
        stroke="#6EE7B7"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M21.5 39.5C24.84 36.82 28.4 35.5 32 35.5C35.6 35.5 39.16 36.82 42.5 39.5"
        stroke="#6EE7B7"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function CommandLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#041126] text-blue-50">
      <header className="flex h-16 items-center justify-between border-b border-cyan-200/10 bg-[#071b38]/95 px-6 shadow-[0_18px_42px_rgba(1,13,35,0.38)]">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center ">
            <PlatformLogo />
          </div>
          <div className="">
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/55">
              Beihang Airspace Security
            </p>
            <div className="my-0.5 h-px w-full bg-[linear-gradient(90deg,rgba(110,231,183,0.1)_0,rgba(110,231,183,0.6)_50%,rgba(110,231,183,0.1)_100%)]" />
            <h1 className="bg-[linear-gradient(90deg,#ECFDF5_0%,#86EFAC_55%,#4ADE80_100%)] bg-clip-text text-lg font-semibold tracking-[0.08em] text-transparent">
              低空方案智能决策平台
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden items-center gap-2 rounded-full border border-green-300/30 bg-green-300/20 px-3 py-1 text-green-300 sm:flex">
            <Activity className="h-3.5 w-3.5" />
            系统在线
          </span>
          <span className="hidden items-center gap-2 rounded-full border border-green-300/30 bg-green-300/20 px-3 py-1 text-green-300 sm:flex">
            指挥官席位
          </span>
          <div className="hidden items-center gap-2 rounded-full border border-green-300/30 bg-green-300/20 px-3 py-1 text-green-300 sm:flex">
            <UserCircle className="h-3.5 w-3.5 text-green-500" />
            <span>用户1</span>
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-40 border-r border-cyan-200/10 bg-[#081f42] px-3 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "command-nav-link flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-cyan-200/14 text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                        : "text-blue-200/65 hover:bg-[#123d79] hover:text-blue-50",
                    ].join(" ")
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_32%),linear-gradient(135deg,#061833_0%,#071326_54%,#041126_100%)] p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
