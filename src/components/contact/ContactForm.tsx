'use client';

import { useState } from 'react';
import { MUNICIPALITY_CENTROIDS } from '@/data/municipalityCentroids';

const SORTED_MUNICIPALITIES = Object.keys(MUNICIPALITY_CENTROIDS).sort();

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
  namn: string;
  epost: string;
  telefon: string;
  kommun: string;
  gdprConsent: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [fields, setFields] = useState<FormFields>({
    namn: '',
    epost: '',
    telefon: '',
    kommun: '',
    gdprConsent: false,
  });
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isGdprExpanded, setIsGdprExpanded] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFields((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_REGEX.test(fields.epost)) {
      setErrorMessage('Vänligen ange en giltig e-postadress.');
      setFormState('error');
      return;
    }

    if (!fields.kommun) {
      setErrorMessage('Vänligen välj en kommun.');
      setFormState('error');
      return;
    }

    setFormState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          epost: fields.epost,
          kommun: fields.kommun,
          namn: fields.namn || null,
          telefon: fields.telefon || null,
        }),
      });

      if (res.ok) {
        setFormState('success');
      } else {
        const data = (await res.json()) as { message?: string };
        setErrorMessage(data.message ?? 'Något gick fel. Försök igen senare.');
        setFormState('error');
      }
    } catch {
      setErrorMessage('Kunde inte ansluta. Kontrollera din internetanslutning och försök igen.');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="py-8 text-center">
        <p className="font-body text-2xl font-bold text-on-canvas">
          Tack! Vi hör av oss när projektet uppdateras.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="font-ui">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="epost" className="block text-sm text-on-canvas/60 mb-1">
            E-post <span className="text-accent">*</span>
          </label>
          <input
            id="epost"
            name="epost"
            type="email"
            required
            autoComplete="email"
            value={fields.epost}
            onChange={handleChange}
            className="w-full border-0 border-b border-on-canvas/20 bg-transparent px-0 py-2 text-sm text-on-canvas placeholder:text-on-canvas/35 focus:outline-none focus:ring-0 focus:border-on-canvas/50 focus:bg-on-canvas/5 transition-[border-color,background-color] duration-200"
            placeholder="anna@exempel.se"
          />
        </div>
        <div>
          <label htmlFor="kommun" className="block text-sm text-on-canvas/60 mb-1">
            Kommun <span className="text-accent">*</span>
          </label>
          <select
            id="kommun"
            name="kommun"
            required
            value={fields.kommun}
            onChange={handleChange}
            className="w-full border-0 border-b border-on-canvas/20 bg-transparent px-0 py-2 text-sm text-on-canvas focus:outline-none focus:ring-0 focus:border-on-canvas/50 focus:bg-on-canvas/5 appearance-none cursor-pointer transition-[border-color,background-color] duration-200"
          >
            <option value="" disabled className="text-text-muted">
              Välj en kommun...
            </option>
            <option value="Ingen / Vet ej">Ingen / Vet ej</option>
            {SORTED_MUNICIPALITIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="namn" className="block text-sm text-on-canvas/60 mb-1">
            Namn
          </label>
          <input
            id="namn"
            name="namn"
            type="text"
            autoComplete="name"
            value={fields.namn}
            onChange={handleChange}
            className="w-full border-0 border-b border-on-canvas/20 bg-transparent px-0 py-2 text-sm text-on-canvas placeholder:text-on-canvas/35 focus:outline-none focus:ring-0 focus:border-on-canvas/50 focus:bg-on-canvas/5 transition-[border-color,background-color] duration-200"
            placeholder="Anna Svensson (frivilligt)"
          />
        </div>
        <div>
          <label htmlFor="telefon" className="block text-sm text-on-canvas/60 mb-1">
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            value={fields.telefon}
            onChange={handleChange}
            className="w-full border-0 border-b border-on-canvas/20 bg-transparent px-0 py-2 text-sm text-on-canvas placeholder:text-on-canvas/35 focus:outline-none focus:ring-0 focus:border-on-canvas/50 focus:bg-on-canvas/5 transition-[border-color,background-color] duration-200"
            placeholder="070-000 00 00 (frivilligt)"
          />
        </div>
      </div>

      {formState === 'error' && (
        <p className="text-sm text-accent bg-accent/15 border border-accent/30 rounded-md px-3 py-2 mb-4">
          {errorMessage}
        </p>
      )}

      <div className="mb-6 flex flex-col gap-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="gdprConsent"
            type="checkbox"
            required
            checked={fields.gdprConsent}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-on-canvas/30 accent-accent focus:ring-accent/50"
          />
          <span className="font-body text-[13px] text-on-canvas mt-px leading-[1.4]">
            Jag samtycker till att Moderaterna sparar mina uppgifter och kontaktar mig med
            information om kampanjen.
          </span>
        </label>

        <div className="ml-7">
          <button
            type="button"
            onClick={() => setIsGdprExpanded((p) => !p)}
            className="font-body text-xs font-semibold text-accent hover:text-accent-hover transition-colors duration-150 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-sm"
          >
            {isGdprExpanded ? 'Visa färre detaljer' : 'Läs mer om hur vi hanterar dina uppgifter'}
          </button>

          {isGdprExpanded && (
            <div className="font-body mt-3 text-xs text-on-canvas/55 leading-relaxed space-y-3 border-l-2 border-accent/20 pl-3">
              <p>
                Genom att lämna dina kontaktuppgifter samtycker du till att vi på Moderaterna då och
                då hör av oss till dig med information om kampanjen och andra nyheter från
                Moderaterna. Uppgifterna för detta specifika projekt lagras enbart i en databas inom
                EU, delas ej vidare med tredje part i övrigt, och kan raderas helt från projektets
                system på begäran via{' '}
                <a
                  href="mailto:caroline.hellstrom@moderaterna.se"
                  className="underline hover:text-text font-medium"
                >
                  caroline.hellstrom@moderaterna.se
                </a>
                .
              </p>
              <p>
                Vi kan komma att samla in information om din ålder, ditt kön och var du bor för att
                kunna anpassa våra utskick för just dig. Ditt samtycke innebär även att vi använder
                cookieliknande teknik för att samla in statistik om hur våra mailutskick går fram
                och vad mottagare klickar på i våra mailutskick. Vi gör det för att förbättra våra
                utskick och för att anpassa kommande utskick för just dig.
              </p>
              <p>
                Att gå med i kampanjen är självklart gratis och ditt samtycke är frivilligt. Du kan
                när som helst återkalla ditt samtycke eller invända mot vår marknadsföring. Du kan
                även enkelt avregistrera dig från utskick på länken längst ner i våra mail. Du har
                flera andra rättigheter, t.ex. rätten att begära att få information om vilka
                personuppgifter som vi behandlar. Läs mer i vår{' '}
                <a
                  href="https://tillsammans.moderaterna.se/raddalidingo?cb_vid=963#:~:text=mer%20i%20v%C3%A5r-,integritetspolicy,-och%20cookiepolicy."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-text font-semibold"
                >
                  integritetspolicy
                </a>{' '}
                och{' '}
                <a
                  href="https://moderaterna.se/integritetspolicy/om-cookies/?cb_vid=963"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-text font-semibold"
                >
                  cookiepolicy
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!fields.gdprConsent || formState === 'submitting'}
        className="w-full sm:w-auto px-10 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === 'submitting' ? 'Skickar…' : 'Skicka'}
      </button>
    </form>
  );
}
