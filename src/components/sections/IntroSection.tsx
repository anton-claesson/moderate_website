interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section
      id={id}
      className="min-h-[10vh] w-full flex flex-col items-center center bg-primary-light"
    >
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 pt-10 pb-4 sm:pt-20 sm:pb-10">
        <h2
          className="font-bold text-center leading-[1.2] mb-4 sm:mb-8 uppercase w-full italic"
          style={{ fontSize: 'min(6.5vw, 5rem)' }}
        >
          <span className="text-red-700">
            Stoppa Miljonprogrammen
            <br className="sm:hidden" /> – Riv Bilagan!
          </span>
        </h2>
        <div className="mx-auto max-w-4xl text-justify text-slate-900 space-y-3 sm:space-y-6">
          <p className="text-base sm:text-xl leading-relaxed">
            <span className="font-bold">Beslutat: </span>
            577 000 nya lägenheter i Region Stockholm. Nya miljonprogram – i parken, vid torget och
            där du bor.
          </p>

          <p className="text-base sm:text-xl leading-relaxed">
            Planen drivs av Socialdemokraterna i Region Stockholm och har klubbats igenom av
            ordförande Aida Hadzialic (S). I en bilaga målas kommun efter kommun upp för snabb,
            genomgripande förändring – med tät, storskalig bebyggelse.
          </p>

          <p className="text-base sm:text-xl leading-relaxed">
            Riv upp bilagan. Ställ de ansvariga till svars.
          </p>

          <p className="text-base sm:text-xl leading-relaxed">
            👉 Se hur de nya miljonprogrammen påverkar din hemkommun!
          </p>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            <strong>Fakta: </strong>
            Socialdemokraterna, Vänsterpartiet, Miljöpartiet och Centerpartiet i Region Stockholm
            har beslutat om en ny regional utvecklingsplan. I planen ingår en bilaga som fastställer
            hur många bostäder varje kommun ska bygga – på begränsad yta. I praktiken innebär det
            att kommuner pressas att bygga högt och tätt i redan bebyggda områden för att nå målen.
            Konsekvensen är att grönytor, småhusområden och befintliga bostadsmiljöer tas i anspråk.
            Kommuner som inte följer planen hotas bli utan investeringar i kollektivtrafik,
            infrastruktur och vård.
          </p>
        </div>
      </div>
    </section>
  );
}
