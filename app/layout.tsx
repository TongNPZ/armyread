import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WH40K Datasheets",
  description: "Warhammer 40K Army Datasheet Viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="wahapedia">{children}</body>
    </html>
  );
}
