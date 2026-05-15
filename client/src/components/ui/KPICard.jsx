import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(from + (target - from) * easeOut(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export function KPICard({
  title,
  value,
  rawValue,
  prefix = '',
  suffix = '',
  change,        // e.g. +8.2
  changePeriod = 'vs last month',
  icon: Icon,
  accent = 'brand',
  description,
  onClick,
  delay = 0,
  animated = true,
}) {
  const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animated_count = useAnimatedCounter(animated ? numericValue : numericValue);

  const accentMap = {
    brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   border: 'border-brand-500/20',   icon: 'text-brand-400',   glow: 'glow-brand' },
    gold:    { bg: 'bg-gold-500/10',    text: 'text-gold-400',    border: 'border-gold-500/20',    icon: 'text-gold-400',    glow: 'glow-gold'  },
    danger:  { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20',    icon: 'text-rose-400',    glow: ''            },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: ''            },
    sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20',     icon: 'text-sky-400',     glow: ''            },
    violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  icon: 'text-violet-400',  glow: ''            },
  };

  const colors = accentMap[accent] || accentMap.brand;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const displayValue = typeof value === 'string' ? value : `${prefix}${numericValue >= 1000
    ? animated_count >= 1_000_000
      ? `${(animated_count / 1_000_000).toFixed(1)}M`
      : animated_count >= 1000
      ? `${(animated_count / 1000).toFixed(0)}K`
      : Math.round(animated_count).toLocaleString()
    : Math.round(animated_count).toLocaleString()}${suffix}`;

  return (
    <motion.div
      className={`kpi-card glass-card rounded-2xl p-5 cursor-pointer border ${colors.border}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${colors.text} animate-counter`}>
            {typeof value === 'string' ? value : displayValue}
          </p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {isPositive && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {isNegative && <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
              {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5 text-slate-500" />}
              <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-500'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-slate-600">{changePeriod}</span>
            </div>
          )}

          {description && (
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>
          )}
        </div>

        {Icon && (
          <div className={`shrink-0 rounded-xl p-2.5 ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
