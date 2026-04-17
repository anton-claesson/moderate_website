import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroSection from '@/components/sections/IntroSection';
import MapSection from '@/components/sections/MapSection';
import VideosSection from '@/components/sections/VideosSection';
import ContactSection from '@/components/sections/ContactSection';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1">
        <IntroSection id="intro" />
        <MapSection id="map" />
        <VideosSection id="videos" />
        <ContactSection id="contact" />
      </main>
      <Footer />
    </>
  );
}
