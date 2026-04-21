interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-primary-light">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-16 sm:py-24">
        <h2
          className="font-bold text-center leading-[1.1] mb-8 uppercase"
          style={{
            fontSize: 'clamp(2rem, 9vw, 5rem)',
            transform: 'scaleX(0.9)',
            transformOrigin: 'center',
          }}
        >
          Stoppa <span className="whitespace-nowrap">Miljonprogrammet!</span>
        </h2>
        <p className="text-xl text-text-muted leading-relaxed mb-6">
          Var byggs det bostäder i Stockholmsregionen — och var planeras det att byggas? Den här
          kartan visar befintliga och planerade bostäder som tredimensionella volymer, så att du på
          ett ögonblick kan se var bebyggelsen är tät och var ny byggrätt tillkommer.
        </p>
        <p className="text-base text-text-muted leading-relaxed mb-6">
          Verktyget riktar sig till allmänheten och journalister som vill förstå Stockholms
          bostadsutveckling utan att behöva tolka komplexa datamängder.
        </p>
      </div>
    </section>
  );
}
