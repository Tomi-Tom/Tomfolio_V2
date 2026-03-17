"use client";

import Link from "next/link";
import { StatusBar } from "@/components/layout/StatusBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar />
      <div className="max-w-2xl mx-auto px-4 py-24">
        <Link href="/" className="text-gold inline-block mb-8">
          &larr; Back to portfolio
        </Link>
        {children}
      </div>
    </>
  );
}
