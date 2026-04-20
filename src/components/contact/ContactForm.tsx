'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
  namn: string;
  epost: string;
  telefon: string;
  postOrKommun: string;
  gdprConsent: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [fields, setFields] = useState<FormFields>({
    namn: '',
    epost: '',
    telefon: '',
    postOrKommun: '',
    gdprConsent: false,
  });
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFields((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fields.namn.trim()) {
      setErrorMessage('Vänligen ange ditt namn.');
      setFormState('error');
      return;
    }
    if (!EMAIL_REGEX.test(fields.epost)) {
      setErrorMessage('Vänligen ange en giltig e-postadress.');
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
          Namn: fields.namn,
          'E-post': fields.epost,
          Telefon: fields.telefon || undefined,
          'Postnummer/Kommun': fields.postOrKommun || undefined,
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
      <div className="rounded-xl bg-surface border border-border p-8 text-center">
        <p className="text-2xl font-bold text-text mb-2">Tack!</p>
        <p className="text-base text-text-muted">Vi hör av oss när projektet uppdateras.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl bg-surface border border-border p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="namn" className="block text-sm text-text-muted mb-1">
            Namn <span className="text-accent">*</span>
          </label>
          <input
            id="namn"
            name="namn"
            type="text"
            required
            autoComplete="name"
            value={fields.namn}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Anna Svensson"
          />
        </div>
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
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="anna@exempel.se"
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
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="070-000 00 00"
          />
        </div>
        <div>
          <label htmlFor="postOrKommun" className="block text-sm text-text-muted mb-1">
            Postnummer / Kommun
          </label>
          <input
            id="postOrKommun"
            name="postOrKommun"
            type="text"
            autoComplete="postal-code"
            value={fields.postOrKommun}
            onChange={handleChange}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="11234 eller Stockholm"
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
            projektet. Uppgifterna lagras på Formspree&apos;s EU-servrar, används enbart för
            projektuppdateringar och kan raderas på begäran via{' '}
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
        className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === 'submitting' ? 'Skickar…' : 'Skicka'}
      </button>
    </form>
  );
}
