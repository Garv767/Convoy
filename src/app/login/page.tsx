'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Lock, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getCleanEmail = () => {
    const trimmed = email.trim().toLowerCase();
    return trimmed.includes('@') ? trimmed : `${trimmed}@srmist.edu.in`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const finalEmail = getCleanEmail();

    if (!finalEmail.endsWith('@srmist.edu.in')) {
      setError('Please use your official @srmist.edu.in email address.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: finalEmail,
          options: {
            shouldCreateUser: true,
          },
        });
        if (authError) throw authError;
      }

      setOtpSent(true);
      setMessage(`Code sent to ${finalEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const finalEmail = getCleanEmail();

    try {
      if (isSupabaseConfigured) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: finalEmail,
          token: token.trim(),
          type: 'email',
        });
        if (verifyError) throw verifyError;
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Return to Home link on top left */}
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Rides</span>
        </Link>
      </div>

      <div className="card w-full max-w-sm bg-surface border-border/80 shadow-xl p-6 sm:p-7">
        {/* Header with App Logo */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-accent to-accent2 p-0.5 mx-auto flex items-center justify-center shadow-md shadow-accent/20 mb-3">
            <svg viewBox="0 0 64 64" fill="none" className="w-7 h-7">
              <path
                d="M48 20.5C45.5 15.5 40 12 33 12C21.4 12 12 21.4 12 33C12 44.6 21.4 54 33 54C42 54 49 48 51.5 40"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path d="M25 25L41 33L25 41L29 33L25 25Z" fill="#FFFFFF" />
              <circle cx="48" cy="20.5" r="3.5" fill="#38BDF8" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Sign in to Convoy
          </h1>
          <p className="text-xs text-muted mt-1">
            SRM student ride sharing community
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red/10 border border-red/20 text-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green/10 border border-green/20 text-green text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                SRM NetID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ab1234 or ab1234@srmist.edu.in"
                  required
                  disabled={loading}
                  className="input-field w-full pl-9 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted mt-1.5">
                We'll email a one-time login code to your student inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending code...</span>
              ) : (
                <>
                  <span>Send Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                6-Digit Login Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={loading}
                  autoFocus
                  className="input-field w-full pl-9 text-center font-mono tracking-widest text-base font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setToken('');
              }}
              className="w-full text-center text-xs text-muted hover:text-text pt-1"
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border/60 text-center text-[11px] text-muted">
          <span>Restricted to @srmist.edu.in accounts</span>
        </div>
      </div>
    </div>
  );
}
