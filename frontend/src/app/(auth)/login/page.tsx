"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.email, data.password);
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
    }
  };

  const googleUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/google`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="font-display text-h4 text-text-primary text-center">
        Sign in
      </h1>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        variant="gold"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        type="button"
        variant="ghost-gold"
        className="w-full"
        onClick={() => {
          window.location.href = googleUrl;
        }}
      >
        Continue with Google
      </Button>

      <p className="text-text-secondary text-sm text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
