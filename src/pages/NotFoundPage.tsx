import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight, 
  Home, 
  Search, 
  Headphones, 
  PackageSearch 
} from 'lucide-react';
import { Card } from '../design/primitives/Card';
import { Button } from '../design/primitives/Button';
import { BcLogo } from '../components/BcLogo';
import { SEOHead } from '../components/SEOHead';

const quickLinks = [
  { to: "/", Icon: Home, label: "Go Home", hint: "Main page" },
  { to: "/track", Icon: PackageSearch, label: "Track Package", hint: "Find your delivery" },
  { to: "/contact", Icon: Headphones, label: "Contact Us", hint: "Help & support" },
];

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 max-w-2xl mx-auto text-center">
      <SEOHead
        noindex
        title="Page Not Found (404) | The BC Cargo & Courier"
        description="The page you are looking for does not exist or may have been moved."
      />

      <div className="flex flex-col items-center gap-6">
        
        {/* Visual Badge */}
        <div className="w-20 h-20 rounded-3xl bg-[var(--surface-2,#ECEBE7)] border border-[var(--line-strong,#0B2D63)] text-ox-900 flex items-center justify-center shadow-lg">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '15s' }} />
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-ox-900">
            Error 404
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
            We couldn't find the page you are looking for. It may have been moved, deleted, or mistyped.
          </p>
        </div>

        {/* Quick Nav Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-2">
          {quickLinks.map(({ to, Icon, label, hint }) => (
            <Link key={to} to={to} className="block w-full rounded-[var(--r-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
              <Card variant="interactive" className="h-full">
                <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                  <Icon className="w-5 h-5 text-[var(--brand)] shrink-0" aria-hidden="true" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading font-bold text-sm text-[var(--text)]">{label}</span>
                    <span className="text-xs text-[var(--text-muted)]">{hint}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Primary Action Button */}
        <Link to="/">
          <Button variant="primary" size="lg" magnetic rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />} className="mt-2">
            Back to Homepage
          </Button>
        </Link>

      </div>
    </div>
  );
};
