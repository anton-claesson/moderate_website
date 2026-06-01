import ContactForm from '@/components/contact/ContactForm';

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="textured-canvas border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-12 sm:py-12">
        <div className="text-left border-l-2 border-accent pl-8 space-y-3 mb-10">
          <h2 className="max-w-3xl font-display text-3xl sm:text-4xl leading-snug text-on-canvas/90">
            HJÄLP OSS STOPPA (S) NYA MILJONPROGRAM
          </h2>
          <p className="max-w-3xl font-body text-base sm:text-lg leading-snug text-on-canvas/75">
            Tillsammans kan vi stoppa planerna. Lämna dina kontaktuppgifter här.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
