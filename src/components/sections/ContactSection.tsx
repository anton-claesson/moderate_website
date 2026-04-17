interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="min-h-[50vh] flex items-center bg-primary-light">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-16">
        <p className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
          Contact
        </p>
        <div className="h-48 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center">
          <span className="text-text-muted text-sm">
            Newsletter / contact form — coming in F5.1
          </span>
        </div>
      </div>
    </section>
  );
}
