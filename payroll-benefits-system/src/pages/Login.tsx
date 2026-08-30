import { useState } from 'react';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth.service';
import { ApiError } from '../services/apiClient';
import logo from '../assets/archon-nell-logo.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-navy-900 px-12 py-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img src={logo} alt="Archon Nell Incorporated" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold">Archon Nell Incorporated</p>
            <p className="text-xs text-navy-100/60">Payroll &amp; Benefits Management</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Manage payroll and
            <br />
            benefits, all in one place.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-navy-100/70">
            Compute payroll, track claims and reimbursements, administer HMO benefits, and keep
            employee records — for your whole team, in a single system.
          </p>
        </div>

        <p className="text-xs text-navy-100/40">© {new Date().getFullYear()} Archon Nell Incorporated. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-sand-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <img src={logo} alt="Archon Nell Incorporated" className="h-12 w-12 object-contain" />
            </div>
            <p className="text-sm font-bold text-ink-900">Archon Nell Incorporated</p>
          </div>

          <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-900">
                Email <span className="text-clay-600">*</span>
              </span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-teal-500"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 flex items-center justify-between font-medium text-ink-900">
                Password <span className="text-clay-600">*</span>
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2.5 pr-10 text-sm text-ink-900 outline-none transition focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && (
              <p className="rounded-lg bg-bad-100 px-3 py-2 text-sm text-bad-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
    </div>
  );
}
