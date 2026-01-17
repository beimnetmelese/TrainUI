const Card: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}> = ({ title, subtitle, children, right }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-900/60 p-5 shadow-xl shadow-slate-900/50">
    {(title || right) && (
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {subtitle}
            </p>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
        </div>
        {right}
      </div>
    )}
    {children}
  </div>
);

export default Card;
