'use client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'green' | 'amber' | 'crimson' | 'violet' | 'electric' | 'none';
  hover?: boolean;
}

const glowColorMap = {
  green: { r: 52, g: 211, b: 153 },
  amber: { r: 245, g: 158, b: 11 },
  crimson: { r: 244, g: 63, b: 94 },
  violet: { r: 139, g: 92, b: 246 },
  electric: { r: 59, g: 130, b: 246 },
  none: { r: 37, g: 40, b: 54 },
};

export default function GlowCard({ children, className = '', glowColor = 'violet', hover = true }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    opacity.set(1);
  };

  const handleMouseLeave = () => {
    opacity.set(0);
  };

  const color = glowColorMap[glowColor];

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(400px circle at ${x}px ${y}px, rgba(${color.r}, ${color.g}, ${color.b}, 0.06), transparent 60%)`
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {}}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden
        bg-graphite-light/80 border border-graphite-border/50 rounded-2xl p-5
        transition-[border-color,box-shadow] duration-300 ease-out
        ${hover ? 'hover:border-graphite-border/80 hover:shadow-lg hover:shadow-black/20' : ''}
        ${className}
      `}
    >
      {/* Mouse spotlight glow */}
      {hover && glowColor !== 'none' && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            opacity,
            background,
          }}
        />
      )}
      {/* Subtle top border gradient */}
      {glowColor !== 'none' && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${color.r}, ${color.g}, ${color.b}, 0.3), transparent)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
