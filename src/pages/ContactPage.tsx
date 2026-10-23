import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from '../design/primitives/Button';
import { Input } from '../design/primitives/Input';
import { Spotlight } from '../components/ui/spotlight';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { submitInquiry } from '../services/inquiryService';
import { SEOHead } from '../components/SEOHead';
import { PAGE_META } from '../data/pageMeta';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const CONTACT_ITEMS = [
  { Icon: MapPin, label: 'Address', value: 'School Road -4, Hetauda, Nepal', href: undefined as string | undefined },
  { Icon: Phone, label: 'Phone', value: '057-591816', href: 'tel:+977057591816' },
  { Icon: MessageCircle, label: 'WhatsApp and mobile', value: '9855019485', href: 'https://wa.me/9779855019485' },
  { Icon: Mail, label: 'Email', value: 'thebccargo@gmail.com', href: 'mailto:thebccargo@gmail.com' },
  { Icon: Clock, label: 'Open', value: 'Sunday to Friday, 9:00 AM to 6:00 PM', href: undefined },
];

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', honeypot: '' });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'message', string>>>({});
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return; // bots fill the hidden field

    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email, like name@gmail.com.';
    if (form.message.trim().length < 5) next.message = 'Write a short message.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setSubmitError('');
    const result = await submitInquiry(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: 'Message from the website',
        message: form.message.trim(),
        serviceMode: 'general',
      },
      token
    );
    setSending(false);
    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-[var(--text)]">
      <SEOHead
        title={PAGE_META['/contact'].title}
        description={PAGE_META['/contact'].description}
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <header className="space-y-3 max-w-2xl">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">Contact us</h1>
          <p className="text-base text-[var(--text-secondary)]">Call us, send a message, or visit our office in Hetauda.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Spotlight
            intensity="subtle"
            className="lg:col-span-2 p-6 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] self-start"
          >
            <ul className="flex flex-col gap-5 w-full">
              {CONTACT_ITEMS.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--gold-dark)]" aria-hidden="true" />
                  <div className="leading-snug">
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm font-semibold hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <a
              href="https://www.google.com/maps/search/?api=1&query=School+Road+Hetauda+Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--oxford-deep)] hover:underline"
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              <span>Get directions</span>
            </a>
          </Spotlight>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-[var(--green-mid,#16A34A)]" aria-hidden="true" />
                <h2 className="font-heading font-bold text-2xl">Thank you, we got your message</h2>
                <p className="text-sm text-[var(--text-secondary)]">We will reply to {form.email} soon.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] flex flex-col gap-5"
              >
                <h2 className="font-heading font-bold text-xl">Send us a message</h2>

                <Input
                  label="Name"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Email"
                  required
                  type="email"
                  inputMode="email"
                  placeholder="name@gmail.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  autoComplete="tel"
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="text-xs font-heading font-bold uppercase tracking-wider">
                    Message<span className="text-[var(--danger)] ml-1" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-sm)] clay-inset text-sm transition-all duration-200 hover:border-[var(--ox-700)] hover:shadow-[0_0_0_3px_rgba(242,183,5,0.18)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring,#F2B705)]"
                  />
                  {errors.message && <p className="text-xs text-[var(--danger)] font-medium">{errors.message}</p>}
                </div>

                {/* Hidden field: real visitors never see or fill it */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.honeypot}
                  onChange={(e) => set('honeypot', e.target.value)}
                  className="hidden"
                />

                <TurnstileWidget onVerify={(tok) => setToken(tok)} className="my-1" />

                {submitError && (
                  <p role="alert" className="text-sm font-medium text-[var(--danger)]">
                    {submitError}
                  </p>
                )}

                <div>
                  <Button type="submit" size="lg" isLoading={sending}>
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
