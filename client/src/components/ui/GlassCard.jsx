import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', hover = true, delay = 0, onClick, as: Component = 'div', ...props }) {
  const Wrapper = onClick ? motion.button : motion.div;
  return (
    <Wrapper
      className={`glass-card rounded-2xl ${hover ? 'kpi-card' : ''} ${onClick ? 'cursor-pointer w-full text-left' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      {...props}
    >
      {children}
    </Wrapper>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand:  'text-brand-400 bg-brand-500/10',
    gold:   'text-gold-400 bg-gold-500/10',
    danger: 'text-rose-400 bg-rose-500/10',
    sky:    'text-sky-400 bg-sky-500/10',
  };
  return (
    <div className="flex items-start justify-between gap-3 p-5 pb-0">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={`shrink-0 rounded-xl p-2 ${accents[accent] || accents.brand}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
