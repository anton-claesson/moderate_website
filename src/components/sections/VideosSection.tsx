'use client';

import Script from 'next/script';

interface VideosSectionProps {
  id: string;
}

const TWEET_URL = 'https://x.com/ktamsons/status/1988546499555348891';

export default function VideosSection({ id }: VideosSectionProps) {
  return (
    <section id={id} className="textured-canvas cv-section border-border">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-10 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Left: text column with red left border */}
          <div className="w-full md:w-3/5 space-y-8">
            <p className="font-body font-bold uppercase tracking-wide text-lg sm:text-xl leading-snug text-on-canvas/75 hyphens-auto">
              Socialdemokraternas svar till boende som inte vill tvångsblandas:
            </p>
            <a href={TWEET_URL} target="_blank" rel="noopener noreferrer" className="block">
              <blockquote className="sticker sticker-lift rounded-lg bg-map-bg p-6 sm:p-8 font-display text-3xl sm:text-4xl leading-tight text-on-canvas uppercase">
                &ldquo;Vill de inte bo där så är de välkomna att{' '}
                <span className="text-accent">flytta</span>.&rdquo;
              </blockquote>
            </a>
            <div className="space-y-4">
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
                Det sade en Socialdemokratisk företrädare under Stockholms regionfullmäktige den 11
                november 2025, när den regionala utvecklingsplanen och den nya inriktningen för
                bostadsbyggandet i länet debatterades.
              </p>
              <p className="font-body text-base sm:text-lg leading-relaxed text-on-canvas/75 hyphens-auto">
                När stockholmarna ber om ett äppelträd i bakgården placerar Socialdemokraterna där i
                stället ett regionalt miljonprogram — och de drar sig inte för att berätta om det.
              </p>
            </div>
          </div>

          {/* Right: tweet embed */}
          <div className="w-full md:w-42/100 flex-shrink-0 [&_iframe]:!mt-0 [&_.twitter-tweet]:!mt-0">
            <blockquote className="twitter-tweet" data-lang="sv" data-theme="dark" data-dnt="true">
              <a href={TWEET_URL}>Laddar inlägg…</a>
            </blockquote>
          </div>
        </div>
      </div>

      <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
    </section>
  );
}
