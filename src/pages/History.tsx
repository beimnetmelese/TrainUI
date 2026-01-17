import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import RequestTimeline from "../components/RequestTimeline";
import { fetchMyRequests } from "../services/api";
import { TrainRequest } from "../types";

const statusFlow = ["pending", "assigned", "completed"];

const History = () => {
  const [requests, setRequests] = useState<TrainRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRequests((prev) =>
        prev.map((r) => {
          const idx = statusFlow.indexOf(r.status?.toLowerCase() || "");
          const nextStatus = statusFlow[idx + 1];
          if (!nextStatus) return r;
          return Math.random() > 0.6 ? { ...r, status: nextStatus } : r;
        }),
      );
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <Card title="History" subtitle="Past & active requests">
        <div className="flex flex-col gap-4">
          {requests.length === 0 && (
            <p className="text-sm text-slate-400">No requests yet.</p>
          )}
          {requests.map((r) => (
            <RequestTimeline key={r.id} request={r} />
          ))}
        </div>
      </Card>
    </Layout>
  );
};

export default History;
