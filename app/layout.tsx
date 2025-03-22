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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v6.0.0-beta3/css/all.css" />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className="antialiased font-roboto">
        {children}
      </body>
    </html>
  );
}

