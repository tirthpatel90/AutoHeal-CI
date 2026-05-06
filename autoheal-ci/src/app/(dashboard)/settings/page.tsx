'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GlowCard from '@/components/ui/GlowCard';
import {
  Settings as SettingsIcon, Github, Bell, Shield, Cpu, Save, Check,
  User, Mail, KeyRound, Trash2, LogOut, AlertTriangle, Link2, Copy, Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const container = { initial: {}, animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    github: { label: 'GitHub', color: 'bg-white/10 text-white border-white/15', icon: <Github className="w-3 h-3" /> },
    google: { label: 'Google', color: 'bg-electric/10 text-electric border-electric/20', icon: <GoogleIcon /> },
    email: { label: 'Email', color: 'bg-violet/10 text-violet border-violet/20', icon: <Mail className="w-3 h-3" /> },
  };
  const cfg = map[provider] ?? { label: provider, color: 'bg-white/10 text-white border-white/15', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function AvatarInitials({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`${size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-sm'} rounded-full bg-gradient-to-br from-violet to-electric flex items-center justify-center font-bold text-white shadow-lg shadow-violet/20 flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateProfile, deleteAccount, isAuthenticated } = useAuth();

  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleSaveProfile = () => {
    if (!displayName.trim()) return;
    setSavingProfile(true);
    updateProfile({ name: displayName.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSavingProfile(false);
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = () => {
    setLoggingOut(true);
    logout();
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    router.push('/login');
  };

  return (
    <motion.div variants={container} initial="initial" animate="animate" className="space-y-6 max-w-3xl">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account and AutoHeal CI configuration</p>
      </motion.div>

      {/* ── Account & Identity ─────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="violet" hover={false}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-graphite-lighter/50 flex items-center justify-center">
              <User className="w-4 h-4 text-violet" />
            </div>
            <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Account &amp; Identity</h3>
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-5">
              {/* Profile card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-violet/5 border border-violet/10">
                <AvatarInitials name={user.name} size="lg" />
                <div className="min-w-0">
                  <p className="text-base font-bold text-text-primary truncate">{user.name}</p>
                  <p className="text-sm text-text-secondary font-mono truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.connected_providers.map(p => <ProviderBadge key={p} provider={p} />)}
                  </div>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Display name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="flex-1 bg-graphite/60 border border-graphite-border/40 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.05)] transition-all duration-200"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !displayName.trim() || displayName === user.name}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet to-electric text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>

              {/* Account ID */}
              <div>
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Account ID</label>
                <div className="flex items-center gap-2 p-3 bg-graphite/60 border border-graphite-border/30 rounded-xl">
                  <KeyRound className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="flex-1 text-xs font-mono text-text-secondary truncate">{user.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary transition-colors"
                  >
                    {copiedId ? <><Check className="w-3 h-3 text-neon-green" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Joined date */}
              <div>
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Member since</label>
                <p className="text-sm text-text-primary font-mono">
                  {new Date(user.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Connected providers */}
              <div>
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-2">Connected accounts</label>
                <div className="space-y-2">
                  {(['email', 'github', 'google'] as const).map((p) => {
                    const linked = user.connected_providers.includes(p);
                    return (
                      <div key={p} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${linked ? 'bg-violet/5 border-violet/15' : 'bg-graphite/30 border-graphite-border/30'}`}>
                        <div className="flex items-center gap-2.5">
                          {p === 'github' ? <Github className="w-4 h-4" /> : p === 'google' ? <GoogleIcon /> : <Mail className="w-4 h-4 text-text-muted" />}
                          <span className="text-sm text-text-primary capitalize">{p}</span>
                        </div>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${linked ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-graphite-border/30 text-text-muted border border-graphite-border/20'}`}>
                          {linked ? 'Connected' : 'Not linked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sign out */}
              <div className="pt-2 border-t border-graphite-border/20">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-graphite-border/40 hover:border-red-500/30 hover:bg-red-500/5 text-text-secondary hover:text-red-400 text-sm font-medium transition-all duration-200"
                >
                  {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Sign out of all devices
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted mb-3">You are not signed in.</p>
              <a href="/login" className="text-violet hover:underline text-sm font-semibold">Sign in →</a>
            </div>
          )}
        </GlowCard>
      </motion.div>

      {/* ── GitHub Integration ─────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="violet" hover={false}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-graphite-lighter/50 flex items-center justify-center"><Github className="w-4 h-4 text-text-primary" /></div>
            <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">GitHub Integration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">GitHub Personal Access Token</label>
              <input type="password" defaultValue="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full bg-graphite/60 border border-graphite-border/40 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-violet/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.05)] transition-all duration-200 font-mono" />
              <p className="text-[11px] text-text-muted mt-1.5">Required for repository access. Needs repo and webhook scopes.</p>
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Webhook URL</label>
              <input type="text" defaultValue="https://autoheal.ci/webhook/github" className="w-full bg-graphite/60 border border-graphite-border/40 rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono opacity-60 cursor-not-allowed" readOnly />
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* ── Notifications ──────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="amber" hover={false}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-graphite-lighter/50 flex items-center justify-center"><Bell className="w-4 h-4 text-amber" /></div>
            <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Notifications</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Pipeline failures', desc: 'Get notified when a pipeline fails', on: true },
              { label: 'Auto-fix applied', desc: 'Notification when an automatic fix is applied', on: true },
              { label: 'High failure prediction', desc: 'Alert when prediction exceeds threshold', on: true },
              { label: 'Learning milestones', desc: 'When the system learns new error patterns', on: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-graphite/30 border border-graphite-border/30 hover:border-graphite-border/50 transition-all duration-200 cursor-pointer group">
                <div><p className="text-sm text-text-primary group-hover:text-white transition-colors">{item.label}</p><p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p></div>
                <input type="checkbox" defaultChecked={item.on} className="toggle-switch" />
              </label>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* ── AI Configuration ───────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="violet" hover={false}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-graphite-lighter/50 flex items-center justify-center"><Cpu className="w-4 h-4 text-violet" /></div>
            <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">AI Configuration</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-2">Failure Prediction Threshold</label>
              <div className="flex items-center gap-3"><input type="range" min="0" max="100" defaultValue="70" className="flex-1" /><span className="text-sm font-mono text-violet w-12 text-right">70%</span></div>
              <p className="text-[11px] text-text-muted mt-1.5">Auto-fix will trigger when failure probability exceeds this threshold.</p>
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Auto-Fix Mode</label>
              <select className="w-full bg-graphite/60 border border-graphite-border/40 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.05)] transition-all duration-200 font-mono">
                <option value="auto">Automatic — Apply fixes without approval</option>
                <option value="suggest">Suggest — Propose fixes for manual review</option>
                <option value="disabled">Disabled — Only predict, no fixes</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider block mb-1.5">Max Fix Retries</label>
              <input type="number" defaultValue={3} min={1} max={10} className="w-full bg-graphite/60 border border-graphite-border/40 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-violet/30 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.05)] transition-all duration-200 font-mono" />
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* ── Security ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="crimson" hover={false}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-graphite-lighter/50 flex items-center justify-center"><Shield className="w-4 h-4 text-crimson" /></div>
            <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Security</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Require approval for destructive fixes', desc: 'Fixes that delete files or modify production configs', on: true },
              { label: 'Audit log all AI decisions', desc: 'Record every prediction and fix for compliance review', on: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-graphite/30 border border-graphite-border/30 hover:border-graphite-border/50 transition-all duration-200 cursor-pointer group">
                <div><p className="text-sm text-text-primary group-hover:text-white transition-colors">{item.label}</p><p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p></div>
                <input type="checkbox" defaultChecked={item.on} className="toggle-switch" />
              </label>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* ── Danger Zone ────────────────────────────────────────── */}
      {isAuthenticated && (
        <motion.div variants={fadeUp}>
          <GlowCard glowColor="crimson" hover={false}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-crimson/10 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-crimson" /></div>
              <h3 className="text-[11px] font-mono text-crimson uppercase tracking-wider">Danger Zone</h3>
            </div>
            <div className="p-4 rounded-xl border border-crimson/20 bg-crimson/5">
              <p className="text-sm font-semibold text-text-primary mb-1">Delete account</p>
              <p className="text-xs text-text-muted mb-4">This will permanently delete your account and all associated data. This action cannot be undone.</p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-crimson/10 hover:bg-crimson/20 border border-crimson/30 text-crimson rounded-xl text-sm font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete my account
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-crimson hover:bg-crimson/90 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Yes, delete permanently
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </GlowCard>
        </motion.div>
      )}

      {/* Save button */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 pb-8">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet to-electric hover:shadow-lg hover:shadow-violet/20 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5">
          <Save className="w-4 h-4" /> Save Settings
        </button>
        {saved && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-neon-green font-mono">
            <Check className="w-4 h-4" /> Settings saved
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
