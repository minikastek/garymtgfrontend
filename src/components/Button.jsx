const variants = {
  primary:
    'bg-accent text-[#1a1405] hover:bg-accent-hover disabled:opacity-60',
  ghost:
    'border border-accent/45 bg-transparent text-white hover:border-accent hover:text-accent disabled:opacity-60',
  danger:
    'bg-danger/15 text-danger hover:bg-danger/25 disabled:opacity-60',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <Comp
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] px-4 py-2.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}
