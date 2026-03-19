"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  content: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.1 + i * 0.05,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

/** Decorative HUD corner element */
function HudCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const rotations = { tl: "", tr: "scale-x-[-1]", bl: "scale-y-[-1]", br: "scale-[-1]" };
  return (
    <div className={`absolute ${position === "tl" || position === "bl" ? "left-0" : "right-0"} ${position === "tl" || position === "tr" ? "top-0" : "bottom-0"} w-6 h-6 pointer-events-none ${rotations[position]}`}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--gold)] to-transparent opacity-50" />
      <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-[var(--gold)] to-transparent opacity-50" />
    </div>
  );
}

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const { user, isAuthenticated } = useAuth();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      content: "",
    },
  });

  // Pre-fill form when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        content: "",
      });
    }
  }, [isAuthenticated, user, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus("loading");
    try {
      await api.post("/api/contact", data);
      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <section id="contact" ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-5xl mx-auto"
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Contact</SectionLabel>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left column -- Form */}
          <motion.div custom={1} variants={fadeUp}>
            <h2 className="text-h2 font-display">
              Let&apos;s Build Something
            </h2>
            <p className="mt-3 text-text-secondary text-sm leading-relaxed">
              Open to new projects, collaborations, and interesting
              conversations.
            </p>

            {/* Form with HUD corners */}
            <div className="relative mt-8">
              <HudCorner position="tl" />
              <HudCorner position="tr" />
              <HudCorner position="bl" />
              <HudCorner position="br" />

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {submitStatus === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-[var(--gold)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h3 className="font-display font-semibold text-xl text-text-primary">
                        Message Sent
                      </h3>
                      <p className="mt-2 text-text-secondary text-sm">
                        I&apos;ll get back to you soon.
                      </p>
                      <button
                        onClick={() => setSubmitStatus("idle")}
                        className="mt-6 text-gold text-sm hover:text-text-primary transition-colors"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : submitStatus === "error" ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                      <h3 className="font-display font-semibold text-xl text-text-primary">
                        Something Went Wrong
                      </h3>
                      <p className="mt-2 text-text-secondary text-sm">
                        Please try again or reach out via email directly.
                      </p>
                      <button
                        onClick={() => setSubmitStatus("idle")}
                        className="mt-6 text-gold text-sm hover:text-text-primary transition-colors"
                      >
                        Try again
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          placeholder="John"
                          error={errors.firstName?.message}
                          {...register("firstName")}
                        />
                        <Input
                          label="Last Name"
                          placeholder="Doe"
                          error={errors.lastName?.message}
                          {...register("lastName")}
                        />
                      </div>

                      <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        error={errors.email?.message}
                        {...register("email")}
                      />

                      <Input
                        label="Phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        error={errors.phone?.message}
                        {...register("phone")}
                      />

                      <div className="space-y-1">
                        <label htmlFor="message" className="section-label">
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Tell me about your project..."
                          className={`input-void resize-none w-full ${errors.content ? "border-b-red-500" : ""}`}
                          {...register("content")}
                        />
                        {errors.content && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.content.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="gold"
                        disabled={submitStatus === "loading"}
                      >
                        {submitStatus === "loading" ? "Sending..." : "Send Message"}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right column -- Info */}
          <motion.div custom={2} variants={fadeUp} className="space-y-10">
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg tracking-wide">
                Contact Info
              </h3>

              <div className="mt-8 space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg border border-[var(--gold-dim)] bg-[rgba(212,175,55,0.05)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="hud-caption text-text-dim mb-1">Email</p>
                    <a
                      href="mailto:bariteaupeter.tom@gmail.com"
                      className="text-text-secondary hover:text-[var(--gold)] transition-colors duration-300"
                    >
                      bariteaupeter.tom@gmail.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg border border-[var(--gold-dim)] bg-[rgba(212,175,55,0.05)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="hud-caption text-text-dim mb-1">Location</p>
                    <p className="text-text-secondary">Paris, France</p>
                    <p className="font-mono text-[0.65rem] text-[var(--gold-dim)] mt-1 tracking-wider">
                      48.8566&deg; N, 2.3522&deg; E
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg border border-[var(--gold-dim)] bg-[rgba(212,175,55,0.05)] flex items-center justify-center shrink-0">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-40" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--gold)]" />
                    </span>
                  </div>
                  <div>
                    <p className="hud-caption text-text-dim mb-1">Status</p>
                    <p className="text-text-secondary">Open to new projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinates decorative element */}
            <div className="void-panel p-5 relative overflow-hidden">
              <HudCorner position="tl" />
              <HudCorner position="tr" />
              <HudCorner position="bl" />
              <HudCorner position="br" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative">
                <p className="hud-caption text-text-dim mb-3 tracking-[0.25em]">Current Base</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-xs text-[var(--gold-dim)]">LAT</p>
                    <p className="font-mono text-lg text-text-primary tracking-wider">48.8566&deg;</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[var(--gold-dim)]">LNG</p>
                    <p className="font-mono text-lg text-text-primary tracking-wider">2.3522&deg;</p>
                  </div>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-[var(--gold-dim)] via-[var(--border)] to-transparent" />
                <p className="mt-3 text-xs text-text-dim font-mono tracking-wider">
                  PARIS // CET (UTC+1)
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg tracking-wide">
                Socials
              </h3>

              <div className="mt-4 flex items-center gap-4">
                <a
                  href="https://github.com/Tomi-Tom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--gold)] hover:border-[var(--gold-dim)] transition-all duration-300"
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/in/tom-bariteau-peter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--gold)] hover:border-[var(--gold-dim)] transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
