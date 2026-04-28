import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroSection from '@/components/sections/IntroSection';
import MapSection from '@/components/sections/MapSection';
import VideosSection from '@/components/sections/VideosSection';
import ContactSection from '@/components/sections/ContactSection';
import DataNoteSection from '@/components/sections/DataNoteSection';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const initialMunicipality = typeof params.m === 'string' ? params.m : undefined;

  return (
    <>
      {/* <Header /> */}
      <main className="flex flex-col flex-1 w-full">
        <IntroSection id="intro" />
        <MapSection id="map" initialMunicipality={initialMunicipality} />
        <VideosSection id="videos" />
        <ContactSection id="contact" />
        {/* <DataNoteSection id="data-note" /> */}
      </main>
      <Footer />
    </>
  );
}
