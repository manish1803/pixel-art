import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'PIXEL.ART',
  description: 'A premium, dark-themed pixel art editor and animator built for designers and artists. Create, animate, and export your pixel art with ease.',
};

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen dark text-foreground">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <ShowcaseSection />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </main>
  );
}
