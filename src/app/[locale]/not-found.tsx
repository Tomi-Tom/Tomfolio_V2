"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-screen bg-void-deep flex flex-col items-center justify-center px-4">
      <h1 className="text-display font-display text-text-primary">
        4<span className="text-gold">0</span>4
      </h1>
      <p className="mt-4 text-text-secondary text-lg">{t("message")}</p>
      <Link href="/" className="mt-8 btn-gold inline-block">
        {t("backHome")}
      </Link>
    </div>
  );
}
