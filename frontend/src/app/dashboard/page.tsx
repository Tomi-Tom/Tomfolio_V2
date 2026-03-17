"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VoidPanel } from "@/components/ui/VoidPanel";
import type { UserData } from "@/types";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Populate form fields when user data is available
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
    }
  }, [user]);

  // Fetch user data entries
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get("/api/users/me/data");
        setUserData(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // No data or endpoint not available
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--gold)] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/users/me", { firstName, lastName, phone: phone || null });
      // Refresh session to get updated user
      window.location.reload();
    } catch {
      // Handle error silently
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible and all your data will be permanently lost."
    );
    if (!confirmed) return;

    try {
      await api.delete("/api/users/me");
      await logout();
      router.push("/");
    } catch {
      // Handle error silently
    }
  };

  const accountType = user.provider === "google" ? "Google" : "Email";

  return (
    <div className="space-y-12">
      {/* Profile Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-h2">My Profile</h2>
          <Button variant="ghost-gold" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <VoidPanel hoverable={false} className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-full bg-[var(--void-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-dim)] text-xl font-display uppercase">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="font-display text-lg text-[var(--text-primary)]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-[var(--text-dim)]">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-[var(--text-dim)]">{user.phone}</p>
              )}
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Account type: {accountType}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 border-t border-[var(--border)] pt-6">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button variant="gold" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </VoidPanel>
      </section>

      {/* User Data Section */}
      {!loadingData && userData.length > 0 && (
        <section>
          <h3 className="font-display text-h3 mb-4">Stored Data</h3>
          <div className="space-y-3">
            {userData.map((item) => (
              <VoidPanel key={item.id} hoverable={false} className="p-4">
                <p className="text-sm font-display text-[var(--gold)] mb-1">{item.key}</p>
                <p className="text-sm text-[var(--text-dim)] break-all">
                  {JSON.stringify(item.value)}
                </p>
              </VoidPanel>
            ))}
          </div>
        </section>
      )}

      {/* Delete Account Section */}
      <section>
        <VoidPanel hoverable={false} className="p-6 border-red-500/30 bg-red-500/5">
          <h3 className="font-display text-h3 text-red-400 mb-2">Delete My Account</h3>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            This action is permanent. All your data, including your profile and stored
            information, will be irreversibly deleted.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-display uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            Delete Account
          </button>
        </VoidPanel>
      </section>
    </div>
  );
}
