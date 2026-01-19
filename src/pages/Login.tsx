import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const auth = await login(username, password);
      const admin = Boolean(
        auth.user?.is_staff ||
        auth.user?.is_superuser ||
        (auth.user as any)?.is_admin,
      );
      navigate(admin ? "/admin" : "/");
    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card title="Welcome back" subtitle="Secure login">
        <form className="flex w-96 flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Username
            <input
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Password
            <input
              type="password"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-orange-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
          {/* Registration is admin-only via dashboard; no public link */}
        </form>
      </Card>
    </div>
  );
};

export default Login;
