import { useEffect, useRef, useState } from "react";
import Card from "./Card";

const stops = [
  { name: "Kilinito door", x: 8, y: 50 },
  { name: "central", x: 32, y: 50 },
  { name: "Kibnesh", x: 64, y: 50 },
  { name: "Block 02", x: 88, y: 50 },
];

interface Props {
  onLocationChange?: (name: string) => void;
}

const TrainMap = ({ onLocationChange }: Props) => {
  const [idx, setIdx] = useState(0);
  const [position, setPosition] = useState({ x: stops[0].x, y: stops[0].y });
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => {
        let next = prev + directionRef.current;
        // Bounce at the ends instead of looping
        if (next >= stops.length || next < 0) {
          directionRef.current = directionRef.current === 1 ? -1 : 1;
          next = prev + directionRef.current;
        }
        setPosition({ x: stops[next].x, y: stops[next].y });
        if (onLocationChange) onLocationChange(stops[next].name);
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card
      title="Live Map"
      subtitle="Mocked"
      right={
        <span className="text-xs text-slate-400">Straight line route</span>
      }
    >
      <div className="relative h-64 overflow-hidden rounded-xl bg-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.08),transparent_32%)]" />
        <div className="absolute inset-4 border border-white/10">
          {/* Straight line */}
          <div className="absolute left-[5%] right-[5%] top-1/2 h-[2px] -translate-y-1/2 bg-sky-500/40" />
          {/* Stops */}
          {stops.map((stop) => (
            <div
              key={stop.name}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-[11px] text-slate-200"
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            >
              <span className="h-3 w-3 rounded-full border border-white/60 bg-slate-900" />
              <span className="rounded bg-white/5 px-2 py-[2px] text-[10px] text-slate-200">
                {stop.name}
              </span>
            </div>
          ))}
          {/* Train marker */}
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-400 to-orange-400 shadow-lg shadow-orange-400/30"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-300">
        Current location: {stops[idx].name}
      </p>
    </Card>
  );
};

export default TrainMap;
