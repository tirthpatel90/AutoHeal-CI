'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, GitBranch, Workflow, Brain, Wrench,
  History, GraduationCap, ScrollText, Settings,
} from 'lucide-react';
import { useState, useRef } from 'react';

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/repositories', label: 'Repos', icon: GitBranch },
  { href: '/pipelines', label: 'Pipeline', icon: Workflow },
  { href: '/predictions', label: 'AI', icon: Brain },
  { href: '/auto-fix', label: 'Fix', icon: Wrench },
  { href: '/build-history', label: 'Builds', icon: History },
  { href: '/learning', label: 'Learn', icon: GraduationCap },
  { href: '/logs', label: 'Logs', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    setHoveredIndex(index);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect();
    if (navRect) {
      setTooltipPos({ x: rect.left - navRect.left + rect.width / 2 });
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <nav
        ref={navRef}
        className="relative flex items-center gap-0.5 px-2 py-2 rounded-2xl bg-graphite-light/80 backdrop-blur-2xl border border-graphite-border/40 shadow-2xl shadow-black/50"
      >
        {/* Tooltip */}
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 pointer-events-none"
            style={{ left: tooltipPos.x, transform: 'translateX(-50%)' }}
          >
            <div className="px-2.5 py-1 rounded-lg bg-graphite-lighter border border-graphite-border/60 text-[11px] text-text-primary font-medium whitespace-nowrap shadow-lg shadow-black/30">
              {navItems[hoveredIndex].label}
            </div>
          </motion.div>
        )}

        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isHovered = hoveredIndex === index;
          const distance = hoveredIndex !== null ? Math.abs(index - hoveredIndex) : -1;
          const scale = isHovered ? 1.2 : distance === 1 ? 1.08 : distance === 2 ? 1.02 : 1;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="relative flex items-center justify-center"
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.5 }}
              >
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'text-violet'
                      : 'text-text-muted hover:text-text-secondary'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dock-active-bg"
                      className="absolute inset-0 rounded-xl bg-violet/12 border border-violet/20 shadow-[0_0_12px_rgba(139,92,246,0.12)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] relative z-10 transition-colors duration-200 ${isActive ? 'text-violet' : isHovered ? 'text-text-primary' : 'text-text-muted'}`} />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-violet shadow-[0_0_6px_rgba(139,92,246,0.8)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
