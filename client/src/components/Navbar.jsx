import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600/20 ring-1 ring-teal-400/20">
              <span className="text-sm font-extrabold text-teal-300">IF</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-white">InsightFlow</p>
              <p className="truncate text-xs text-slate-400">Business analytics demo</p>
            </div>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <nav className="flex w-full flex-wrap items-center justify-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/5 p-1 sm:w-auto sm:justify-start">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4 ${
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
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-teal-400/20 hover:bg-white/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                    {initials || 'U'}
                  </div>
                  <div className="hidden min-w-0 xl:block">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="max-w-[10rem] truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                </button>

                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-2xl shadow-slate-950/40">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-3 w-full justify-start rounded-xl px-3 py-3 hover:bg-white/10"
                      onClick={async () => {
                        await logout();
                        toast.success('Logged out successfully');
                        setIsUserMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button as={Link} to="/login" variant="secondary">Login</Button>
                <Button as={Link} to="/register">Register</Button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-slate-200 transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? '×' : '☰'}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-slate-950/40 lg:hidden">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive ? 'bg-teal-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 border-t border-white/10 pt-3">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                        {initials || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      await logout();
                      toast.success('Logged out successfully');
                      navigate('/login');
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Button as={Link} to="/login" variant="secondary" className="w-full">Login</Button>
                  <Button as={Link} to="/register" className="w-full">Register</Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
