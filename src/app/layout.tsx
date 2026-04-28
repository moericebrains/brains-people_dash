import type { Metadata } from "next";
import { Unbounded, Barlow_Condensed, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-unbounded",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brains Culture Dashboard",
  description: "People & culture intelligence for Brains agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${barlowCondensed.variable} ${robotoCondensed.variable}`}>
      <body style={{ fontFamily: "var(--font-body-wide, 'Roboto Condensed', system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
