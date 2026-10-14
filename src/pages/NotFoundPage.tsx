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
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BcLogo } from '../components/BcLogo';
import { SEOHead } from '../components/SEOHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 max-w-2xl mx-auto text-center">
      <SEOHead
        title="Page Not Found (404) | The BC Cargo & Courier"
        description="The page you are looking for does not exist or may have been moved."
      />

      <div className="flex flex-col items-center gap-6">
        
        {/* Visual Badge */}
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] flex items-center justify-center shadow-lg">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '15s' }} />
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B5ED7]">
            Error 404
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            We couldn't find the page you are looking for. It may have been moved, deleted, or mistyped.
          </p>
        </div>

        {/* Quick Nav Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-2">
          <Link to="/" className="w-full">
            <Card className="p-4 flex flex-col items-center gap-2 hover:border-[#0B5ED7] transition-all group">
              <Home className="w-5 h-5 text-[#0B5ED7]" />
              <span className="font-heading font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#0B5ED7]">
                Go Home
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Main Page</span>
            </Card>
          </Link>

          <Link to="/track" className="w-full">
            <Card className="p-4 flex flex-col items-center gap-2 hover:border-[#0B5ED7] transition-all group">
              <PackageSearch className="w-5 h-5 text-[#0B5ED7]" />
              <span className="font-heading font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#0B5ED7]">
                Track Package
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Find your delivery</span>
            </Card>
          </Link>

          <Link to="/contact" className="w-full">
            <Card className="p-4 flex flex-col items-center gap-2 hover:border-[#0B5ED7] transition-all group">
              <Headphones className="w-5 h-5 text-[#0B5ED7]" />
              <span className="font-heading font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#0B5ED7]">
                Contact Us
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Help &amp; Support</span>
            </Card>
          </Link>
        </div>

        {/* Primary Action Button */}
        <Link to="/">
          <Button variant="primary" size="lg" className="mt-2">
            <span>Back to Homepage</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

      </div>
    </div>
  );
};
