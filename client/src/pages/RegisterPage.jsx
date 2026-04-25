import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await register(form);
      toast.success('Account created successfully');
      navigate('/upload', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      toast.error(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
      <Card className="w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Register</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">Your datasets, history, and dashboards will remain isolated to your account.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-teal-400/50"
              placeholder="Jane Doe"
            />
          </div>
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
              placeholder="At least 6 characters"
            />
          </div>
          {error ? <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-300 hover:text-teal-200">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
