import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const userNavItems = [
  { path: "/", label: "Dashboard" },
  { path: "/history", label: "History" },
  { path: "/profile", label: "Profile" },
];

const adminNavItems = [{ path: "/admin", label: "Admin Dashboard" }];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page-shell text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-300 to-orange-400 text-slate-900 font-semibold shadow-lg shadow-sky-500/30">
              TC
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.25em] text-slate-500">
                Train Control
              </p>
              <p className="text-lg font-semibold text-white md:text-xl">
                Live Console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-100 hover:bg-white/10"
            >
              <div className="flex h-5 w-6 flex-col justify-between">
                <span className="h-[2px] w-full bg-current" />
                <span className="h-[2px] w-full bg-current" />
                <span className="h-[2px] w-full bg-current" />
              </div>
            </button>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-900 shadow-lg shadow-sky-400/30"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
            >
              Logout {user ? `(${user.username})` : ""}
            </button>
          </nav>
        </div>
        {menuOpen && (
          <div className="md:hidden">
            <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-2xl shadow-sky-900/40">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-900"
                        : "text-slate-100 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Logout {user ? `(${user.username})` : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
