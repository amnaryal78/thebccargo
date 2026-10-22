import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Navigation, UserRound } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../design/primitives/Button';
import { Modal } from '../design/primitives/Modal';
import { Spotlight } from '../components/ui/spotlight';
import { StoryJourney } from '../components/about/StoryJourney';

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
  qualification?: string[];
}

const TEAM: Member[] = [
  {
    slug: 'ramesh-aryal',
    name: 'Ramesh Aryal',
    role: 'Founder and owner',
    photo: '/team/ramesh-aryal.jpg',
    duties: ['Managing clients', 'Answering calls', 'Handling the office', 'Packaging products', 'Creating bills'],
  },
  {
    slug: 'ayush-aryal',
    name: 'Ayush Aryal',
    role: 'IT Head & Manager',
    photo: '/team/ayush-aryal.jpg',
    duties: [
      'Handling the website, auto billing desktop app and Android app',
      'Handling the database',
      'Social media control',
      'Managing electronic data',
      'Finance report',
    ],
    qualification: [
      'Studying Grade 12 at NRMV Simara',
      'Deep knowledge of computers and technology',
      'Understands networks, devices and APIs',
    ],
  },
];

/** Shows the member's photo, or their initials until a photo is added. */
const Avatar: React.FC<{ member: Member; size: 'md' | 'lg' }> = ({ member, size }) => {
  const [failed, setFailed] = useState(false);
  const box = size === 'lg' ? 'w-28 h-28 text-3xl' : 'w-16 h-16 text-xl';
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('');
  return failed ? (
    <span
      className={`${box} rounded-full bg-[var(--oxford-deep,#002147)] text-[var(--gold)] font-heading font-extrabold flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      {initials}
    </span>
  ) : (
    <img
      src={member.photo}
      alt={member.name}
      onError={() => setFailed(true)}
      className={`${box} rounded-full object-cover border border-[var(--line)] shrink-0`}
    />
  );
};

export const AboutPage: React.FC = () => {
  const [open, setOpen] = useState<Member | null>(null);

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)]">
      <SEOHead
        title="About Us | The BC Cargo & Courier"
        description="The BC Cargo & Courier (The Black Coffee Cargo & Courier) sends parcels and cargo from Hetauda, Nepal to countries around the world."
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
              <Link to="/rates">
                <Button variant="primary">Price</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Contact us</Button>
              </Link>
            </div>
          </header>

          <section className="space-y-5" aria-labelledby="our-team">
            <h2 id="our-team" className="font-heading font-extrabold text-2xl tracking-tight">Our team</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TEAM.map((m) => (
                <li key={m.slug}>
                  <Spotlight
                    intensity="normal"
                    className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center gap-4 w-full">
                      <Avatar member={m} size="md" />
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="font-heading font-bold text-lg leading-tight">{m.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{m.role}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setOpen(m)} leftIcon={<UserRound className="w-4 h-4" />}>
                        View profile
                      </Button>
                    </div>
                  </Spotlight>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <StoryJourney />

      {/* Finale: the story ends with a way to reach us */}
      <section
        aria-labelledby="finale-title"
        className="relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FA] to-white text-[#002147] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 transition-colors"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-12rem] left-1/2 -translate-x-1/2 w-[44rem] max-w-[140%] aspect-square rounded-full -z-10"
          style={{ background: 'radial-gradient(closest-side, rgba(242,183,5,0.14), transparent)' }}
        />
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <h2 id="finale-title" className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-[1.15] max-w-3xl">
            From a name people remembered
            <br />
            <span className="text-[#8C6400]">to a name that moves your world.</span>
          </h2>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONTACTS.map(({ Icon, label, value, href, external }) => (
              <li key={label}>
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
                    <span className="w-12 h-12 rounded-full bg-[var(--gold)] text-[#002147] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 leading-snug">
                      <span className="block text-sm text-slate-600">{label}</span>
                      <span className="block font-heading font-bold text-lg break-words">{value}</span>
                    </span>
                  </a>
                </Spotlight>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a href="tel:+977057591816">
              <Button variant="primary" size="lg" magnetic leftIcon={<Phone className="w-5 h-5" />}>
                Call now
              </Button>
            </a>
            <Link to="/rates">
              <Button variant="outline" size="lg" className="!text-[#002147] !border-[#002147]/40">
                Check price
              </Button>
            </Link>
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
