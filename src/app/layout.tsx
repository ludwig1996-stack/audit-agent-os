import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuditAgent Enterprise OS",
  description: "Next-generation auditing and compliance platform",
  other: {
    "camera-description": "Used for scanning physical audit evidence (OCR).",
    "microphone-description": "Used for real-time ISA compliance voice interviews."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}
