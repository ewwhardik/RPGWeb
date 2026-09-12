import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Karmaraj | Life RPG",
  description: "The Adventurer's Bureaucracy: Turn mundane chores and real-world grinds into epic RPG progression.",
  openGraph: {
    title: "Karmaraj",
    description: "Level up your life by treating productivity like an RPG.",
    url: "https://rpgweb.dev",
    siteName: "Karmaraj",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Karmaraj: Turn Life Into A Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karmaraj",
    description: "Level up your life by treating productivity like an RPG.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
