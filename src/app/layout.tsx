import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Activos - Faena Minera",
  description: "Sistema de control de préstamos e inspección de herramientas críticas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-background text-text-main selection:bg-accent selection:text-surface">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}