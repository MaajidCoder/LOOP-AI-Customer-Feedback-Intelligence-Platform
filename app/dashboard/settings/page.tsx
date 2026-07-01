"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Shield, UserMinus, Plus, Loader, CheckCircle2, AlertCircle } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for inviting a member
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("VIEWER");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMembers();
    }
  }, [session]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePassword) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          password: invitePassword,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite member");
      }

      setMessage({ type: "success", text: "Successfully invited new member!" });
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole("VIEWER");
      fetchMembers();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: "ADMIN" | "ANALYST" | "VIEWER") => {
    try {
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      fetchMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this user from the workspace?")) return;

    try {
      const res = await fetch(`/api/members?id=${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      fetchMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage profile and workspace team configurations.</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Details</h2>
        <p className="text-sm text-slate-500 mb-6">Your current user session information.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
            <p className="mt-1 text-base font-semibold text-slate-800">{session?.user?.name || "Loading..."}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <p className="mt-1 text-base font-semibold text-slate-800">{session?.user?.email || "Loading..."}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
            <p className="mt-1 text-base font-bold text-indigo-600 capitalize">{(session?.user as any)?.role || "Loading..."}</p>
          </div>
        </div>
      </div>

      {/* Workspace Members Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Workspace Members</h2>
            <p className="text-sm text-slate-500">View and manage colleague roles in your workspace.</p>
          </div>
          {!isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <Shield className="h-3.5 w-3.5" />
              Read-Only (Requires Admin)
            </span>
          )}
        </div>

        {isAdmin && (
          /* Add/Invite Teammate Form */
          <form onSubmit={handleInvite} className="mb-8 border border-slate-100 rounded-xl bg-slate-50/50 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              Add Workspace Member
            </h3>

            {message && (
              <div className={`flex items-center gap-2 text-sm rounded-lg p-4 border ${
                message.type === "success" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="VIEWER" className="text-slate-800 bg-white">Viewer (Read-only)</option>
                <option value="ANALYST" className="text-slate-800 bg-white">Analyst (Ingest + Manage)</option>
                <option value="ADMIN" className="text-slate-800 bg-white">Admin (Full Control)</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : "Invite Member"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-150 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-500">{member.email}</td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="VIEWER" className="text-slate-800 bg-white">Viewer</option>
                          <option value="ANALYST" className="text-slate-800 bg-white">Analyst</option>
                          <option value="ADMIN" className="text-slate-800 bg-white">Admin</option>
                        </select>
                      ) : (
                        <span className="capitalize text-slate-700 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                          {member.role.toLowerCase()}
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove user"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No other workspace members found.
          </div>
        )}
      </div>
    </div>
  );
}
