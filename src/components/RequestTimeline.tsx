import { TrainRequest } from "../types";

const steps = ["Requested", "Assigned", "En route", "Arrived"];

const RequestTimeline: React.FC<{ request: TrainRequest }> = ({ request }) => {
  const currentIndex = Math.min(
    steps.findIndex((s) =>
      s.toLowerCase().includes(request.status?.toLowerCase() || ""),
    ),
    steps.length - 1,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="rounded-lg bg-white/5 px-2 py-1 text-xs">
          ID #{request.id}
        </span>
        <span className="text-xs text-slate-400">
          {request.start_location} → {request.end_location}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const active = index <= currentIndex || currentIndex === -1;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${active ? "bg-sky-400 shadow-card" : "bg-white/20"}`}
              />
              <span
                className={`text-xs ${active ? "text-white" : "text-slate-500"}`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className="h-px w-10 bg-white/10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RequestTimeline;
