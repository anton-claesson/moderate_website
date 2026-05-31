import ContactForm from '@/components/contact/ContactForm';

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="textured-canvas border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-12 sm:py-12">
        <div className="w-16 h-px bg-accent mb-6" />
        <h2 className="max-w-3xl text-3xl sm:text-5xl text-on-canvas leading-tight mb-3 text-left font-display">
          HJÄLP OSS STOPPA (S) NYA MILJONPROGRAM
        </h2>
        <p className="max-w-3xl font-body text-base leading-relaxed mb-10 text-left text-on-canvas/75">
          Tillsammans kan vi stoppa planerna. Lämna dina kontaktuppgifter här.
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
