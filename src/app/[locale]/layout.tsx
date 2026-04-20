import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { routing, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Tom Bariteau-Peter — UX Designer & Developer",
  description:
    "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul. Crafting immersive digital experiences.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Tom Bariteau-Peter — UX Designer & Developer",
    description:
      "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tom Bariteau-Peter — UX Designer & Developer",
    description:
      "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul.",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Tom Bariteau-Peter",
              jobTitle: "UX Designer & Web Developer",
              url: "https://tombp.fr",
              sameAs: ["https://github.com/Tomi-Tom", "https://linkedin.com/in/tom-bariteau-peter"],
              knowsAbout: [
                "UX Design",
                "UI Design",
                "Web Development",
                "React",
                "TypeScript",
                "Three.js",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
