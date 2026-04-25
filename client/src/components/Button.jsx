export function Button({
  children,
  variant = 'primary',
  className = '',
  as: Component = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-teal-500 text-slate-950 hover:bg-teal-400',
    secondary: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    ghost: 'text-slate-300 hover:bg-white/5',
    danger: 'border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  };

  return (
    <Component
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
