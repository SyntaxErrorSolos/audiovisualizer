import { Inter } from "next/font/google";
import "./globals.css";

const interFont = Inter({
  subsets: ["latin"],
  weight: ["200", "500", "800", "900"],
});

export const metadata = {
  title: "Audio Visualizer",
  description: "Simple audio visualizer created using three.js and next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${interFont.className} antialiased`}>{children}</body>
    </html>
  );
}
