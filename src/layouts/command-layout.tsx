import { LayoutDashboard, Radar, ShieldCheck, UserCircle } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/realtime", label: "实时态势", icon: Radar },
  { to: "/dashboard", label: "大盘数据", icon: LayoutDashboard },
];

export function CommandLayout() {
  return (
    <div className="min-h-screen bg-[#06162f] text-blue-50">
      <header className="flex h-16 items-center justify-between border-b border-sky-300/20 bg-[#08244a] px-6 shadow-[0_8px_30px_rgba(1,13,35,0.28)]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-300/40 bg-sky-300/10 text-sky-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-amber-300">
            低空方案智能决策平台
          </h1>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="rounded-md border border-sky-300/15 bg-[#0d376b]/45 px-3 py-1 text-sky-100/65">
            指挥官
          </span>
          <div className="flex items-center gap-2 text-blue-100/65">
            <UserCircle className="h-5 w-5 text-sky-200/60" />
            <span>用户1</span>
          </div>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-36 border-r border-sky-300/15 bg-[#0b2d5d] px-3 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sky-300/15 text-sky-100 shadow-inner shadow-sky-200/10"
                        : "text-blue-200/70 hover:bg-[#123d79] hover:text-blue-50",
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
        <main className="flex-1 bg-[#061a38]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
