import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useApiResource } from '../../hooks/useApiResource';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { essTwoFactorService } from '../../services/essTwoFactor.service';
import { ApiError } from '../../services/apiClient';

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

/**
 * Step-up 2FA gate for the Employee Self-Service area. Wraps each /ess/*
 * route in App.tsx — the main Admin/HR pages never go through this.
 * A code is emailed to the signed-in account; verifying it flags the
 * current session's token server-side (see EssTwoFactorController), so a
 * page refresh doesn't ask again, but a fresh login does.
 */
export function EssTwoFactorGate({ children }: { children: ReactNode }) {
  const { data: status, loading, refetch } = useApiResource(() => essTwoFactorService.status(), []);

  if (loading || !status) {
    return (
      <div className="flex h-screen items-center justify-center bg-sand-50">
        <Loader2 className="animate-spin text-ink-300" size={28} />
      </div>
    );
  }

  if (status.verified) {
    return <>{children}</>;
  }

  return <EssTwoFactorChallenge onVerified={refetch} />;
}

function EssTwoFactorChallenge({ onVerified }: { onVerified: () => void }) {
  const { data: user } = useCurrentUser();
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendCode() {
    setSending(true);
    setError(null);
    try {
      const res = await essTwoFactorService.send();
      setNotice(res.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a verification code. Try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      await essTwoFactorService.verify(code);
      onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <ShieldCheck size={22} />
        </div>
        <h1 className="text-xl font-bold text-ink-900">Verify it's you</h1>
        <p className="mt-1 text-sm text-ink-500">
          Employee Self-Service holds personal payroll and benefits data, so it needs a second
          check. We emailed a {CODE_LENGTH}-digit code to{' '}
          <span className="font-medium text-ink-900">{user?.email ?? 'your account email'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-900">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-lg border border-line bg-sand-50 px-3 py-2.5 text-center text-lg tracking-[0.5em] text-ink-900 outline-none transition focus:border-teal-500"
            />
          </label>

          {notice && !error && <p className="text-sm text-ink-500">{notice}</p>}
          {error && <p className="rounded-lg bg-bad-100 px-3 py-2 text-sm text-bad-600">{error}</p>}

          <button
            type="submit"
            disabled={verifying || code.length !== CODE_LENGTH}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {verifying ? 'Verifying…' : 'Verify & continue'}
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={sending || cooldown > 0}
            className="w-full text-center text-sm font-semibold text-teal-700 transition hover:underline disabled:text-ink-300 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : sending ? 'Sending…' : 'Resend code'}
          </button>
        </form>
      </div>
    </div>
  );
}
