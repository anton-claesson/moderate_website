import ContactForm from '@/components/contact/ContactForm';

interface ContactSectionProps {
  id: string;
}

export default function ContactSection({ id }: ContactSectionProps) {
  return (
    <section id={id} className="bg-canvas">
      <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-12 sm:py-12">
        <div className="w-16 h-px bg-accent mb-6 mx-auto" />
        <h2 className="text-3xl sm:text-5xl text-on-canvas leading-tight mb-3 text-center font-display">
          Stoppa miljonprogrammen! Din röst behövs.
        </h2>
        <p
          className="font-body text-base leading-relaxed mb-10 text-center"
          style={{ color: 'rgba(242,240,235,0.55)' }}
        >
          Lämna dina kontaktuppgifter så hör vi av oss när information tillkommer.
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
