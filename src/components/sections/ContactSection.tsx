import ContactForm from '@/components/contact/ContactForm';
import BirdFlock from '@/components/ui/BirdFlock';

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="textured-canvas cv-section border-border overflow-hidden">
      <BirdFlock
        filterId="birds-contact"
        variant="contact"
        className="left-3 sm:left-10 bottom-10 w-48 sm:w-80"
      />
      <BirdFlock
        filterId="birds-contact-top"
        variant="info"
        className="right-2 sm:right-10 top-8 w-40 sm:w-64"
      />
      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-10 py-8 sm:py-12">
        <div className="space-y-3 mb-10">
          <h2 className="max-w-3xl font-display text-3xl sm:text-4xl leading-snug text-on-canvas/90 uppercase">
            HJÄLP OSS STOPPA (S) NYA <span className="text-accent">MILJONPROGRAM</span>
          </h2>
          <p className="max-w-3xl font-body text-base sm:text-lg leading-snug text-on-canvas/75 hyphens-auto">
            Tillsammans kan vi stoppa planerna. Lämna dina kontaktuppgifter här.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
