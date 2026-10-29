import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { BcLogo } from '../BcLogo';
import { CoffeeScene } from './CoffeeScene';
import { ScrollTimeline, TimelineItem } from '../story/ScrollTimeline';

interface Chapter {
  id: string;
  step: string;
  title: string;
  text: React.ReactNode;
  /** The coffee chapter gets its own visual scene. */
  scene?: 'coffee';
}

const CHAPTERS: Chapter[] = [
  {
    id: 'origin',
    step: 'Origin',
    title: 'It started with BC',
    text: 'The family of our proprietor, Mr. Ramesh Aryal, began their social media pages under the name “BC”.',
  },
  {
    id: 'recognition',
    step: 'Recognition',
    title: 'A name people remembered',
    text: 'The name turned out to be lucky for us. We started earning well, and people began to know us.',
  },
  {
    id: 'journey',
    step: 'Journey',
    title: 'From a nickname to a business',
    text: 'So we gave our lucky nickname, “BC”, to our cargo and courier business.',
  },
  {
    id: 'meaning',
    step: 'Meaning',
    title: 'BC = Black Coffee',
    text: (
      <>
        <strong>The BC Cargo &amp; Courier</strong> stands for{' '}
        <strong className="text-[#8C6400]">The Black Coffee Cargo &amp; Courier</strong>. Black
        coffee is our proprietor’s favourite drink, and the nickname was already lucky for us.
      </>
    ),
    scene: 'coffee',
  },
  {
    id: 'today',
    step: 'Today',
    title: 'The name behind The BC Cargo & Courier',
    text: 'Today that lucky name sends parcels and cargo from Hetauda to countries around the world.',
  },
];

export const StoryJourney: React.FC = () => {
  const reduce = !!useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  // Small drift on the opening mark
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const markY = useTransform(heroProgress, [0, 1], [0, 60]);

  return (
    <section
      aria-labelledby="story-title"
      className="relative isolate overflow-hidden bg-[#EEF3FA] text-ox-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 transition-colors"
    >
      {/* soft light behind the opening */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] max-w-[140%] aspect-square rounded-full -z-10"
        style={{ background: 'radial-gradient(closest-side, rgba(242,182,50,0.2), transparent)' }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Opening */}
        <div ref={heroRef} className="flex flex-col items-center text-center gap-6 pb-14 sm:pb-20">
          <motion.div style={reduce ? undefined : { y: markY }} className="bc-float">
            <BcLogo variant="mark-only" size="xl" />
          </motion.div>
          <motion.h2
            id="story-title"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] max-w-3xl"
          >
            Every journey starts with a name.
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-lg sm:text-xl text-slate-600 max-w-xl"
          >
            Before BC became a cargo company, it was simply a name.
          </motion.p>
        </div>

        <ScrollTimeline alternate>
          {CHAPTERS.map((chapter, i) => (
            <TimelineItem key={chapter.id}>
              <div className={`p-5 sm:p-6 flex flex-col gap-4 ${chapter.scene ? 'sm:flex-row sm:items-center' : ''}`}>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-semibold text-[#8C6400]">
                    {i + 1}. {chapter.step}
                  </p>
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl leading-tight">{chapter.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed [&_strong]:text-ox-900">
                    {chapter.text}
                  </p>
                </div>
                {chapter.scene === 'coffee' && (
                  <CoffeeScene className="w-40 h-36 sm:w-44 sm:h-40 mx-auto sm:mx-0 shrink-0" />
                )}
              </div>
            </TimelineItem>
          ))}
        </ScrollTimeline>

        {/* The full original wording stays available */}
        <details className="group mt-14 max-w-2xl mx-auto rounded-[var(--r-md)] border border-[#D5DEEA] bg-white">
          <summary className="cursor-pointer list-none px-5 py-4 min-h-[48px] flex items-center justify-between gap-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-[var(--r-md)]">
            <span>Read the story in full</span>
            <span aria-hidden="true" className="text-[#8C6400] transition-transform group-open:rotate-45 text-xl leading-none">
              +
            </span>
          </summary>
          <div className="px-5 pb-5 space-y-3 text-slate-600 leading-relaxed">
            <p>
              Our story starts with the family of our proprietor, Mr. Ramesh Aryal. They began their social media pages
              under the name “BC”. The name turned out to be lucky for us. We started earning well, and people began to
              know us.
            </p>
            <p>So we gave our lucky nickname, “BC”, to our cargo and courier business.</p>
            <p>
              The BC Cargo &amp; Courier stands for The Black Coffee Cargo &amp; Courier. Black coffee is our proprietor’s
              favourite drink, and the nickname was already lucky for us.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
};
