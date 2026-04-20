import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void-deep flex flex-col items-center justify-center px-4">
      <h1 className="text-display font-display text-text-primary">
        4<span className="text-gold">0</span>4
      </h1>
      <p className="mt-4 text-text-secondary text-lg">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 btn-gold inline-block">
        Back to Home
      </Link>
    </div>
  );
}
