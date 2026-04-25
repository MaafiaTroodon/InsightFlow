import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
  { label: 'History', to: '/history' },
  { label: 'Architecture', to: '/architecture' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600/20 ring-1 ring-teal-400/20">
            <span className="text-sm font-extrabold text-teal-300">IF</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-tight text-white">InsightFlow</p>
            <p className="truncate text-xs text-slate-400">Portfolio analytics demo</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
