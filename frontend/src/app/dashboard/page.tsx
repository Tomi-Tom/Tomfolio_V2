"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { UserData } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.65, 0, 0.35, 1] as const },
  }),
};

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User data
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Contact form
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState<"idle" | "success" | "error">("idle");

  // Animation refs
  const profileRef = useRef(null);
  const messageRef = useRef(null);
  const dataRef = useRef(null);
  const profileInView = useInView(profileRef, { once: true });
  const messageInView = useInView(messageRef, { once: true });
  const dataInView = useInView(dataRef, { once: true });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get("/api/users/me/data");
        setUserData(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // No data
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--gold)] border-t-transparent" />
        <span className="hud-caption text-[var(--text-dim)]">Loading your profile...</span>
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.patch("/api/users/me", { firstName, lastName, phone: phone || null });
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || message.length < 10) return;
    setSendingMsg(true);
    setMsgStatus("idle");
    try {
      await api.post("/api/contact", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || undefined,
        content: subject ? `[${subject}] ${message}` : message,
      });
      setMsgStatus("success");
      setMessage("");
      setSubject("");
      setTimeout(() => setMsgStatus("idle"), 4000);
    } catch {
      setMsgStatus("error");
      setTimeout(() => setMsgStatus("idle"), 4000);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible.",
    );
    if (!confirmed) return;
    try {
      await api.delete("/api/users/me");
      await logout();
      router.push("/");
    } catch {
      // Handle error
    }
  };

  const accountType = user.provider === "google" ? "Google" : "Email";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-16">
      {/* ─── Welcome Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionLabel>Dashboard</SectionLabel>
        <h1 className="font-display text-h2 mt-2">
          Welcome back, <span className="text-gold">{user.firstName}</span>
        </h1>
        <p className="text-[var(--text-dim)] text-sm mt-1">
          Member since {memberSince} · {accountType} account
        </p>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Account Type", value: accountType, icon: accountType === "Google" ? "G" : "@" },
          { label: "Data Entries", value: loadingData ? "..." : String(userData.length), icon: "#" },
          { label: "Status", value: "Active", icon: "●" },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={fadeUp}>
            <VoidPanel hoverable={false} className="p-4 text-center">
              <span className="text-gold text-2xl font-display">{stat.icon}</span>
              <p className="font-display font-bold text-lg text-[var(--text-primary)] mt-2">
                {stat.value}
              </p>
              <p className="hud-caption text-[var(--text-dim)]">{stat.label}</p>
            </VoidPanel>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Profile Section ─── */}
      <motion.section
        ref={profileRef}
        initial="hidden"
        animate={profileInView ? "visible" : "hidden"}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h2 className="font-display text-h3">Profile</h2>
          </div>
          <Button variant="ghost-gold" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <VoidPanel hoverable={false} className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[var(--gold-ghost)] border-2 border-[var(--gold-dim)] flex items-center justify-center text-gold text-2xl font-display uppercase shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-[var(--text-primary)]">
                {user.firstName} {user.lastName}
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="hud-caption text-[var(--text-dim)] block">Email</span>
                  <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
                </div>
                <div>
                  <span className="hud-caption text-[var(--text-dim)] block">Phone</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {user.phone || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="hud-caption text-[var(--text-dim)] block">Role</span>
                  <span className="text-sm text-[var(--text-secondary)]">{user.role}</span>
                </div>
                <div>
                  <span className="hud-caption text-[var(--text-dim)] block">Provider</span>
                  <span className="text-sm text-[var(--text-secondary)]">{accountType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-[var(--border)] pt-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                  <Input
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                  <div className="flex items-center gap-3 pt-2">
                    <Button variant="gold" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}
                    </Button>
                    {saveSuccess && (
                      <span className="text-green-400 text-sm">Profile updated!</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </VoidPanel>
      </motion.section>

      {/* ─── Send Message Section ─── */}
      <motion.section
        ref={messageRef}
        initial="hidden"
        animate={messageInView ? "visible" : "hidden"}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gold rounded-full" />
          <h2 className="font-display text-h3">Send a Message</h2>
        </div>
        <p className="text-[var(--text-dim)] text-sm mb-4">
          Reach out directly — your profile info is attached automatically.
        </p>

        <VoidPanel hoverable={false} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--gold-ghost)] border border-[var(--gold-dim)] flex items-center justify-center text-gold text-xs font-display uppercase">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <p className="text-sm text-[var(--text-primary)] font-display">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[var(--text-dim)]">{user.email}</p>
              </div>
            </div>

            <Input
              label="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project inquiry, collaboration, feedback..."
            />

            <div className="space-y-1">
              <label className="section-label">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here... (min 10 characters)"
                rows={5}
                className="input-void !border-b-0 border border-[var(--border)] rounded-sm p-3 resize-none focus:border-[var(--gold)]"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-dim)]">
                  {message.length}/10 min characters
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="gold"
                onClick={handleSendMessage}
                disabled={sendingMsg || message.length < 10}
              >
                {sendingMsg ? "Sending..." : "Send Message"}
              </Button>

              <AnimatePresence>
                {msgStatus === "success" && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-400 text-sm"
                  >
                    Message sent successfully!
                  </motion.span>
                )}
                {msgStatus === "error" && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm"
                  >
                    Failed to send. Please try again.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </VoidPanel>
      </motion.section>

      {/* ─── Stored Data Section ─── */}
      {!loadingData && userData.length > 0 && (
        <motion.section
          ref={dataRef}
          initial="hidden"
          animate={dataInView ? "visible" : "hidden"}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h2 className="font-display text-h3">Stored Data</h2>
          </div>
          <div className="space-y-3">
            {userData.map((item, i) => (
              <motion.div key={item.id} custom={i} variants={fadeUp}>
                <VoidPanel hoverable={false} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-display text-gold">{item.key}</p>
                      <p className="text-xs text-[var(--text-dim)] break-all mt-1">
                        {JSON.stringify(item.value)}
                      </p>
                    </div>
                    <span className="hud-caption text-[var(--text-dim)] shrink-0 ml-4">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </VoidPanel>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ─── Danger Zone ─── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-red-500/50 rounded-full" />
          <h2 className="font-display text-h3 text-[var(--text-dim)]">Danger Zone</h2>
        </div>

        <VoidPanel hoverable={false} className="p-6 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm text-red-400">Delete Account</h3>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-display uppercase tracking-wider transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </VoidPanel>
      </section>
    </div>
  );
}
