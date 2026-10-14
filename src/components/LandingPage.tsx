import React, { useState } from 'react';
import { 
  Search, 
  Plane, 
  Truck, 
  Ship, 
  ArrowRight, 
  ShieldCheck, 
  Globe2,
  CheckCircle2, 
  PackageCheck, 
  ChevronRight,
  MapPin,
  Clock,
  Layers,
  FileCheck2,
  Box,
  Bot
} from 'lucide-react';
import { ServiceMode, Shipment } from '../types';
import { PartnerSlider } from './PartnerSlider';
import { BlogSection } from './BlogSection';
import { FeedbackSection } from './FeedbackSection';
import { FaqSection } from './FaqSection';
import { LogisticsMotionGraphicSection } from './LogisticsMotionGraphicSection';
import { BcCargoChatbot } from './BcCargoChatbot';
import { MagneticButton } from './MagneticButton';
import { WorldMap } from './ui/world-map';

// High-performance pointer-following light helper (0 re-renders)
const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
};

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (trackingCode: string, mode?: ServiceMode) => void;
  activeShipment?: Shipment;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSearchTrack
}) => {
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedServiceMode, setSelectedServiceMode] = useState<ServiceMode>('air');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      onSearchTrack(trackingInput.trim(), selectedServiceMode);
    }
  };

  const sampleAwbs = [
    { code: 'BC-90214-HKG', label: 'Air Freight' },
    { code: 'BC-88192-DXB', label: 'Express' },
    { code: 'NP-4421-DEL', label: 'Overland' },
    { code: 'BC-7731-SGN', label: 'Ocean' }
  ];

  return (
    <div className="w-full flex flex-col transition-colors">
      
      {/* 1. HERO SECTION: National & International Courier Service */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/50 dark:from-[#071A33] dark:via-[#071A33] dark:to-[#040E1C]">
        
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0B5ED7]/10 dark:bg-[#0B5ED7]/15 rounded-full blur-3xl" />
        </div>

        {/* Ambient Global Flight Routes World Map */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30 dark:opacity-20 select-none">
          <div className="w-full max-w-6xl aspect-[2/1] scale-125 sm:scale-110 lg:scale-105 transform translate-y-4">
            <WorldMap
              backgroundColor="transparent"
              lineColor="#0B5ED7"
              dots={[
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 25.2048, lng: 55.2708 } }, // Kathmandu -> Dubai
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 50.1109, lng: 8.6821 } },  // Kathmandu -> Frankfurt
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 22.3193, lng: 114.1694 } }, // Kathmandu -> Hong Kong
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 51.5074, lng: -0.1278 } },  // Kathmandu -> London
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 40.7128, lng: -74.0060 } }, // Kathmandu -> New York
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 35.6762, lng: 139.6503 } }, // Kathmandu -> Tokyo
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: -33.8688, lng: 151.2093 } }, // Kathmandu -> Sydney
                { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 28.6139, lng: 77.2090 } },  // Kathmandu -> New Delhi
              ]}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
          
          {/* Top Operational Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 font-mono tracking-wide">
              Connecting Nepal &amp; the world
            </span>
          </div>

          {/* Master Headline & Supporting Copy */}
          <div className="flex flex-col gap-3 max-w-5xl">
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.15] whitespace-nowrap">
              National &amp; International Courier Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Reliable, fast, and secure delivery connecting Nepal with over 50 countries and cities across the country.
            </p>
          </div>

          {/* Primary Tracking Console (Core product interaction in Hero) */}
          <div className="w-full max-w-2xl bg-white dark:bg-[#0B2445] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                Track Your Package
              </span>
              <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                Live Updates
              </span>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-slate-100/70 dark:bg-[#071A33]/70 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#0B5ED7]/20 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter your tracking number (e.g. BC-90214-HKG)"
                  className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none border-none outline-none"
                />
              </div>

              <MagneticButton
                type="submit"
                className="bg-[#0B5ED7] hover:bg-[#084298] text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer group"
              >
                <span>Track Package</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </form>

            {/* Quick Demo Tracking Links */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Samples:</span>
                {sampleAwbs.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setTrackingInput(item.code);
                      onSearchTrack(item.code);
                    }}
                    className="interactive-btn px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[10px] transition-colors cursor-pointer"
                  >
                    {item.code}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('book')}
                className="interactive-link text-[#0B5ED7] dark:text-[#F5C84C] font-semibold text-[11px] uppercase tracking-wide flex items-center gap-1 cursor-pointer"
              >
                <span>Send a Package</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex items-center flex-wrap justify-center gap-3 pt-2">
            <MagneticButton
              onClick={() => onNavigate('book')}
              className="px-6 py-3 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer group"
            >
              <PackageCheck className="w-4 h-4 text-[#F5C84C] group-hover:scale-110 transition-transform" />
              <span>Send a Package</span>
            </MagneticButton>
            <MagneticButton
              onClick={() => {
                const el = document.getElementById('bc-cargo-ai-chatbot');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-white dark:bg-[#0B2445] hover:bg-slate-50 dark:hover:bg-[#0F2D54] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer shadow-xs group"
            >
              <Bot className="w-4 h-4 text-[#0B5ED7] dark:text-[#2F80ED] group-hover:scale-110 transition-transform" />
              <span>Ask BC Cargo AI</span>
            </MagneticButton>
          </div>

          {/* Verified Coverage & Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl pt-4">
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow p-3.5 rounded-xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col text-center shadow-xs"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">50+</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Countries Served</span>
            </div>
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow p-3.5 rounded-xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col text-center shadow-xs"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">Daily</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Nepal Delivery</span>
            </div>
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow p-3.5 rounded-xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col text-center shadow-xs"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#10B981]">99.4%</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">On-Time Delivery</span>
            </div>
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow p-3.5 rounded-xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col text-center shadow-xs"
            >
              <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#0B5ED7] dark:text-[#2F80ED]">#B-409</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Government Licensed</span>
            </div>
          </div>

          {/* Animated Scroll Down Indicator (Annotation 9) */}
          <div 
            onClick={() => window.scrollTo({ top: 680, behavior: 'smooth' })}
            className="pt-4 flex flex-col items-center gap-1 cursor-pointer group animate-bounce text-slate-400 hover:text-[#0B5ED7] dark:hover:text-white transition-colors"
            title="Scroll Down"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 group-hover:text-[#0B5ED7] dark:group-hover:text-white transition-colors">Scroll Down</span>
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>

        </div>
      </section>

      {/* HOW YOUR SHIPMENT MOVES: OpenAI/Codex-Style Contained Logistics Motion Graphic */}
      <LogisticsMotionGraphicSection />

      {/* BC CARGO CONTROLLED AGENTIC AI CHATBOT (Below From Pickup to Delivery, Above What We Offer) */}
      <BcCargoChatbot onNavigate={onNavigate} onSearchTrack={onSearchTrack} />

      {/* 2. SERVICES SECTION: Clearly separating National vs International */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] font-mono">
              What We Offer
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Simple &amp; Reliable Delivery Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Whether you are sending a letter across Nepal or large cargo across the world, we make it easy.
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#0B2445] hover:bg-[#0B5ED7] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>See All Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section A: National Services */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Truck className="w-4 h-4 text-[#0B5ED7]" />
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase tracking-wide">
              Delivery Across Nepal
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* National 1: Express Courier */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <Box className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">1 to 2 Days</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Fast Domestic Courier
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Quick door-to-door delivery for documents, parcels, and gifts between all major cities in Nepal.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Daily Departures</span>
                <button onClick={() => onNavigate('book')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Send</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>

            {/* National 2: Overland Linehaul */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">Road Delivery</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Truck Delivery for Heavy Items
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Full or shared truck delivery for larger packages and commercial goods across Nepal's highway routes.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">GPS Tracked</span>
                <button onClick={() => onNavigate('book')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Send</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>

            {/* National 3: Doorstep Industrial Collection */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">Doorstep Pickup</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Pickup from Your Door or Office
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  We pick up packages directly from your home, shop, or office and keep them safe until delivery.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Hetauda &amp; KTM</span>
                <button onClick={() => onNavigate('rates')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Check Prices</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: International Services */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Plane className="w-4 h-4 text-[#0B5ED7]" />
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase tracking-wide">
              Worldwide Delivery
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Intl 1: Priority Air Freight */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <Plane className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">2 to 5 Days Worldwide</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Fast Air Delivery
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Quick international flights sending your packages from Kathmandu to destinations across the globe.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Daily Flights</span>
                <button onClick={() => onNavigate('book')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Send</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>

            {/* Intl 2: Ocean Lines */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <Ship className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">2 to 4 Weeks</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Sea Delivery for Big Shipments
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Cost-effective sea transport for large boxes, heavy equipment, and bulk items via major international ports.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Affordable Rate</span>
                <button onClick={() => onNavigate('book')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Send</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>

            {/* Intl 3: Customs Brokerage */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="interactive-card interactive-radial-glow group bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#0B5ED7] dark:text-[#60A5FA] font-semibold group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">Easy Paperwork</span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                  Customs &amp; Paperwork Help
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  We take care of government paperwork and customs clearance so your packages cross borders smoothly.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Broker Lic. #B-409</span>
                <button onClick={() => onNavigate('contact')} className="text-[#0B5ED7] dark:text-[#60A5FA] hover:text-[#D97706] dark:hover:text-[#F5C84C] font-semibold hover:underline cursor-pointer flex items-center gap-1 group/btn transition-colors">
                  <span>Ask Us</span>
                  <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLEAN PLACEHOLDER CONTAINER (Future Motion Graphic Replacement Slot) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 dark:bg-[#040E1C] rounded-2xl lg:rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-[#10B981] uppercase font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                Active Routes
              </span>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white mt-1">
                Our Main Delivery Routes
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Daily Scheduled Routes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Hetauda HQ ➔ Kathmandu</span>
              <p className="font-bold text-sm text-white mt-1">Daily Highway Express</p>
              <span className="text-xs text-[#10B981] font-mono mt-2 block">Active • ~4h Delivery</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Kathmandu (TIA) ➔ Frankfurt (FRA)</span>
              <p className="font-bold text-sm text-white mt-1">Direct Air Route to Europe</p>
              <span className="text-xs text-[#0B5ED7] dark:text-[#2F80ED] font-mono mt-2 block">Active • 2 to 4 Days</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Birgunj ICD ➔ Kolkata Port</span>
              <p className="font-bold text-sm text-white mt-1">Rail &amp; Sea Route</p>
              <span className="text-xs text-[#F5C84C] font-mono mt-2 block">Active • Low Cost for Big Cargo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LEADING / TRUSTED CARRIER PARTNERS SLIDER */}
      <PartnerSlider />

      {/* 5. HOW TO SHIP WITH US (4 Clean Steps) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] font-mono">
            Simple 4 Steps
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
            How Sending a Package Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            Sending a package is simple. Here is how we get your items safely to their destination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#F5C84C] hover:shadow-md transition-all flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#F5C84C] group-hover:text-slate-950 flex items-center justify-center font-bold text-xs font-mono transition-all duration-300">
              01
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F5C84C] transition-colors">
              Tell Us What to Send
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Use our simple online form or call us to tell us what you are sending and where it needs to go.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#F5C84C] hover:shadow-md transition-all flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#F5C84C] group-hover:text-slate-950 flex items-center justify-center font-bold text-xs font-mono transition-all duration-300">
              02
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F5C84C] transition-colors">
              We Pick It Up
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We pick up your package from your doorstep or you can drop it off at any of our offices.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#F5C84C] hover:shadow-md transition-all flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#F5C84C] group-hover:text-slate-950 flex items-center justify-center font-bold text-xs font-mono transition-all duration-300">
              03
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F5C84C] transition-colors">
              We Handle the Journey
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We take care of all paperwork, choose the best route, and keep your package moving safely.
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#F5C84C] hover:shadow-md transition-all flex flex-col gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#F5C84C] group-hover:text-slate-950 flex items-center justify-center font-bold text-xs font-mono transition-all duration-300">
              04
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F5C84C] transition-colors">
              Safely Delivered
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your package is handed directly to the receiver, and you receive confirmation right away.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BLOGS & ARTICLES */}
      <BlogSection onNavigate={onNavigate} />

      {/* 7. CUSTOMER REVIEWS */}
      <FeedbackSection />

      {/* 7. FAQ SECTION (DIRECTLY AFTER REVIEWS - CRITICAL REQUIREMENT) */}
      <FaqSection />

      {/* 8. FINAL CONVERSION CTA */}
      <section className="py-16 bg-slate-900 dark:bg-[#040E1C] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono text-[#F5C84C] uppercase font-bold">
              Need Help Sending Something?
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Ready to Send a Package or Have Questions?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Send a package online in minutes, check our prices, or talk to our friendly team in Hetauda.
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('book')}
              className="px-5 py-3 rounded-xl bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-[#F5C84C]" />
              <span>Send a Package</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
