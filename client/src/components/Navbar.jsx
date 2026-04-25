import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './Button.jsx';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
  { label: 'History', to: '/history' },
  { label: 'Architecture', to: '/architecture' },
];

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

        <div className="flex flex-wrap items-center gap-3">
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

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                  {initials || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-2xl shadow-slate-950/40">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="mt-3 w-full justify-start"
                    onClick={async () => {
                      await logout();
                      toast.success('Logged out successfully');
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button as={Link} to="/login" variant="secondary">Login</Button>
              <Button as={Link} to="/register">Register</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
