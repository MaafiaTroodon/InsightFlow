import { motion } from 'framer-motion';

export function EnterpriseButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  as: Component = 'button',
  ...props
}) {
  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-500 border border-brand-500/30 shadow-[0_0_20px_rgba(31,176,170,0.15)]',
    secondary: 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:text-white',
    ghost:     'text-slate-400 hover:text-white hover:bg-white/5',
    danger:    'border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
    gold:      'bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/15',
    outline:   'border border-brand-500/30 text-brand-400 hover:bg-brand-500/10',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3 py-2 text-xs gap-2',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-sm gap-2.5',
    xl: 'px-6 py-3.5 text-base gap-3',
  };

  return (
    <Component
      className={`btn-mag inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 shrink-0" />}
    </Component>
  );
}
