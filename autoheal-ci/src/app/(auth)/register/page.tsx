'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Github, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;
  const bar = ['bg-crimson', 'bg-amber', 'bg-neon-green'][score - 1] ?? 'bg-white/10';
  const label = ['Weak', 'Fair', 'Strong'][score - 1] ?? '';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1 flex-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i < score ? bar : 'bg-white/10'}`} />
        ))}
      </div>
      <span className="text-[11px] font-mono text-text-muted">{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginOAuth, isAuthenticated, isLoading: authLoading, clearError } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace('/overview');
  }, [isAuthenticated, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    if (!name.trim() || !email || !password || !confirm) { setError('Please fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSubmitting(true);
    try {
      await register(name.trim(), email, password);
      router.replace('/overview');
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    } finally { setSubmitting(false); }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null);
    setOauthLoading(provider);
    try {
      await loginOAuth(provider);
      router.replace('/overview');
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed');
    } finally { setOauthLoading(null); }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="h-screen bg-graphite flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-violet animate-spin" />
      </div>
    );
  }

  const busy = submitting || !!oauthLoading;

  return (
    <div className="min-h-screen bg-graphite flex flex-col items-center justify-center px-4 py-8">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet/[0.04] blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[360px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet to-electric flex items-center justify-center shadow-lg shadow-violet/20 mb-5">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Create your account</h1>
          <p className="text-[13px] text-text-muted mt-1">Free during beta · No credit card required</p>
        </div>

        {/* Card */}
        <div className="bg-graphite-light border border-graphite-border/60 rounded-2xl p-6 shadow-xl shadow-black/30">

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2.5 px-3.5 py-3 bg-crimson/8 border border-crimson/20 rounded-xl mb-4 text-sm text-crimson"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* OAuth */}
          <div className="space-y-2.5">
            <motion.button
              id="btn-github-reg"
              onClick={() => handleOAuth('github')}
              disabled={busy}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.09] hover:bg-white/[0.07] hover:border-white/[0.14] rounded-xl text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              Continue with GitHub
            </motion.button>

            <motion.button
              id="btn-google-reg"
              onClick={() => handleOAuth('google')}
              disabled={busy}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.09] hover:bg-white/[0.07] hover:border-white/[0.14] rounded-xl text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.07]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-graphite-light text-[11px] text-text-muted font-mono uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label htmlFor="reg-name" className="block text-[13px] font-medium text-text-secondary mb-1.5">Full name</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tirth Patel"
                className="w-full px-3.5 py-2.5 bg-graphite border border-graphite-border/80 hover:border-graphite-border focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] rounded-xl text-sm text-white placeholder:text-text-muted/50 outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[13px] font-medium text-text-secondary mb-1.5">Email address</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 bg-graphite border border-graphite-border/80 hover:border-graphite-border focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] rounded-xl text-sm text-white placeholder:text-text-muted/50 outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-graphite border border-graphite-border/80 hover:border-graphite-border focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] rounded-xl text-sm text-white placeholder:text-text-muted/50 outline-none transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-0.5">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-[13px] font-medium text-text-secondary mb-1.5">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full px-3.5 py-2.5 bg-graphite border rounded-xl text-sm text-white placeholder:text-text-muted/50 outline-none transition-all duration-200 ${
                  confirm && confirm !== password
                    ? 'border-crimson/40 focus:border-crimson/60'
                    : 'border-graphite-border/80 hover:border-graphite-border focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]'
                }`}
              />
            </div>

            <motion.button
              id="btn-register"
              type="submit"
              disabled={busy}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 bg-violet hover:bg-violet/90 text-white font-medium rounded-xl text-sm transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>

          <p className="text-[11px] text-text-muted text-center mt-4 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-text-secondary hover:text-white cursor-pointer transition-colors">Terms</span>
            {' '}and{' '}
            <span className="text-text-secondary hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>

        <p className="text-center text-[13px] text-text-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-text-secondary hover:text-white transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
