import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { authService } from '../services/auth.service';
import { ApiError } from '../services/apiClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token } = await authService.login(email, password);
      authService.saveToken(token);
      window.location.href = '/';
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError('Incorrect email or password.');
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-clay-500 text-lg font-bold text-white">
            PB
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-ink-900">Payroll &amp; Benefits</h1>
            <p className="text-sm text-ink-500">Sign in to your account</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-navy-100 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-900">Email</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-teal-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-900">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-teal-500"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-bad-100 px-3 py-2 text-sm text-bad-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50"
          >
            <LockKeyhole size={16} />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-300">
          No account yet? Ask your administrator to create one via the backend.
        </p>
      </div>
    </div>
  );
}