import { FormEvent, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });
  const [notice, setNotice] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const updated = await updateProfile(user.id, form);
      setUser(updated);
      setNotice("Profile updated");
    } catch (err) {
      setNotice("Could not update profile");
      console.error(err);
    }
  };

  return (
    <Layout>
      <Card title="Profile" subtitle="Manage account">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
          {["first_name", "last_name", "email"].map((field) => (
            <label
              key={field}
              className="flex flex-col gap-1 text-sm text-slate-200"
            >
              {field.replace("_", " ")}
              <input
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
                value={(form as any)[field]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [field]: e.target.value }))
                }
              />
            </label>
          ))}
          <button
            className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-400"
            type="submit"
          >
            Save
          </button>
          {notice && <p className="text-sm text-slate-300">{notice}</p>}
        </form>
      </Card>
    </Layout>
  );
};

export default Profile;
