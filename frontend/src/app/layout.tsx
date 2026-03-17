import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tom Bariteau-Peter — UX Designer & Developer",
  description:
    "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul. Crafting immersive digital experiences.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
