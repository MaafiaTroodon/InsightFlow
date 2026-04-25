import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
  { label: 'History', to: '/history' },
  { label: 'Architecture', to: '/architecture' },
];

export function Layout({ children }) {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600/20 shadow-glow ring-1 ring-teal-400/20">
              <span className="text-lg font-extrabold text-teal-300">IF</span>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">InsightFlow</p>
              <p className="text-xs text-slate-400">Business data analysis demo</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="grid-pattern">{children}</main>
    </div>
  );
}
