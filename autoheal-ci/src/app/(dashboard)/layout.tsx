'use client';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';
import { RepoProvider } from '@/lib/RepoContext';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // While checking session, show a full-screen loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-graphite flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-electric flex items-center justify-center shadow-lg shadow-violet/20 animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-mono text-text-muted">Loading AutoHeal CI…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — don't render anything while redirect fires
  if (!isAuthenticated) return null;

  return (
    <RepoProvider>
      <div className="min-h-screen bg-graphite">
        {/* Subtle ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet/[0.015] blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-electric/[0.01] blur-[150px]" />
        </div>
        <TopBar />
        <main className="relative z-10 px-6 py-6 pb-28 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
          >
            {children}
          </motion.div>
        </main>
        <BottomNav />
      </div>
    </RepoProvider>
  );
}

