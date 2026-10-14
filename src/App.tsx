import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HashRedirect } from './router/HashRedirect';
import { Shipment, ServiceMode } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { TrackingSection } from './components/TrackingSection';
import { BookingSystem } from './components/BookingSystem';
import { ServicesSuite } from './components/ServicesSuite';
import { Footer } from './components/Footer';
import { PrintableAwbModal } from './components/PrintableAwbModal';
import { CustomCursor } from './components/CustomCursor';
import { MapPin } from 'lucide-react';

// Code-Split Lazy Loaded Page Components for Core Web Vitals Optimization
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RatesPage = lazy(() => import('./pages/RatesPage').then(m => ({ default: m.RatesPage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage').then(m => ({ default: m.PoliciesPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage').then(m => ({ default: m.CareerDetailPage })));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-3 border-[#0B5ED7] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono text-slate-400 tracking-wider">Loading The BC Cargo...</span>
  </div>
);

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string>('');
  const [printableShipment, setPrintableShipment] = useState<Shipment | null>(null);

  // Find active shipment object for tracking
  const activeShipment = shipments.find(s => s.trackingNumber === activeTrackingNumber) || null;

  const getActiveSectionFromPath = (): string => {
    const path = location.pathname.substring(1).toLowerCase();
    if (!path) return 'home';
    if (path.startsWith('track')) return 'track';
    if (path.startsWith('book')) return 'book';
    if (path.startsWith('services')) return 'services';
    if (path.startsWith('rates')) return 'rates';
    if (path.startsWith('blogs') || path.startsWith('blog')) return 'blogs';
    if (path.startsWith('about')) return 'about';
    if (path.startsWith('contact')) return 'contact';
    if (path.startsWith('policies')) return 'policies';
    if (path.startsWith('faq')) return 'faq';
    if (path.startsWith('careers')) return 'careers';
    if (path.startsWith('login')) return 'login';
    return path;
  };

  const handleNavigate = (sectionId: string) => {
    const pathToNavigate = sectionId === 'home' ? '/' : `/${sectionId}`;
    navigate(pathToNavigate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTrack = (trackingCode: string, mode?: ServiceMode) => {
    setActiveTrackingNumber(trackingCode);
    navigate('/track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = () => {
    navigate('/book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#071A33] text-slate-900 dark:text-slate-100 transition-colors">
      <CustomCursor />
      {!isAdminRoute && (
        <Header
          onNavigate={handleNavigate}
          activeSection={getActiveSectionFromPath()}
          onQuickTrack={(code) => handleQuickTrack(code)}
          onOpenBooking={handleOpenBooking}
        />
      )}

      <main className={`flex-1 ${!isAdminRoute ? 'pt-24' : ''}`}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onNavigate={handleNavigate}
                  onSearchTrack={handleQuickTrack}
                  activeShipment={activeShipment || undefined}
                />
              }
            />
            {/* Unified Single Sign-On Route */}
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/track"
              element={
                <TrackingSection
                  shipment={activeShipment}
                  allShipments={shipments}
                  onSelectShipment={(code) => setActiveTrackingNumber(code)}
                  onOpenPrintAwb={(s) => setPrintableShipment(s)}
                />
              }
            />
            <Route
              path="/book"
              element={
                <BookingSystem
                  onBookingSuccess={(ref: string) => {
                    setActiveTrackingNumber(ref);
                    navigate('/track');
                  }}
                />
              }
            />
            <Route path="/services" element={<ServicesSuite />} />
            
            {/* Rates Routes */}
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/rates/national" element={<RatesPage />} />
            <Route path="/rates/international" element={<RatesPage />} />
            <Route path="/rates/calculator" element={<RatesPage />} />
            <Route path="/rates/rfq" element={<RatesPage />} />

            {/* Knowledge Base & Blog Routes */}
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />

            {/* Dedicated Public Information Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/faq" element={<FaqPage />} />

            {/* Careers Routes */}
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<CareerDetailPage />} />

            {/* Protected Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer onNavigate={handleNavigate} />}

      {/* Floating Pinned Location Hubs Action Button (Annotation 8 - Responsive PC & Mobile) */}
      {!isAdminRoute && (
        <button
          onClick={() => {
            handleNavigate('about');
            setTimeout(() => {
              const el = document.getElementById('hubs');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-[#0B5ED7] hover:bg-[#084298] text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group cursor-pointer border border-white/20 active:scale-95"
          title="Our Offices & Hubs Map"
          aria-label="View Delivery Hubs Map"
        >
          <span className="relative flex h-3 w-3 sm:hidden">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5C84C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F5C84C]"></span>
          </span>
          <MapPin className="w-5 h-5 text-[#F5C84C] group-hover:scale-110 transition-transform shrink-0" />
          <span className="hidden sm:inline text-xs font-heading font-bold uppercase tracking-wider pr-1">
            Offices &amp; Hubs Map
          </span>
        </button>
      )}

      {printableShipment && (
        <PrintableAwbModal
          shipment={printableShipment}
          onClose={() => setPrintableShipment(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <HashRedirect>
            <AppContent />
          </HashRedirect>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
