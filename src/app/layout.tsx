import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
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
