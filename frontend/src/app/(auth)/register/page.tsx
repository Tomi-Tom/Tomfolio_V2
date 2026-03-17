"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      await registerUser(data);
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
    }
  };

  const googleUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/google`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="font-display text-h4 text-text-primary text-center">
        Create account
      </h1>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="Tom"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          label="Last name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

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
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="+1 234 567 890"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Button
        type="submit"
        variant="gold"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
