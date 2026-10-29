import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, MessageCircle, Navigation, UserRound, ExternalLink, Calculator, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Modal } from '../design/primitives/Modal';
import { Spotlight } from '../components/ui/spotlight';
import { Cta3D } from '../components/ui/Cta3D';
import { StoryJourney } from '../components/about/StoryJourney';
import { PAGE_META } from '../data/pageMeta';

const CONTACTS = [
  { Icon: Phone, label: 'Call us', value: '057-591816', href: 'tel:+977057591816', external: false },
  { Icon: MessageCircle, label: 'WhatsApp and mobile', value: '9855019485', href: 'https://wa.me/9779855019485', external: true },
  {
    Icon: Navigation,
    label: 'Visit our office',
    value: 'School Road -4, Hetauda',
    href: 'https://www.google.com/maps/search/?api=1&query=School+Road+Hetauda+Nepal',
    external: true,
  },
];

interface Member {
  slug: string;
  name: string;
  role: string;
  /** Put a photo at public/team/<slug>.jpg and it shows up here automatically. */
  photo: string;
  duties: string[];
  /** Short labels shown on the team card; the full duties are in the profile. */
  highlights: string[];
  qualification?: string[];
  phone?: { label: string; href: string };
  portfolio?: string;
}

const TEAM: Member[] = [
  {
    slug: 'ramesh-aryal',
    name: 'Ramesh Aryal',
    role: 'Founder & Owner',
    photo: '/team/ramesh-aryal.jpg',
    duties: [
      'Sets the business strategy, prices and services',
      'Builds and keeps relationships with clients and overseas partners',
      'Oversees daily operations at the Hetauda office',
      'Makes sure every parcel meets our service standard',
      'Leads and develops the team',
    ],
    highlights: ['Strategy', 'Client relationships', 'Team leadership'],
  },
  {
    slug: 'ayush-aryal',
    name: 'Ayush Aryal',
    role: 'IT Head & Manager',
    photo: '/team/ayush-aryal.jpg',
    duties: [
      'Builds and runs the website, the billing desktop app and the Android app',
      'Keeps the shipment and customer database accurate, backed up and secure',
      'Manages online tracking, rate updates and the price calculator',
      'Looks after office computers, network, printers and staff accounts',
      'Runs the company social media pages',
      'Prepares monthly sales and finance reports for the owner',
    ],
    highlights: ['Website & apps', 'Database & security', 'IT support', 'Reports'],
    phone: { label: '9823716862', href: 'tel:+9779823716862' },
    portfolio: 'https://dumarwana.vercel.app',
    qualification: [
      'Grade 12 student at NRMV Simara',
      'Builds web and mobile apps (React, TypeScript, Android)',
      'Works with databases, networks and APIs',
    ],
  },
];

