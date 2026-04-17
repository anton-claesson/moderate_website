interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-zinc-50">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">Contact</p>
        <div className="h-48 rounded-lg bg-white border border-dashed border-zinc-300 flex items-center justify-center">
          <span className="text-zinc-400 text-sm">Newsletter / contact form — coming in F5.1</span>
        </div>
      </div>
    </section>
  );
}
