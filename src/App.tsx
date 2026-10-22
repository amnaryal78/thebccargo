import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HashRedirect } from './router/HashRedirect';
import { Shipment, ServiceMode } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { StickyContactButtons } from './components/StickyContactButtons';
import { RouteLoader } from './components/RouteLoader';
import { BootSignal } from './boot/BootSignal';

// Code-Split Lazy Loaded Page & Section Components for Core Web Vitals Optimization
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const TrackingSection = lazy(() => import('./components/TrackingSection').then(m => ({ default: m.TrackingSection })));
const BookingSystem = lazy(() => import('./components/BookingSystem').then(m => ({ default: m.BookingSystem })));
const ServicesSuite = lazy(() => import('./components/ServicesSuite').then(m => ({ default: m.ServicesSuite })));
const PrintableAwbModal = lazy(() => import('./components/PrintableAwbModal').then(m => ({ default: m.PrintableAwbModal })));

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RatesPage = lazy(() => import('./pages/RatesPage').then(m => ({ default: m.RatesPage })));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage').then(m => ({ default: m.PoliciesPage })));
const HowToShipPage = lazy(() => import('./pages/HowToShipPage').then(m => ({ default: m.HowToShipPage })));
const BecomePartnerPage = lazy(() => import('./pages/BecomePartnerPage').then(m => ({ default: m.BecomePartnerPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage').then(m => ({ default: m.CareerDetailPage })));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const DesignKitPage = lazy(() => import('./pages/DesignKitPage').then(m => ({ default: m.DesignKitPage })));
const CountryLandingPage = lazy(() => import('./pages/country/CountryLandingPage').then(m => ({ default: m.CountryLandingPage })));


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
    if (path.startsWith('how-to-ship')) return 'how-to-ship';
    if (path.startsWith('faq')) return 'faq';
    if (path.startsWith('careers')) return 'careers';
    if (path.startsWith('login')) return 'login';
    return path;
  };

  const handleNavigate = (sectionId: string) => {
    const pathToNavigate = sectionId === 'home' ? '/' : sectionId.startsWith('/') ? sectionId : `/${sectionId}`;
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
    <div className="min-h-screen flex flex-col bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] transition-colors">
      <BootSignal mark="app" />
      <CustomCursor />
      {!isAdminRoute && (
        <Header
          onNavigate={handleNavigate}
          activeSection={getActiveSectionFromPath()}
          onQuickTrack={(code) => handleQuickTrack(code)}
          onOpenBooking={handleOpenBooking}
        />
      )}

      <main className={`flex-1 ${!isAdminRoute ? 'pt-24 pb-20 lg:pb-0' : ''}`}>
        <Suspense fallback={<RouteLoader />}>
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
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/services/courier-nat" element={<Navigate to="/services" replace />} />
            <Route path="/services/haulage-nat" element={<Navigate to="/services" replace />} />
            <Route path="/services/nepal-domestic-express" element={<Navigate to="/services" replace />} />
            <Route path="/services/domestic-express-cargo" element={<Navigate to="/services" replace />} />
            
            {/* Rates Routes */}
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/rates/national" element={<Navigate to="/rates" replace />} />
            <Route path="/rates/international" element={<RatesPage />} />
            <Route path="/rates/calculator" element={<Navigate to="/rates" replace />} />
            <Route path="/rates/rfq" element={<RatesPage />} />

            {/* Knowledge Base & Blog Routes */}
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />

            {/* Dedicated Public Information Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/how-to-ship" element={<HowToShipPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/become-a-partner" element={<BecomePartnerPage />} />

            {/* Top Country Corridor SEO Landing Pages */}
            <Route path="/send-parcel-nepal-to-south-korea" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-south-korea" />} />
            <Route path="/send-parcel-nepal-to-malaysia" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-malaysia" />} />
            <Route path="/send-parcel-nepal-to-uk" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-uk" />} />
            <Route path="/send-parcel-nepal-to-japan" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-japan" />} />
            <Route path="/send-parcel-nepal-to-europe" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-europe" />} />
            <Route path="/send-parcel-nepal-to-gulf" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-gulf" />} />
            <Route path="/send-parcel-nepal-to-hong-kong" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-hong-kong" />} />
            <Route path="/send-parcel-nepal-to-usa" element={<CountryLandingPage forcedSlug="send-parcel-nepal-to-usa" />} />
            <Route path="/send-parcel-nepal-to-:corridor" element={<CountryLandingPage />} />

            {/* Careers Routes */}
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<CareerDetailPage />} />

            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

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
            
            {/* Design System Verification Kit (Noindex, Internal) */}
            <Route path="/_kit" element={<DesignKitPage />} />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <BootSignal mark="route" />
        </Suspense>
      </main>

      {!isAdminRoute && <Footer onNavigate={handleNavigate} />}

      {/* Mobile Sticky Direct Contact Buttons & Android Bottom Nav Bar */}
      {!isAdminRoute && <StickyContactButtons />}
      {!isAdminRoute && (
        <AndroidBottomNav
          activeSection={getActiveSectionFromPath()}
          onNavigate={handleNavigate}
          onOpenBooking={handleOpenBooking}
        />
      )}

      {printableShipment && (
        <Suspense fallback={null}>
          <PrintableAwbModal
            shipment={printableShipment}
            onClose={() => setPrintableShipment(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <HashRedirect>
            <AppContent />
          </HashRedirect>
        </BrowserRouter>
      </AuthProvider>
  );
}
