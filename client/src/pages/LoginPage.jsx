import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(form);
      toast.success('Welcome back');
      navigate(location.state?.from || '/upload', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      toast.error(submitError.message === 'Invalid email or password.' ? 'Invalid email or password' : submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
      <Card className="w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Login</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to access your private upload history and dashboards.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-400/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-400/50"
              placeholder="Enter your password"
            />
          </div>
          {error ? <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-teal-300 hover:text-teal-200">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
