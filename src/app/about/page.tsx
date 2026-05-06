import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about the Pixel Art Editor, our mission, and the technology behind our premium dark-themed design tools.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tighter mb-8">About Pixel Art Editor</h1>
      
      <div className="space-y-12 leading-relaxed">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">The Vision</h2>
          <p className="opacity-70">
            Pixel Art Editor was born out of a desire for a professional-grade, distraction-free creative environment. 
            We believe that tools should not only be functional but also beautiful and inspiring. 
            Our dark-themed aesthetic is designed to reduce eye strain and keep the focus entirely on your art.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">The Technology</h2>
          <p className="opacity-70">
            Built with the latest technologies including Next.js 14, Tailwind CSS 4, and MongoDB. 
            Our editor uses high-performance canvas rendering to ensure a smooth drawing experience even at large grid sizes.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-accent">Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold uppercase tracking-wider">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Custom Grid Sizes</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Frame-based Animation</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Multi-format Export</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Cloud Project Management</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Guest Mode Support</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent" /> Mobile Responsive</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
