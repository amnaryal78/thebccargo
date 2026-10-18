import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Globe2, Handshake } from 'lucide-react';
import { Seo } from '../components/Seo';
import { Button } from '../design/primitives/Button';
import { Input } from '../design/primitives/Input';
import { Select } from '../design/primitives/Select';
import { Spotlight } from '../components/ui/spotlight';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { submitInquiry } from '../services/inquiryService';
import { COUNTRIES, COUNTRY_BY_ISO2, flagUrl } from '../data/countries';

type Origin = 'nepal' | 'outside';

const SERVICE_CHOICES = ['Air cargo', 'Road cargo', 'Sea cargo', 'Courier', 'Customs clearance', 'Warehouse'];

const VOLUME_OPTIONS = [
  { value: '', label: 'Choose one' },
  { value: 'under-100', label: 'Under 100 kg a month' },
  { value: '100-500', label: '100 to 500 kg a month' },
  { value: '500-2000', label: '500 to 2,000 kg a month' },
  { value: 'over-2000', label: 'Over 2,000 kg a month' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface FormState {
  country: string; // ISO2
  company: string;
  owner: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  years: string;
  services: string[];
  volume: string;
  message: string;
}

const emptyForm = (country: string): FormState => ({
  country,
  company: '',
  owner: '',
  email: '',
  phone: '',
  website: '',
  city: '',
  years: '',
  services: [],
  volume: '',
  message: '',
});

export const BecomePartnerPage: React.FC = () => {
  const [origin, setOrigin] = useState<Origin>('nepal');
  const [form, setForm] = useState<FormState>(emptyForm('NP'));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isNepal = origin === 'nepal';
  const country = COUNTRY_BY_ISO2[form.country];
  // The dial code follows the chosen country, so people only type the local number.
  const dial = country ? `+${country.dial}` : '';

  const countryOptions = useMemo(
    () => [
      { value: '', label: 'Choose your country' },
      ...COUNTRIES.filter((c) => c.iso2 !== 'NP').map((c) => ({ value: c.iso2, label: c.name })),
    ],
    []
  );

  const switchOrigin = (next: Origin) => {
    setOrigin(next);
    setErrors({});
    setForm((f) => ({ ...f, country: next === 'nepal' ? 'NP' : '' }));
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleService = (name: string) => {
    set(
      'services',
      form.services.includes(name) ? form.services.filter((s) => s !== name) : [...form.services, name]
    );
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.country) next.country = 'Choose your country.';
    if (form.company.trim().length < 2) next.company = 'Enter your company name.';
    if (form.owner.trim().length < 2) next.owner = 'Enter the owner’s full name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email, like name@gmail.com.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 12) next.phone = 'Enter your phone number without the country code.';
    if (form.website.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(form.website.trim())) {
      next.website = 'Enter a valid website, like www.example.com.';
    }
    if (form.services.length === 0) next.services = 'Pick at least one service.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSubmitError('');

    const lines = [
      `Partner type: ${isNepal ? 'From Nepal' : 'From outside Nepal'}`,
      `Country: ${country?.name ?? form.country}`,
      `City: ${form.city.trim() || '-'}`,
      `Company: ${form.company.trim()}`,
      `Owner: ${form.owner.trim()}`,
      `Website: ${form.website.trim() || '-'}`,
      `Years in business: ${form.years.trim() || '-'}`,
      `Services: ${form.services.join(', ')}`,
      `Monthly volume: ${VOLUME_OPTIONS.find((v) => v.value === form.volume)?.label ?? '-'}`,
      `Message: ${form.message.trim() || '-'}`,
    ];

    const result = await submitInquiry(
      {
        name: form.owner.trim(),
        email: form.email.trim(),
        phone: `${dial} ${form.phone.trim()}`,
        subject: `Partner application: ${form.company.trim()} (${country?.name ?? ''})`,
        message: lines.join('\n'),
        serviceMode: 'partner',
      },
      token
    );
    setSending(false);
    if (result.error) {
      setSubmitError('We could not send your request. Please try again, or call us on 057-591816.');
      return;
    }
    setSent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-14 h-14 text-[var(--green-mid,#16A34A)]" aria-hidden="true" />
        <h1 className="font-heading font-bold text-3xl text-[var(--text)]">Thank you, we got your request</h1>
        <p className="text-[var(--text-secondary)]">
          Our team will email you at <strong>{form.email}</strong> within 2 working days.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSent(false);
            setForm(emptyForm(isNepal ? 'NP' : ''));
          }}
        >
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Seo
        title="Become a Partner — BC Cargo & Courier"
        description="Join The BC Cargo & Courier network as a logistics partner, in Nepal or anywhere in the world."
        canonicalUrl="https://thebccargo.com/become-a-partner"
      />

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-dark)]">
            <Handshake className="w-4 h-4" aria-hidden="true" />
            <span>Partner with us</span>
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-[var(--text)] leading-tight">
            Become a BC Cargo partner
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-xl">
            Run a courier or cargo business? Tell us about it and we will contact you about working together.
          </p>
        </header>

        {/* Step 1: where is the business? */}
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <legend className="sr-only">Where is your business?</legend>
          {(
            [
              { id: 'nepal', title: 'From Nepal', hint: 'Your business is based in Nepal', Icon: MapPin },
              { id: 'outside', title: 'From outside Nepal', hint: 'Your business is in another country', Icon: Globe2 },
            ] as const
          ).map(({ id, title, hint, Icon }) => {
            const active = origin === id;
            return (
              <Spotlight
                key={id}
                intensity="subtle"
                className={`rounded-[var(--r-md)] border-2 transition-colors ${
                  active
                    ? 'border-[var(--gold)] bg-[var(--surface-muted)]'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchOrigin(id)}
                  className="w-full text-left flex items-center gap-3 p-4 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,#F2B705)]"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--oxford-deep,#002147)] text-[var(--gold)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-heading font-bold text-base text-[var(--text)]">{title}</span>
                    <span className="text-sm text-[var(--text-muted)]">{hint}</span>
                  </span>
                </button>
              </Spotlight>
            );
          })}
        </fieldset>

        {/* Step 2: details */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Spotlight
            intensity="subtle"
            className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              {isNepal ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)]">Country</span>
                  <div className="min-h-[48px] flex items-center gap-2.5 px-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-muted)] text-sm text-[var(--text)]">
                    <img src={flagUrl('np', 20)} alt="" width={20} height={14} className="w-5 h-3.5 object-cover rounded-[2px]" />
                    <span>Nepal</span>
                  </div>
                </div>
              ) : (
                <Select
                  label="Country"
                  required
                  options={countryOptions}
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  error={errors.country}
                />
              )}

              <Input
                label="City"
                placeholder={isNepal ? 'For example, Hetauda' : 'Your city'}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                autoComplete="address-level2"
              />

              <Input
                label="Company name"
                required
                placeholder="Your logistics company"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                error={errors.company}
                autoComplete="organization"
              />

              <Input
                label="Owner name"
                required
                placeholder="Full name"
                value={form.owner}
                onChange={(e) => set('owner', e.target.value)}
                error={errors.owner}
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
                label="Phone number"
                required
                type="tel"
                inputMode="tel"
                placeholder={dial ? 'Local number' : 'Choose a country first'}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                error={errors.phone}
                helperText={dial ? `Country code ${dial} is added for you.` : undefined}
                leftAdornment={<span className="text-sm font-semibold text-[var(--text)]">{dial || '+'}</span>}
                className={dial.length > 3 ? '!pl-[4.25rem]' : '!pl-14'}
                autoComplete="tel-national"
              />

              <Input
                label="Website (optional)"
                type="url"
                inputMode="url"
                placeholder="www.example.com"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                error={errors.website}
                autoComplete="url"
              />

              <Input
                label="Years in business"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                placeholder="For example, 5"
                value={form.years}
                onChange={(e) => set('years', e.target.value)}
              />
            </div>
          </Spotlight>

          <Spotlight
            intensity="subtle"
            className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-5 w-full">
              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                  What services do you offer?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CHOICES.map((name) => {
                    const on = form.services.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleService(name)}
                        className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full border text-sm font-semibold leading-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,#F2B705)] ${
                          on
                            ? 'bg-[var(--gold)] text-[var(--oxford-deep,#002147)] border-transparent'
                            : 'bg-[var(--surface)] text-[var(--text)] border-[var(--line)] hover:border-[var(--line-strong)]'
                        }`}
                      >
                        {on && <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.services && <p className="text-xs text-[var(--danger)] font-medium">{errors.services}</p>}
              </fieldset>

              <Select
                label="How much do you ship?"
                options={VOLUME_OPTIONS}
                value={form.volume}
                onChange={(e) => set('volume', e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="partner-message" className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)]">
                  Anything else we should know?
                </label>
                <textarea
                  id="partner-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Tell us about your business and routes."
                  className="w-full px-4 py-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-sm)] clay-inset text-sm transition-all duration-200 hover:border-[var(--ox-700)] hover:shadow-[0_0_0_3px_rgba(242,183,5,0.18)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring,#F2B705)] placeholder:text-slate-500"
                />
              </div>
            </div>
          </Spotlight>

          <TurnstileWidget onVerify={(tok) => setToken(tok)} className="my-1" />

          {submitError && (
            <p role="alert" className="text-sm font-medium text-[var(--danger)]">
              {submitError}
            </p>
          )}

          <div>
            <Button type="submit" size="lg" isLoading={sending}>
              Send request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
