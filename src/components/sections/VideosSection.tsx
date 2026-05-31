'use client';

import Script from 'next/script';

interface VideosSectionProps {
  id: string;
}

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="textured-canvas border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Left: text column with red left border */}
          <div className="w-full md:w-3/5 border-l-2 border-accent pl-8 md:pl-10 space-y-8">
            <p className="font-body text-2xl sm:text-2xl leading-snug text-on-canvas/60">
              Socialdemokraternas svar till boende som inte vill tvångsblandas:{' '}
              <span className="font-semibold text-accent">Flytta.</span>
            </p>
            <blockquote className="font-display text-accent pt-8 text-3xl sm:text-4xl md:text-5xl leading-tight">
              &ldquo;Vill de inte bo där så är de välkomna att flytta.&rdquo;
            </blockquote>
            <div className="space-y-4 pt-8">
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75">
                Det sade en Socialdemokratisk företrädare under Stockholms regionfullmäktige den 11
                november 2025, när den regionala utvecklingsplanen och den nya inriktningen för
                bostadsbyggandet i länet debatterades.
              </p>
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75">
                När stockholmarna ber om ett äppelträd i bakgården placerar Socialdemokraterna där i
                stället ett regionalt miljonprogram — och de drar sig inte för att berätta om det.
              </p>
            </div>
          </div>

          {/* Right: tweet embed */}
          <div className="w-full md:w-42/100 flex-shrink-0 [&_iframe]:!mt-0 [&_.twitter-tweet]:!mt-0">
            <blockquote className="twitter-tweet" data-lang="sv" data-theme="dark" data-dnt="true">
              <a href="https://x.com/ktamsons/status/1988546499555348891">Laddar inlägg…</a>
            </blockquote>
          </div>
        </div>
      </div>

      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
    </section>
  );
}
