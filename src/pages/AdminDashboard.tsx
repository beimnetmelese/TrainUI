import { FormEvent, useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import TrainControls from "../components/TrainControls";
import StatBadge from "../components/StatBadge";
import {
  changeTrainMode,
  fetchAdminStats,
  fetchTrains,
  adminCreateUser,
  fetchAllTrainRequests,
  resumeTrain,
  searchTrainRequests,
  stopTrain,
  emergencyStopTrain,
} from "../services/api";
import { AdminStats, Train, TrainRequest } from "../types";

const AdminDashboard = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [allRequests, setAllRequests] = useState<TrainRequest[]>([]);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    is_admin: true,
  });
  const [notice, setNotice] = useState("");
  // History search state
  const [histUser, setHistUser] = useState("");
  const [histStatus, setHistStatus] = useState("");
  const [histStart, setHistStart] = useState("");
  const [histEnd, setHistEnd] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [trainData, statData, allReq] = await Promise.all([
          fetchTrains(),
          fetchAdminStats(),
          fetchAllTrainRequests(),
        ]);
        const hydratedTrains = trainData.map((t, idx) => ({
          ...t,
          name: t.name || `Train ${idx + 1}`,
          speed: Math.floor(Math.random() * 80) + 20,
          battery: Math.floor(Math.random() * 40) + 60,
          acceleration: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
        }));
        // Only one train should be controlled
        setTrains(
          hydratedTrains.length > 0
            ? [hydratedTrains[0]]
            : [
                {
                  id: 1,
                  name: "Main Train",
                  status: "running",
                  mode: "manual",
                  speed: 64,
                  battery: 88,
                  acceleration: 0.8,
                },
              ],
        );
        setStats(statData);
        setAllRequests(allReq);
      } catch (err) {
        console.error("Failed to load admin data", err);
        // Fallback single demo train
        setTrains([
          {
            id: 1,
            name: "Main Train",
            status: "running",
            mode: "manual",
            speed: 64,
            battery: 88,
            acceleration: 0.8,
          },
        ]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrains((prev) =>
        prev.map((t) => ({
          ...t,
          speed: Math.max(
            10,
            Math.min(130, (t.speed || 0) + (Math.random() * 10 - 5)),
          ),
          battery: Math.max(
            10,
            Math.min(100, (t.battery || 80) - Math.random() * 1.5),
          ),
          acceleration: parseFloat((Math.random() * 2).toFixed(2)),
        })),
      );
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleStop = async (id: number) => {
    await stopTrain(id);
    setTrains((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "stopped" } : t)),
    );
  };

  const handleResume = async (id: number) => {
    await resumeTrain(id);
    setTrains((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "running" } : t)),
    );
  };

  const handleMode = async (id: number, mode: Train["mode"]) => {
    try {
      const updated = await changeTrainMode(id, mode);
      setTrains((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, mode: updated.mode || mode } : t,
        ),
      );
    } catch (err) {
      console.error("Failed to change mode", err);
      // Optimistic fallback so the toggle is responsive even if backend blocks
      setTrains((prev) => prev.map((t) => (t.id === id ? { ...t, mode } : t)));
      setNotice(
        "Could not change mode; check admin permissions or server status.",
      );
    }
  };

  const handleEmergency = async (id: number) => {
    await emergencyStopTrain(id);
    setTrains((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "stopped" } : t)),
    );
    setNotice(`Emergency stop issued to train ${id}`);
  };

  const searchHistory = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await searchTrainRequests({
        username: histUser || undefined,
        status: histStatus || undefined,
        start_location: histStart || undefined,
        end_location: histEnd || undefined,
      });
      setAllRequests(data);
    } catch (err) {
      console.error("History search failed", err);
    }
  };

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    try {
      await adminCreateUser(newUser);
      setNewUser({ username: "", email: "", password: "", is_admin: true });
      setNotice("User created successfully");
    } catch (err) {
      console.error("Failed to create user", err);
      setNotice("Failed to create user");
    }
  };

  return (
    <Layout>
      {notice && (
        <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
          {notice}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatBadge
          label="Total users"
          value={stats?.total_users ?? "-"}
          tone="sky"
        />
        <StatBadge
          label="Active today"
          value={stats?.active_users_today ?? "-"}
        />
        <StatBadge
          label="Active week"
          value={stats?.active_users_week ?? "-"}
        />
        <StatBadge
          label="Active month"
          value={stats?.active_users_month ?? "-"}
        />
        <StatBadge
          label="Active year"
          value={stats?.active_users_year ?? "-"}
        />
        <StatBadge
          label="Active all-time"
          value={stats?.active_users_all_time ?? "-"}
        />
        <StatBadge
          label="Req today"
          value={stats?.total_requests_today ?? "-"}
          tone="orange"
        />
        <StatBadge label="Req week" value={stats?.total_requests_week ?? "-"} />
        <StatBadge
          label="Req month"
          value={stats?.total_requests_month ?? "-"}
        />
        <StatBadge label="Req year" value={stats?.total_requests_year ?? "-"} />
        <StatBadge
          label="Req all-time"
          value={stats?.total_requests_all_time ?? "-"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Fleet control" subtitle="Manual & auto">
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
                </div>
                <div className="mt-2">
                  <TrainControls
                    train={train}
                    onStop={handleStop}
                    onResume={handleResume}
                    onMode={handleMode}
                    onEmergencyStop={handleEmergency}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="User management" subtitle="Create & search">
          <form className="flex flex-col gap-3" onSubmit={createUser}>
            {["username", "email", "password"].map((field) => (
              <input
                key={field}
                placeholder={field}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                type={field === "password" ? "password" : "text"}
                value={(newUser as any)[field]}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, [field]: e.target.value }))
                }
                required={field !== "email"}
              />
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={newUser.is_admin}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, is_admin: e.target.checked }))
                }
              />
              Admin privileges
            </label>
            <button
              className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400"
              type="submit"
            >
              Register user
            </button>
          </form>
        </Card>

        <Card title="Live stats" subtitle="Mocked charts">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400">Speed distribution</p>
              <div className="mt-2 flex gap-2">
                {trains.map((t) => (
                  <div
                    key={t.id}
                    className="flex-1 rounded-lg bg-sky-500/30 p-2 text-center text-xs text-white"
                  >
                    {t.name}: {Math.round(t.speed || 0)} km/h
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Battery health</p>
              <div className="mt-2 flex gap-2">
                {trains.map((t) => (
                  <div
                    key={t.id}
                    className="flex-1 rounded-lg bg-orange-500/30 p-2 text-center text-xs text-white"
                  >
                    {t.name}: {Math.round(t.battery || 0)}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <Card title="All time history" subtitle="Train requests">
            <form
              className="grid grid-cols-2 gap-2 mb-3"
              onSubmit={searchHistory}
            >
              <input
                placeholder="Username"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={histUser}
                onChange={(e) => setHistUser(e.target.value)}
              />
              <input
                placeholder="Status (pending/assigned/completed)"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={histStatus}
                onChange={(e) => setHistStatus(e.target.value)}
              />
              <input
                placeholder="Start location"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={histStart}
                onChange={(e) => setHistStart(e.target.value)}
              />
              <input
                placeholder="End location"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={histEnd}
                onChange={(e) => setHistEnd(e.target.value)}
              />
              <button
                className="col-span-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                Search history
              </button>
            </form>
            <div className="flex flex-col gap-2 text-sm text-slate-200 max-h-80 overflow-auto custom-scrollbar">
              {allRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <p className="text-slate-100">
                    {r.start_location} → {r.end_location} ({r.status})
                  </p>
                  <p className="text-xs text-slate-400">
                    User:{" "}
                    {typeof r.user === "number"
                      ? r.user
                      : (r.user?.username ?? "-")}
                  </p>
                  {r.train && (
                    <p className="text-xs text-slate-400">
                      Train:{" "}
                      {typeof r.train === "number" ? r.train : r.train?.name}
                    </p>
                  )}
                </div>
              ))}
              {allRequests.length === 0 && (
                <p className="text-slate-400">No history yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
