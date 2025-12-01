import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "potrzebny.ai - AI dla edukacji, zdrowia i researchu",
  description:
    "Platforma AI wspierająca naukę, zdrowie i badania. Transkrypcja, notatki, quizy i flashcards dostosowane do Twojego stylu uczenia się.",
  keywords: ["AI", "edukacja", "transkrypcja", "ADHD", "dysleksja", "nauka"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
