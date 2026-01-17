import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError("Registration failed");
      console.error(err);
    }
  };

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card title="Create account" subtitle="Join the control room">
        <form className="flex w-96 flex-col gap-3" onSubmit={handleSubmit}>
          {[
            ["username", "Username"],
            ["email", "Email"],
            ["first_name", "First name"],
            ["last_name", "Last name"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm text-slate-200"
            >
              {label}
              <input
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={(form as any)[key]}
                onChange={(e) => update(key, e.target.value)}
                required={key !== "last_name" && key !== "first_name"}
              />
            </label>
          ))}
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Password
            <input
              type="password"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-orange-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Register"}
          </button>
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="text-sky-300" to="/login">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;
