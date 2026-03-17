import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-void-deep flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="font-display text-h3 text-text-primary">
            TBP<span className="text-gold">.</span>DEV
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
