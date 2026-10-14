import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Globe2, 
  MapPin, 
  Award, 
  Plane, 
  Truck, 
  Anchor, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Clock,
  Compass
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RegionalHubsMap } from '../components/RegionalHubsMap';
import { SEOHead } from '../components/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-16">
      <SEOHead
        title="About Us | The BC Cargo & Courier - Nepal Logistics Leader"
        description="Learn about The BC Cargo & Courier, Nepal's premier multimodal freight and courier network headquartered in Hetauda, operating through Birgunj ICD dry port and TIA Kathmandu."
      />

      {/* Hero Narrative Section */}
      <section className="flex flex-col items-center text-center gap-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Hetauda Central HQ • Kathmandu TIA Airport • Birgunj Dry Port</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
          Connecting Nepal With Fast &amp; Reliable Delivery
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          The BC Cargo &amp; Courier helps you send packages, documents, and cargo safely across Nepal and to over 50 countries worldwide. Headquartered in Hetauda with customs desks at Kathmandu airport and Birgunj dry port, we make sending packages simple.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/book">
            <Button variant="primary" size="lg">
              <span>Send a Package</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="lg">
              <span>Contact Us</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Verified Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 sm:p-8 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 hover:border-[#0B5ED7] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0B5ED7] flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
            Delivery by Air, Road &amp; Sea
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Fast air delivery via Kathmandu airport, cost-effective sea shipping through regional ports, and reliable trucks connecting Nepal’s seven provinces with India and China.
          </p>
        </Card>

        <Card className="p-6 sm:p-8 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 hover:border-[#0B5ED7] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0B5ED7] flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
            Government Licensed Customs Broker
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Operating under official Customs Broker License #B-409 with direct digital export filing so your items clear customs quickly without unnecessary hold-ups.
          </p>
        </Card>

        <Card className="p-6 sm:p-8 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 hover:border-[#0B5ED7] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0B5ED7] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
            Safe &amp; Careful Handling
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every box is carefully tracked from pickup to delivery with tamper-evident security seals, safe storage, and dependable on-time delivery.
          </p>
        </Card>
      </section>

      {/* Strategic Hubs & Regional Capabilities (Embedding Hub Map) */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B5ED7]">
            Our Network in Nepal
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
            Our Offices &amp; Delivery Hubs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Our central headquarters in Hetauda connects with key airport and border hubs across Nepal to ensure smooth delivery.
          </p>
        </div>

        {/* Embedded Interactive Regional Hubs Map */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
          <RegionalHubsMap />
        </div>
      </section>

      {/* Corporate Standards & Compliance Details */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F5C84C] font-bold uppercase">
              <Award className="w-4 h-4" />
              <span>Trusted &amp; Reliable</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Built on Honesty, Speed, and Care
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Delivering goods in Nepal requires local expertise. Whether driving across highway routes or flying packages across the world, The BC Cargo makes sure your shipment arrives safely and on time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Broker Lic. #B-409 Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct Customs Digital Filing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official Airline Standards</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Daily Customer Support &amp; Tracking</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-white">
              Hetauda Central HQ Operations
            </h3>
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Headquarters Address:</span>
                <span className="text-white text-right">Kantirajpath-4, Hetauda, Nepal</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Central Phone:</span>
                <span className="text-white">+977-057-520000</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="text-[#F5C84C]">thebcargo@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customs Clearance Desks:</span>
                <span className="text-white">Birgunj Dry Port &amp; Kathmandu Airport</span>
              </div>
            </div>
            <Link
              to="/contact"
              className="mt-2 w-full py-2.5 rounded-xl bg-[#0B5ED7] hover:bg-blue-600 text-white font-heading font-bold text-xs uppercase text-center transition-colors shadow-md"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
