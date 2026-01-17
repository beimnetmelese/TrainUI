interface Props {
  label: string;
  value: string | number;
  tone?: "sky" | "orange" | "neutral";
}

const toneMap = {
  sky: "bg-sky-500/20 text-sky-200 border-sky-400/30",
  orange: "bg-orange-500/20 text-orange-100 border-orange-400/30",
  neutral: "bg-white/5 text-slate-200 border-white/10",
};

const StatBadge = ({ label, value, tone = "neutral" }: Props) => (
  <div className={`flex flex-col rounded-xl border px-4 py-3 ${toneMap[tone]}`}>
    <span className="text-xs uppercase tracking-[0.15em] text-slate-300">
      {label}
    </span>
    <span className="text-2xl font-semibold">{value}</span>
  </div>
);

export default StatBadge;
