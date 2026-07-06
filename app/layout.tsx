import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regatelecom",
  description: "Sistema Interno",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased font-roboto">
        <link
          rel="stylesheet"
          href="https://pro.fontawesome.com/releases/v6.0.0-beta3/css/all.css"
          precedence="default"
        />
        <link
          href="https://fonts.cdnfonts.com/css/sf-pro-display"
          rel="stylesheet"
          precedence="default"
        />
        {children}
      </body>
    </html>
  );
}
