'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, GitCommit, Scan, Brain, Wrench, Rocket, Zap } from 'lucide-react';

const stages = [
  { label: 'Commit', icon: Zap, color: '#8b5cf6', glowColor: 'rgba(139, 92, 246, 0.3)' },
  { label: 'Analyze', icon: Scan, color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.3)' },
  { label: 'Predict', icon: Brain, color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.3)' },
  { label: 'Fix', icon: Wrench, color: '#34d399', glowColor: 'rgba(52, 211, 153, 0.3)' },
  { label: 'Deploy', icon: Rocket, color: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.3)' },
];

export default function HeroPipeline() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto py-20 px-4">
      {/* Perspective Wrapper */}
      <div className="relative" style={{ perspective: '1200px' }}>
        
        {/* Connection Segments Track (Underlay) */}
        <div className="absolute top-[32px] left-[10%] right-[10%] h-[32px] flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex-1 h-2 bg-white/5 rounded-full relative overflow-hidden"
              style={{
                clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)'
              }}
            >
              {/* Active Segment Fill */}
              <motion.div
                initial={{ width: '0%' }}
                animate={{ 
                  width: activeStage > i ? '100%' : activeStage === i ? '50%' : '0%',
                  opacity: activeStage >= i ? 1 : 0.2
                }}
                className="absolute inset-0 bg-gradient-to-r from-violet via-electric to-cyan"
              >
                {/* Moving Light Energy */}
                {activeStage === i && (
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                  />
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Floating Stage Nodes */}
        <div className="relative flex items-center justify-between px-[5%]">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isActive = i === activeStage;
            const isDone = i < activeStage;
            const isUpcoming = i > activeStage;

            return (
              <div key={stage.label} className="flex flex-col items-center gap-8 relative group">
                
                {/* 3D Shadow/Depth Effect underneath */}
                <div 
                  className={`absolute top-16 w-12 h-2 rounded-[100%] transition-all duration-500 blur-md
                    ${isActive ? 'bg-white/20 scale-125' : 'bg-black/40 scale-100'}`} 
                />

                <div className="relative">
                  {/* Holographic Aura */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-[-20px] rounded-full blur-2xl z-0"
                        style={{ background: `radial-gradient(circle, ${stage.color}40 0%, transparent 70%)` }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Main Floating Lens */}
                  <motion.div
                    animate={{
                      y: isActive ? -12 : 0,
                      rotateX: isActive ? 10 : 0,
                      borderColor: isUpcoming ? 'rgba(255,255,255,0.1)' : stage.color,
                      backgroundColor: isDone ? `${stage.color}20` : isActive ? 'rgba(30,30,40,0.8)' : 'rgba(20,20,25,0.5)',
                      boxShadow: isActive 
                        ? `0 20px 40px -10px ${stage.color}40, 0 0 20px ${stage.color}20` 
                        : '0 10px 20px -5px rgba(0,0,0,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="relative w-16 h-16 rounded-full border-2 backdrop-blur-xl z-10 flex items-center justify-center overflow-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Glass Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-full" />
                    
                    {/* Status Content */}
                    <div className="relative z-20">
                      {isDone ? (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                          <Check className="w-7 h-7" style={{ color: stage.color }} strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          {isActive && (
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-[-10px] border-2 border-dashed rounded-full border-white/30"
                            />
                          )}
                          <Icon className={`w-6 h-6 transition-all duration-500 ${isUpcoming ? 'text-white/10' : 'text-white/80'} ${isActive ? 'scale-110' : ''}`} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Cyberpunk Label */}
                <div className="relative flex flex-col items-center">
                  <motion.span
                    animate={{
                      color: isUpcoming ? 'rgba(255,255,255,0.2)' : '#ffffff',
                      opacity: isUpcoming ? 0.3 : 1,
                      letterSpacing: isActive ? '0.3em' : '0.1em',
                    }}
                    className="text-[11px] font-mono font-black tracking-widest uppercase transition-all"
                  >
                    {stage.label}
                  </motion.span>
                  
                  {/* Scanning line for active stage */}
                  {isActive && (
                    <motion.div
                      layoutId="scanner"
                      className="absolute -bottom-2 h-[2px] w-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
