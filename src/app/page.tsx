import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TabsSection } from "@/components/landing/TabsSection";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TabsSection />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
