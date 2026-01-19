import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import StatBadge from "../components/StatBadge";
import TrainMap from "../components/TrainMap";
import RequestTimeline from "../components/RequestTimeline";
import {
  createTrainRequest,
  fetchMyRequests,
  fetchTrains,
} from "../services/api";
import { Train, TrainRequest } from "../types";

const UserDashboard = () => {
  const LOCATIONS = ["Kilinito door", "central", "Kibnesh", "Block 02"];
  const [trains, setTrains] = useState<Train[]>([]);
  const [requests, setRequests] = useState<TrainRequest[]>([]);
  const [form, setForm] = useState({
    start_location: LOCATIONS[0],
    end_location: LOCATIONS[1],
  });
  const [locationTick, setLocationTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const activeTimers = useRef<Record<number, number[]>>({});
  const requestSeqRef = useRef<Record<number, number>>({});
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [, setCurrentStop] = useState<string>(LOCATIONS[0]);
  const currentStopRef = useRef<string>(LOCATIONS[0]);
  const locationSeqRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTrains();
        setTrains(
          data.map((t) => ({
            ...t,
            speed: Math.floor(Math.random() * 80) + 20,
            battery: Math.floor(Math.random() * 40) + 60,
            acceleration: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
          })),
        );
      } catch (err) {
        console.error("Failed to load trains", err);
        setTrains([
          {
            id: 1,
            name: "Metro-1",
            status: "running",
            mode: "automatic",
            speed: 45,
            battery: 82,
          },
        ]);
      }
    };
    const loadRequests = async () => {
      try {
        const data = await fetchMyRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    };
    load();
    loadRequests();
  }, []);

  useEffect(() => {
    if (!activeRequestId) return;

    const req = requests.find((r) => r.id === activeRequestId);
    if (!req) return;

    if (
      req.status === "in_train" &&
      currentStopRef.current === req.end_location
    ) {
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: "completed" } : r)),
      );

      setNotice("You arrived at your destination.");
      setActiveRequestId(null);
      delete requestSeqRef.current[req.id];
      delete activeTimers.current[req.id];
    }
  }, [locationTick]); // 👈 THIS is the magic

  useEffect(() => {
    const interval = setInterval(() => {
      setTrains((prev) =>
        prev.map((t) => ({
          ...t,
          speed: Math.max(
            10,
            Math.min(120, (t.speed || 0) + (Math.random() * 6 - 3)),
          ),
          battery: Math.max(
            10,
            Math.min(100, (t.battery || 80) - Math.random() * 1.2),
          ),
          acceleration: parseFloat((Math.random() * 1.6).toFixed(2)),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const active = trains.filter((t) => t.status === "running").length;
    const avgSpeed = trains.length
      ? Math.round(
          trains.reduce((acc, t) => acc + (t.speed || 0), 0) / trains.length,
        )
      : 0;
    return { active, avgSpeed, total: trains.length };
  }, [trains]);

  const submitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (activeRequestId) return;
    setLoading(true);
    setNotice("");
    try {
      const req = await createTrainRequest(form);
      const withLocal = { ...req, status: "pending" } as TrainRequest;
      setRequests((prev) => [withLocal, ...prev]);
      setActiveRequestId(withLocal.id);
      requestSeqRef.current[withLocal.id] = locationSeqRef.current;
      setNotice("Request created. Waiting for train to reach your stop…");

      const waitForTrain = window.setInterval(() => {
        const createdSeq = requestSeqRef.current[withLocal.id] ?? 0;
        // Wait for a real movement after the request before marking arrival
        if (
          locationSeqRef.current > createdSeq &&
          currentStopRef.current === withLocal.start_location
        ) {
          clearInterval(waitForTrain);
          setRequests((prev) =>
            prev.map((r) =>
              r.id === withLocal.id && r.status === "pending"
                ? { ...r, status: "approaching" }
                : r,
            ),
          );
          setNotice("Train arrived at the station. Boarding…");

          const toInTrain = window.setTimeout(() => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === withLocal.id && r.status !== "cancelled"
                  ? { ...r, status: "in_train" }
                  : r,
              ),
            );
            setNotice("You are on the train. En route…");
          }, 3500);

          activeTimers.current[withLocal.id] = [toInTrain];
        }
      }, 1200);

      activeTimers.current[withLocal.id] = [waitForTrain];
    } catch (err) {
      setNotice("Could not send request");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stopActive = () => {
    if (!activeRequestId) return;
    const timers = activeTimers.current[activeRequestId] || [];
    timers.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    delete activeTimers.current[activeRequestId];
    delete requestSeqRef.current[activeRequestId];
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeRequestId ? { ...r, status: "cancelled" } : r,
      ),
    );
    setActiveRequestId(null);
    setNotice("Request cancelled.");
  };

  const activeRequest = activeRequestId
    ? requests.find((r) => r.id === activeRequestId)
    : null;
  const isBoarded = activeRequest?.status === "in_train";
  const canCancel =
    activeRequest && !isBoarded && activeRequest.status !== "arrived";

  const handleLocationChange = (name: string) => {
    setCurrentStop(name);
    currentStopRef.current = name;
    locationSeqRef.current += 1;
    setLocationTick((t) => t + 1); // 🔥 THIS wakes React up
  };

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-3">
        <StatBadge label="Active trains" value={stats.active} tone="sky" />
        <StatBadge
          label="Average speed"
          value={`${stats.avgSpeed} km/h`}
          tone="neutral"
        />
        <StatBadge label="Fleet" value={stats.total} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Request a train"
          subtitle="From A to B"
          right={
            activeRequestId ? (
              <div className="flex gap-2">
                {canCancel && (
                  <button
                    onClick={stopActive}
                    className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Cancel
                  </button>
                )}
                {isBoarded && (
                  <button
                    onClick={stopActive}
                    className="rounded-lg bg-orange-500/80 px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    Emergency Stop
                  </button>
                )}
              </div>
            ) : null
          }
        >
          <form className="flex flex-col gap-3" onSubmit={submitRequest}>
            {["start_location", "end_location"].map((field) => (
              <label
                key={field}
                className="flex flex-col gap-1 text-sm text-slate-200"
              >
                {field === "start_location" ? "Pickup" : "Destination"}
                <select
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                  value={(form as any)[field]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                  required
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="text-slate-900">
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button
              type="submit"
              disabled={loading || Boolean(activeRequestId)}
              className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
            >
              {loading
                ? "Sending…"
                : activeRequestId
                  ? "Wait for current ride"
                  : "Send request"}
            </button>
            {notice && <p className="text-sm text-slate-300">{notice}</p>}
          </form>
        </Card>

        <Card
          title="Live Trains"
          subtitle="Stats"
          right={
            <span className="text-xs text-slate-400">mocked speed/battery</span>
          }
        >
          <div className="flex flex-col gap-3">
            {trains.map((train) => (
              <div
                key={train.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {train.name}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {train.status}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <p>{Math.round(train.speed || 0)} km/h</p>
                    <p>Battery {Math.round(train.battery || 0)}%</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-slate-400">
                  <span className="rounded-full bg-sky-500/20 px-2 py-1">
                    Mode {train.mode}
                  </span>
                  <span className="rounded-full bg-orange-500/20 px-2 py-1">
                    Accel {train.acceleration} m/s²
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <TrainMap onLocationChange={handleLocationChange} />
      </div>

      <Card title="Request history" subtitle="Live tracking">
        <div className="flex flex-col gap-4">
          {requests.length === 0 && (
            <p className="text-sm text-slate-400">No requests yet.</p>
          )}
          {requests.map((req) => (
            <RequestTimeline key={req.id} request={req} />
          ))}
        </div>
      </Card>
    </Layout>
  );
};

export default UserDashboard;