/** Shows the member's photo, or their initials until a photo is added. */
const Avatar: React.FC<{ member: Member; size: 'md' | 'lg' }> = ({ member, size }) => {
  const [failed, setFailed] = useState(false);
  const box = size === 'lg' ? 'w-28 h-28 text-3xl rounded-full' : 'w-24 h-24 sm:w-28 sm:h-28 text-2xl rounded-[var(--r-md)]';
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('');
  return failed ? (
    <span
      className={`${box} bg-[var(--oxford-deep,#0B2D63)] text-[var(--gold)] font-heading font-extrabold flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      {initials}
    </span>
  ) : (
    <img
      src={member.photo}
      alt={member.name}
      onError={() => setFailed(true)}
      width={112}
      height={112}
      loading="lazy"
      decoding="async"
      className={`${box} object-cover border border-[var(--line-strong)] shadow-[0_8px_20px_-12px_rgba(11,45,99,0.45)] shrink-0`}
    />
  );
};

/** Shared CTA styles: real links styled as buttons (no button nested inside a link). */
const CTA_PRIMARY =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-[var(--r-sm)] bg-[var(--gold)] text-ox-900 font-heading font-extrabold text-sm whitespace-nowrap shadow-[0_4px_0_#0B2D63] hover:bg-[#FAC623] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-900 focus-visible:ring-offset-2';
const CTA_OUTLINE =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-[var(--r-sm)] border-2 border-ox-900/30 bg-white/60 text-ox-900 font-heading font-extrabold text-sm whitespace-nowrap hover:border-ox-900 hover:bg-white active:scale-[0.98] transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 focus-visible:ring-offset-2';

export const AboutPage: React.FC = () => {
  const [open, setOpen] = useState<Member | null>(null);
  const reduce = !!useReducedMotion();
  const reveal = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)]">
      <SEOHead
        title={PAGE_META['/about'].title}
        description={PAGE_META['/about'].description}
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto space-y-14 sm:space-y-16">
          <header className="space-y-4 max-w-2xl border-l-4 border-[var(--gold)] pl-5">
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
              About The BC Cargo &amp; Courier
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We send parcels and cargo from Nepal to the world. Our head office is in Hetauda. We keep our prices clear and
              tell you where your parcel is.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Cta3D to="/rates" icon={<Calculator aria-hidden="true" />}>
                Check price
              </Cta3D>
              <Cta3D to="/contact" tone="light" icon={<ArrowRight aria-hidden="true" />}>
                Contact us
              </Cta3D>
            </div>
          </header>

          <section className="space-y-5" aria-labelledby="our-team">
            <h2 id="our-team" className="font-heading font-extrabold text-2xl tracking-tight">Our team</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TEAM.map((m, i) => (
                <motion.li key={m.slug} {...reveal(i)}>
                  <Spotlight
                    intensity="normal"
                    className="h-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm overflow-hidden"
                  >
                    <article className="flex flex-col gap-4 p-5 h-full">
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        <div className="relative shrink-0">
                          <Avatar member={m} size="md" />
                          <span aria-hidden="true" className="absolute -bottom-1 left-3 right-3 h-1 rounded-full bg-[var(--gold)]" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <h3 className="font-heading font-extrabold text-xl leading-tight text-ox-900">{m.name}</h3>
                          <p className="mt-0.5 text-sm font-semibold text-[var(--gold-dark)]">{m.role}</p>
                          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`What ${m.name.split(' ')[0]} looks after`}>
                            {m.highlights.map((d) => (
                              <li key={d} className="px-2 py-0.5 rounded-full bg-[#EEF3F9] text-[11.5px] font-medium text-[#123562] leading-snug">
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--line)]">
                        <button
                          type="button"
                          onClick={() => setOpen(m)}
                          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-[var(--r-sm)] border border-ox-900/25 text-ox-900 text-sm font-heading font-bold hover:border-ox-900 hover:bg-[#EEF3F9] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
                        >
                          <UserRound className="w-4 h-4" aria-hidden="true" />
                          <span>View profile</span>
                        </button>
                        {m.portfolio && (
                          <a
                            href={m.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-[var(--r-sm)] bg-ox-900 text-white text-sm font-heading font-bold hover:bg-[#123562] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 focus-visible:ring-offset-2"
                          >
                            <span>Portfolio</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gd-500" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        )}
                        {m.phone && (
                          <a
                            href={m.phone.href}
                            aria-label={`Call ${m.name}`}
                            className="inline-flex items-center gap-1.5 min-h-[40px] px-2.5 rounded-[var(--r-sm)] text-sm font-mono text-ox-900 hover:bg-[#EEF3F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
                          >
                            <Phone className="w-4 h-4 text-[var(--gold-dark)]" aria-hidden="true" />
                            <span>{m.phone.label}</span>
                          </a>
                        )}
                      </div>
                    </article>
                  </Spotlight>
                </motion.li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <StoryJourney />

      {/* Finale: the story ends with a way to reach us */}
      <section
        aria-labelledby="finale-title"
        className="relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FA] to-white text-ox-900 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 transition-colors"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-12rem] left-1/2 -translate-x-1/2 w-[44rem] max-w-[140%] aspect-square rounded-full -z-10"
          style={{ background: 'radial-gradient(closest-side, rgba(242,182,50,0.14), transparent)' }}
        />
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <h2 id="finale-title" className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-[1.15] max-w-3xl">
            From a name people remembered
            <br />
            <span className="text-[#8C6400]">to a name that moves your world.</span>
          </h2>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONTACTS.map(({ Icon, label, value, href, external }, i) => (
              <motion.li key={label} {...reveal(i)}>
                <Spotlight
                  intensity="normal"
                  className="rounded-[var(--r-md)] border border-[#D5DEEA] bg-white shadow-sm overflow-hidden"
                >
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 w-full min-h-[84px] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-[var(--r-md)]"
                  >
                    <span className="w-12 h-12 rounded-full bg-[var(--gold)] text-ox-900 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 leading-snug">
                      <span className="block text-sm text-slate-600">{label}</span>
                      <span className="block font-heading font-bold text-lg break-words">{value}</span>
                    </span>
                  </a>
                </Spotlight>
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Cta3D href="tel:+977057591816" icon={<Phone aria-hidden="true" />}>
              Call now
            </Cta3D>
            <Cta3D to="/rates" tone="light" icon={<Calculator aria-hidden="true" />}>
              Check price
            </Cta3D>
          </div>
        </div>
      </section>

      <Modal isOpen={open !== null} onClose={() => setOpen(null)} title={open?.name ?? ''} description={open?.role} maxWidth="md">
        {open && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar member={open} size="lg" />
              <div>
                <p className="font-heading font-bold text-xl">{open.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{open.role}</p>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-base mb-2">Duties</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
                {open.duties.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            {(open.phone || open.portfolio) && (
              <div className="flex flex-wrap gap-2">
                {open.phone && (
                  <a href={open.phone.href} className={CTA_OUTLINE}>
                    <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{open.phone.label}</span>
                  </a>
                )}
                {open.portfolio && (
                  <a href={open.portfolio} target="_blank" rel="noopener noreferrer" className={CTA_PRIMARY}>
                    <span>View portfolio</span>
                    <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            {open.qualification && (
              <div>
                <h3 className="font-heading font-bold text-base mb-2">Qualification</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
                  {open.qualification.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
