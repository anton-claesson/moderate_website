interface DataNoteSectionProps {
  id: string;
}

export default function DataNoteSection({ id }: DataNoteSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-primary-light">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-16 sm:py-24">
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
