interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-surface">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
          Om projektet
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-6">
          Stockholms bostadsbestånd, visualiserat i 3D
        </h2>
        <p className="text-lg text-text-muted leading-relaxed mb-4">
          Var byggs det bostäder i Stockholmsregionen — och var planeras det att byggas? Den här
          kartan visar befintliga och planerade bostäder som tredimensionella volymer, så att du på
          ett ögonblick kan se var bebyggelsen är tät och var ny byggrätt tillkommer.
        </p>
        <p className="text-base text-text-muted leading-relaxed mb-8">
          Verktyget riktar sig till allmänheten och journalister som vill förstå Stockholms
          bostadsutveckling utan att behöva tolka komplexa datamängder.
        </p>

        <div className="rounded-lg bg-primary-light border border-border px-5 py-4 text-sm text-text-muted leading-relaxed">
          <span className="font-semibold text-text">Datakällor & metod — </span>
          Data kommer från Lantmäteriet och SCB. De tredimensionella volymerna är schematiska
          (LOD1/LOD2) och visar täthet och placering, inte arkitektonisk form. Informationen är
          avsedd för orientering och beslutsunderlag, inte rättsliga ändamål.
        </div>
      </div>
    </section>
  );
}
