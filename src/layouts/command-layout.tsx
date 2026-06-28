import {
  Activity,
  LayoutDashboard,
  Radar,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/realtime", label: "区域监控", icon: Radar },
  { to: "/dashboard", label: "大盘数据", icon: LayoutDashboard },
  { to: "/dataBoard", label: "驾驶舱", icon: LayoutDashboard },
];

export function CommandLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#041126] text-blue-50">
      <header className="flex h-16 items-center justify-between border-b border-cyan-200/10 bg-[#071b38]/95 px-6 shadow-[0_18px_42px_rgba(1,13,35,0.38)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-200/30 bg-cyan-200/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-100/45">
              Beihang Airspace Security
            </p>
            <h1 className="text-lg font-semibold tracking-wide text-amber-200">
              低空方案智能决策平台
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100/80 sm:flex">
            <Activity className="h-3.5 w-3.5" />
            系统在线
          </span>
          <span className="rounded-md border border-cyan-200/15 bg-[#0d376b]/45 px-3 py-1 text-cyan-100/65">
            指挥官席位
          </span>
          <div className="flex items-center gap-2 text-blue-100/65">
            <UserCircle className="h-5 w-5 text-cyan-100/60" />
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
        <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_32%),linear-gradient(135deg,#061833_0%,#071326_54%,#041126_100%)] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
