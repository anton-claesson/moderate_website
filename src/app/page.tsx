import Footer from '@/components/Footer';
import IntroSection from '@/components/sections/IntroSection';
import IntroInfoSection from '@/components/sections/IntroInfoSection';
import MapSection from '@/components/sections/MapSection';
import VideosSection from '@/components/sections/VideosSection';
import VisualizerSection from '@/components/sections/VisualizerSection';
import ContactSection from '@/components/sections/ContactSection';
import NewsSection from '@/components/sections/NewsSection';
import { MUNICIPALITY_CENTROIDS } from '@/data/municipalityCentroids';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  let initialMunicipality = typeof params.m === 'string' ? params.m : undefined;

  if (initialMunicipality) {
    const searchName = decodeURIComponent(initialMunicipality).toLowerCase();
    const matched = Object.keys(MUNICIPALITY_CENTROIDS).find(
      (key) => key.toLowerCase() === searchName,
    );
    initialMunicipality = matched || undefined;
  }

  return (
    <div className="relative isolate bg-canvas flex flex-col flex-1 w-full">
      {/* Single page-wide grain layer behind the (transparent) sections — one
          GPU-composited, normally-scrolling layer instead of a fixed grain per
          section (which caused scroll lag). */}
      <div aria-hidden className="page-grain" />
      <main className="relative z-10 flex flex-col flex-1 w-full">
        <IntroSection id="intro" />
        <MapSection id="map" initialMunicipality={initialMunicipality} />
        <IntroInfoSection id="intro-info" />
        <VideosSection id="videos" />
        <VisualizerSection id="visualizer" />
        <NewsSection id="news" />
        <ContactSection id="contact" />
      </main>
      <Footer />
    </div>
  );
}
