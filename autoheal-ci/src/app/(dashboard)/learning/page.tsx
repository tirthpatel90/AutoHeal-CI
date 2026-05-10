'use client';
import { motion } from 'framer-motion';
import GlowCard from '@/components/ui/GlowCard';
import { useRepo } from '@/lib/RepoContext';
import { GraduationCap, Brain, Target, Sparkles, ArrowRight, GitBranch, Plus, Database } from 'lucide-react';

const container = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function LearningPage() {
  const { selectedRepo, connectedRepos } = useRepo();

  return (
    <motion.div variants={container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Learning Engine</h1>
        <p className="text-sm text-text-secondary mt-1">Self-improving AI that learns from every pipeline run</p>
      </motion.div>

      {/* Stats - will populate over time */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Repos Analyzed', value: connectedRepos.length, icon: Database, color: '#8b5cf6', accentBorder: 'border-l-violet' },
          { label: 'Patterns Detected', value: 0, icon: Target, color: '#34d399', accentBorder: 'border-l-neon-green' },
          { label: 'Predictions Made', value: 0, icon: Brain, color: '#f59e0b', accentBorder: 'border-l-amber' },
          { label: 'Fixes Suggested', value: 0, icon: Sparkles, color: '#3b82f6', accentBorder: 'border-l-electric' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={fadeUp} className={`bg-graphite-light/80 border border-graphite-border/40 border-l-2 ${card.accentBorder} rounded-2xl p-5 hover:bg-graphite-hover/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 group`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-graphite-lighter/50 flex items-center justify-center transition-colors group-hover:bg-graphite-lighter">
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-[11px] text-text-muted font-mono uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state - learning will populate */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="violet" hover={false}>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-violet/8 border border-violet/15 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-violet" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Learning Engine Initializing</h3>
            <p className="text-sm text-text-muted text-center max-w-md mb-6">
              The learning engine will build its knowledge base as you analyze more repositories and run predictions.
              Each analysis contributes to improving future predictions.
            </p>
            {!selectedRepo ? (
              <a href="/repositories" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-electric text-white font-semibold text-sm">
                <Plus className="w-4 h-4" /> Connect a Repository to Start Learning
              </a>
            ) : (
              <a href="/predictions" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-electric text-white font-semibold text-sm">
                <Brain className="w-4 h-4" /> Run AI Prediction
              </a>
            )}
          </div>
        </GlowCard>
      </motion.div>

      {/* Self-learning loop visualization */}
      <motion.div variants={fadeUp}>
        <GlowCard glowColor="violet" hover={false}>
          <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-6">Self-Learning Feedback Loop</h3>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['Commit Pushed', 'AI Analyzes', 'Pipeline Runs', 'Result Collected', 'Knowledge Updated', 'Model Improves'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 20 }} className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-violet/8 border border-violet/15 text-sm text-violet font-mono whitespace-nowrap hover:bg-violet/12 hover:border-violet/25 transition-all duration-200 cursor-default">{step}</div>
                  {i < 5 && <ArrowRight className="w-4 h-4 text-text-muted/40" />}
                </motion.div>
              ))}
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
