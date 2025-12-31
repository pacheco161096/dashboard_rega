import type { Metadata } from "next";
import "../globals.css";
import { Navbar } from "@/components/molecules/Navbar/Navbar";
import s from '../global.module.css'
import ProtectedRoute from '@/components/ProtectedRoute'
import InfoClient from "@/components/molecules/InfoClient/InfoClient";
import { Toaster } from "@/components/ui/toaster";
import { SectionTitle } from "@/components/molecules/SectionTitle/SectionTitle";

export const metadata: Metadata = {
  title: "Control Panel - Regatelecom",
  description: "Control Panel - Regatelecom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute >
      <html lang="en">
        <body
          className={s.body}
        >
          <div className={s.background}>
          <Navbar/>
          <div className={s.container}>
            <div className={s.main}>
            <header className={s.header}>
              <SectionTitle />
              <InfoClient />
            </header>
            {children}
            </div>
            <Toaster />
          </div>
          </div>
        </body>
      </html>
    </ProtectedRoute>
  );
}
