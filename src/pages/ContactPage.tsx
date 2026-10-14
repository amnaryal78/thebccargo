import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Headphones,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { TurnstileWidget } from '../components/ui/TurnstileWidget';
import { submitInquiry } from '../services/inquiryService';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    serviceMode: 'air' as 'air' | 'express' | 'ocean' | 'overland' | 'customs',
    message: '',
    honeypot: ''
  });

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) {
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim() || `Customer Inquiry (${formData.serviceMode})`,
        serviceMode: formData.serviceMode,
        message: formData.message.trim()
      }, turnstileToken);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.record) {
        setSubmittedRef(result.record.id);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          serviceMode: 'air',
          message: '',
          honeypot: ''
        });
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setError('Failed to submit message. Please call our central dispatch hotline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-12">
      <SEOHead
        title="Contact Us | The BC Cargo & Courier - Hetauda HQ & Gateways"
        description="Get in touch with BC Cargo & Courier. Central operations at Kantirajpath-4, Hetauda, Kathmandu TIA cargo terminal, and Birgunj ICD port. 24/7 dispatch support."
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5" />
          <span>Customer Support &amp; Offices</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white uppercase tracking-tight">
          We Are Here to Help
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Have questions about sending a package, delivery prices, or customs paperwork? Reach out to our team in Nepal anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Verified Regional Contact Hubs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Hetauda Global HQ Card */}
          <Card className="p-6 flex flex-col gap-4 border-l-4 border-l-[#0B5ED7] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-[#0E1638] text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                Main Office
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                Central Operations
              </span>
            </div>

            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Hetauda Central HQ &amp; Sorting Hub
            </h3>

            <div className="flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0B5ED7] shrink-0 mt-0.5" />
                <span>Kantirajpath-4, Hetauda, Makwanpur, Bagmati Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                <span className="font-mono">+977-57-520000 / +977-9855000000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                <span className="font-mono">info@thebccargo.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                <span>Sun – Fri: 8:00 AM – 7:00 PM (NPT)</span>
              </div>
            </div>
          </Card>

          {/* Regional Hubs Summary */}
          <Card className="p-6 flex flex-col gap-4 bg-slate-50 dark:bg-[#071A33]">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B5ED7]" />
              <span>Gateways &amp; Border Terminals</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Kathmandu TIA Air Cargo Office</p>
                <p>Tribhuvan International Airport Cargo Complex, Sinamangal, Kathmandu</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                <p className="font-bold text-slate-900 dark:text-white">Birgunj Inland Container Depot (Dry Port)</p>
                <p>Customs Yard Office #4, Sirsia ICD, Birgunj, Nepal</p>
              </div>
            </div>
          </Card>

        </div>

        {/* Right: Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 flex flex-col gap-6 shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071A33]">
            
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Send a Message to Our Support Team
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fill out the form below and an operations agent will respond within 2 business hours.
              </p>
            </div>

            {submittedRef ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-heading font-bold text-lg">Inquiry Received Successfully!</h3>
                <p className="text-xs max-w-md">
                  Thank you for reaching out. Your reference number is{' '}
                  <strong className="font-mono text-emerald-700 dark:text-emerald-300">{submittedRef}</strong>.
                  Our team is processing your request.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmittedRef(null)}
                  className="mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Honeypot Bot Trap (Hidden) */}
                <input
                  type="text"
                  name="website_url"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Ramesh Karki"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="ramesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Phone Number (optional)
                    </label>
                    <Input
                      type="tel"
                      placeholder="+977-98..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Shipping Mode
                    </label>
                    <select
                      value={formData.serviceMode}
                      onChange={(e) => setFormData({ ...formData, serviceMode: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0B5ED7]"
                    >
                      <option value="air">Air Cargo Freight</option>
                      <option value="express">Worldwide Express Courier</option>
                      <option value="ocean">Ocean Freight Cargo</option>
                      <option value="overland">Land &amp; Border Freight</option>
                      <option value="customs">Customs Clearance Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Rate quote for 50kg textiles to London"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Message *
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="Please include package weight, dimensions, origin city, destination, or any specific questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                {/* Cloudflare Turnstile Anti-bot Protection */}
                <TurnstileWidget onVerify={(tok) => setTurnstileToken(tok)} className="my-1" />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full mt-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>{loading ? 'Submitting Message...' : 'Send Inquiry Message'}</span>
                </Button>

                <p className="text-[11px] text-slate-400 font-mono text-center flex items-center justify-center gap-1 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected by Server-Side CAPTCHA &amp; End-to-End Verification</span>
                </p>

              </form>
            )}

          </Card>
        </div>

      </div>
    </div>
  );
};
