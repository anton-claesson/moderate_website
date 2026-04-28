interface IntroSectionProps {
  id: string;
}

export default function IntroSection({ id }: IntroSectionProps) {
  return (
    <section
      id={id}
      className="min-h-[10vh] w-full flex flex-col items-center center bg-primary-light"
    >
      <div className="mx-auto max-w-8xl w-full px-4 sm:px-6 pt-12 pb-8 sm:pt-20 sm:pb-10">
        <h2
          className="font-bold text-center leading-[1.2] mb-8 uppercase w-full flex justify-center"
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 4rem)',
          }}
        >
          <span
            style={{ display: 'inline-block', transform: 'scaleX(0.9)', transformOrigin: 'center' }}
          >
            <span className="text-[#5c8b5a]">
              STOPPA NYA MILJONPROGRAMMEN I STOCKHOLMSREGIONEN.
            </span>
          </span>
        </h2>
        <div className="mx-auto max-w-4xl text-justify text-black">
          <p className="text-xl leading-relaxed mb-6">
            Socialdemokraterna, Vänsterpartiet, Miljöpartiet och Centerpartiet i Region Stockholm
            har beslutat om att det ska byggas nära 600 000 nya bostäder över huvudet på dig som
            invånare. För att deras planer ska bli verklighet kommer kommunerna i länet tvingas till
            storskaliga bostadsprojekt med förtätning och höga hus som förändrar våra bostadsområden
            i grunden. Grönytor kommer att försvinna och din röst som invånare riskerar att
            begränsas. Titta på listan vad planerna kan innebära för din hemkommun.
          </p>
          <p className="text-base text-text-muted leading-relaxed mb-6">
            Fakta: Region Stockholm har fattat beslut om en ny regional utvecklingsplan. I planen
            finns en bilaga tillhörande en lista över hur många bostäder varje kommun måste bygga på
            en mindre yta. Det innebär i praktiken att kommunerna kommer att tvingas behöva bygga
            högt och tätt i redan byggda områden för att uppnå regionens målsättning. Grönytor,
            småhusområden och befintliga bostadsområden kommer att tas i anspråk om detta går
            igenom.
          </p>
        </div>
      </div>
    </section>
  );
}
