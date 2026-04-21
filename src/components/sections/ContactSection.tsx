import ContactForm from '@/components/contact/ContactForm';

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="bg-primary-light">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-3 text-center">
          Få projektuppdateringar
        </h2>
        <p className="text-base text-text-muted leading-relaxed mb-8 text-center">
          Lämna dina kontaktuppgifter så hör vi av oss när ny data eller nya funktioner tillkommer.
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
