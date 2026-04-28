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
      const res = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          'E-post': fields.epost,
          Kommun: fields.kommun,
          Namn: fields.namn || undefined,
          Telefon: fields.telefon || undefined,
        }),
      });

      if (res.ok) {
        setFormState('success');
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMessage(data.error ?? 'Något gick fel. Försök igen senare.');
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
        <p className="text-2xl font-bold text-text">
          Tack! Vi hör av oss när projektet uppdateras.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="epost" className="block text-sm text-text-muted mb-1">
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
            className="w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0 focus:border-primary"
            placeholder="anna@exempel.se"
          />
        </div>
        <div>
          <label htmlFor="kommun" className="block text-sm text-text-muted mb-1">
            Kommun <span className="text-accent">*</span>
          </label>
          <select
            id="kommun"
            name="kommun"
            required
            value={fields.kommun}
            onChange={handleChange}
            className="w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-text focus:outline-none focus:ring-0 focus:border-primary appearance-none cursor-pointer"
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
          <label htmlFor="namn" className="block text-sm text-text-muted mb-1">
            Namn
          </label>
          <input
            id="namn"
            name="namn"
            type="text"
            autoComplete="name"
            value={fields.namn}
            onChange={handleChange}
            className="w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0 focus:border-primary"
            placeholder="Anna Svensson (frivilligt)"
          />
        </div>
        <div>
          <label htmlFor="telefon" className="block text-sm text-text-muted mb-1">
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            value={fields.telefon}
            onChange={handleChange}
            className="w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-0 focus:border-primary"
            placeholder="070-000 00 00 (frivilligt)"
          />
        </div>
      </div>

      {formState === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {errorMessage}
        </p>
      )}

      <div className="mb-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="gdprConsent"
            type="checkbox"
            required
            checked={fields.gdprConsent}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border accent-primary"
          />
          <span className="text-xs text-text-muted leading-relaxed">
            Jag godkänner att mina uppgifter lagras och används för att skicka information om
            projektet. Uppgifterna lagras enbart på Formspree&apos;s EU-servrar, delas ej med tredje
            part och kan när som helst raderas på begäran via{' '}
            <a href="mailto:jona.haag99@googlemail.com" className="underline hover:text-text">
              jona.haag99@googlemail.com
            </a>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!fields.gdprConsent || formState === 'submitting'}
        className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === 'submitting' ? 'Skickar…' : 'Skicka'}
      </button>
    </form>
  );
}
