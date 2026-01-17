import { Train } from "../types";

interface Props {
  train: Train;
  onStop: (id: number) => void;
  onResume: (id: number) => void;
  onMode: (id: number, mode: Train["mode"]) => void;
  onEmergencyStop?: (id: number) => void;
}

const TrainControls = ({
  train,
  onStop,
  onResume,
  onMode,
  onEmergencyStop,
}: Props) => {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Mode
        </span>
        <button
          className={`rounded-full px-4 py-1 text-xs font-semibold ${
            train.mode === "automatic"
              ? "bg-sky-500 text-slate-900"
              : "bg-white/20 text-white"
          }`}
          onClick={() =>
            onMode(
              train.id,
              train.mode === "automatic" ? "manual" : "automatic",
            )
          }
        >
          Automatic {train.mode === "automatic" ? "On" : "Off"}
        </button>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-2">
        {train.mode === "automatic" && onEmergencyStop && (
          <button
            onClick={() => onEmergencyStop(train.id)}
            className="rounded-lg bg-orange-500/90 px-3 py-2 font-semibold text-slate-900 hover:bg-orange-400"
          >
            Emergency Stop
          </button>
        )}
        {train.mode === "manual" && (
          <>
            <button
              onClick={() => onResume(train.id)}
              className="rounded-lg bg-emerald-400 px-3 py-2 font-semibold text-slate-900 hover:bg-emerald-300"
            >
              Start
            </button>
            <button
              onClick={() => onStop(train.id)}
              className="rounded-lg bg-red-400 px-3 py-2 font-semibold text-slate-900 hover:bg-red-300"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainControls;
