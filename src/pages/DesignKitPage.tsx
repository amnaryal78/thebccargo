import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Toggle, 
  Tabs, 
  Accordion, 
  Chip, 
  Card, 
  Modal, 
  BottomSheet, 
  Toast, 
  Skeleton, 
  EmptyState, 
  Counter, 
  Timeline, 
  Stepper,
  Spotlight 
} from '../design/primitives';
import { 
  AirFreightIcon, 
  RoadFreightIcon, 
  SeaFreightIcon, 
  CustomsIcon, 
  TearLine, 
  BarcodeStrip, 
  StampMark, 
  RegistrationCorners 
} from '../design/icons';
import { BcLogo } from '../components/BcLogo';
import { Search, ArrowRight, ShieldCheck, Download, AlertTriangle, Layers } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const DesignKitPage: React.FC = () => {

  // Primitive Interactive States
  const [activeTab, setActiveTab] = useState('overview');
  const [toggleState, setToggleState] = useState(true);
  const [chipSelected, setChipSelected] = useState('air');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [demoInput, setDemoInput] = useState('BC-90214-HKG');

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      <SEOHead
        title="BC Cargo Design System Primitive Kit (Internal /_kit)"
        description="Internal living component library and design system token validator."
      />

      {/* Top Header & Theme Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-10 border-b-2 border-[var(--line-strong)] gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BcLogo size="sm" showSubtitle={false} />
            <span className="font-mono text-xs px-2 py-0.5 bg-[#F2B705] text-[#002147] font-bold rounded-[var(--r-sm)] uppercase tracking-wider">
              Internal Kit (/_kit)
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl uppercase tracking-tight">
            Design Tokens &amp; Primitives
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-body">
            Strict industrial palette: Oxford Blue (#002147), Golden Yellow (#F2B705), Ink scale, flat shading only.
          </p>
        </div>

      </div>

      <div className="flex flex-col gap-14">
        {/* SECTION 1: COLOUR SCALES */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
            <Layers className="w-4 h-4 text-[#8C6400]" />
            <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider">
              1. Flat Colour Palette (02_DESIGN.md §1)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Oxford Blue */}
            <div className="flex flex-col gap-1.5 p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)]">
              <span className="text-xs font-heading font-bold uppercase text-[#002147]">Oxford Blue Scale</span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                <div className="h-8 bg-[#EEF3F9] text-black flex items-center justify-center">50</div>
                <div className="h-8 bg-[#D6E1EF] text-black flex items-center justify-center">100</div>
                <div className="h-8 bg-[#AEC3DE] text-black flex items-center justify-center">200</div>
                <div className="h-8 bg-[#4F76A8] text-white flex items-center justify-center">400</div>
                <div className="h-8 bg-[#002147] text-white flex items-center justify-center font-bold">900</div>
              </div>
            </div>

            {/* Golden Yellow */}
            <div className="flex flex-col gap-1.5 p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)]">
              <span className="text-xs font-heading font-bold uppercase text-[#8C6400]">Golden Yellow Scale</span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                <div className="h-8 bg-[#FFF9E0] text-black flex items-center justify-center">50</div>
                <div className="h-8 bg-[#FFE380] text-black flex items-center justify-center">200</div>
                <div className="h-8 bg-[#FAC623] text-black flex items-center justify-center">400</div>
                <div className="h-8 bg-[#F2B705] text-[#002147] flex items-center justify-center font-bold">500</div>
                <div className="h-8 bg-[#8C6400] text-white flex items-center justify-center">700</div>
              </div>
            </div>

            {/* Ink */}
            <div className="flex flex-col gap-1.5 p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)]">
              <span className="text-xs font-heading font-bold uppercase">Ink (Neutral Warm)</span>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                <div className="h-8 bg-[#FFFFFF] border text-black flex items-center justify-center">0</div>
                <div className="h-8 bg-[#F6F6F4] text-black flex items-center justify-center">50</div>
                <div className="h-8 bg-[#D9D8D2] text-black flex items-center justify-center">200</div>
                <div className="h-8 bg-[#474642] text-white flex items-center justify-center">600</div>
                <div className="h-8 bg-[#121211] text-white flex items-center justify-center font-bold">900</div>
              </div>
            </div>

            {/* Signal Red */}
            <div className="flex flex-col gap-1.5 p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)]">
              <span className="text-xs font-heading font-bold uppercase text-[#C02E24]">Signal Red (Sparing)</span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                <div className="h-8 bg-[#F8DAD7] text-black flex items-center justify-center">100</div>
                <div className="h-8 bg-[#ED6B60] text-black flex items-center justify-center">400</div>
                <div className="h-8 bg-[#C02E24] text-white flex items-center justify-center font-bold">500</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BUTTONS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            2. Button Primitives
          </h2>
          <div className="flex flex-wrap items-center gap-4 p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)]">
            <Button variant="primary">Primary CTA (Gold)</Button>
            <Button variant="secondary">Secondary (Oxford)</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Destructive Action</Button>
            <Button variant="primary" isLoading>Loading State</Button>
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              With Icon
            </Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large Waybill</Button>
          </div>
        </section>

        {/* SECTION 3: FORM INPUTS & SELECTS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            3. Inputs, Selects &amp; Toggles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)]">
            <Input
              label="Consignment Waybill AWB"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              helperText="Enter 4-12 digit air/road tracking identifier."
              leftAdornment={<Search className="w-4 h-4" />}
            />

            <Select
              label="Destination Country"
              options={[
                { value: 'NP', label: 'Nepal (Domestic Express)' },
                { value: 'IN', label: 'India (Overland Corridor)' },
                { value: 'US', label: 'United States (Air Express)' },
                { value: 'GB', label: 'United Kingdom (Priority Air)' },
                { value: 'AE', label: 'United Arab Emirates (Air Cargo)' },
              ]}
              helperText="Select receiving international customs gateway."
            />

            <div className="flex flex-col justify-between pt-2">
              <Toggle
                label="Perishable / Liquid Contents"
                description="Requires cold chain documentation and customs declaration."
                checked={toggleState}
                onChange={setToggleState}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: TABS & CHIPS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            4. Tabs &amp; Filter Chips
          </h2>
          <div className="flex flex-col gap-6 p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)]">
            <Tabs
              tabs={[
                { id: 'overview', label: 'Air Express', badge: 'Fastest' },
                { id: 'surface', label: 'Overland Road', badge: 'Eco' },
                { id: 'ocean', label: 'Ocean Freight' },
                { id: 'customs', label: 'Customs Brokerage' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-[var(--text-muted)] mr-2">Filter Chips:</span>
              <Chip active={chipSelected === 'air'} onClick={() => setChipSelected('air')} count={12}>
                Air Cargo
              </Chip>
              <Chip active={chipSelected === 'road'} onClick={() => setChipSelected('road')} count={8}>
                Overland Linehaul
              </Chip>
              <Chip active={chipSelected === 'ocean'} onClick={() => setChipSelected('ocean')} count={4}>
                Ocean Multimodal
              </Chip>
            </div>
          </div>
        </section>

        {/* SECTION 5: CARDS & WAYBILL MOTIFS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            5. Cards &amp; Waybill Motifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Flat Card */}
            <Card variant="flat">
              <h3 className="font-heading font-bold text-base uppercase mb-1">Standard Flat Card</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Clean 2px solid border with crisp 4px radius and hard shadow.</p>
              <Button variant="secondary" size="sm">Inspect Route</Button>
            </Card>

            {/* Waybill Card with Motifs */}
            <Card variant="waybill">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)]">Consignment Note</span>
                <StampMark label="AIR CARGO" sublabel="VERIFIED" variant="gold" />
              </div>
              <h3 className="font-data font-bold text-lg text-[#002147]">BC-90214-HKG</h3>
              <TearLine />
              <BarcodeStrip code="BC-90214-HKG" height={32} />
            </Card>

            {/* Oxford Full-Bleed Card */}
            <Card variant="oxford">
              <h3 className="font-heading font-bold text-base uppercase text-white mb-1">Oxford Blue Container</h3>
              <p className="text-xs text-[#AEC3DE] mb-4">25% brand ratio anchor for corporate sections and hero callouts.</p>
              <Button variant="primary" size="sm">Action Now</Button>
            </Card>
          </div>
        </section>

        {/* SECTION 5B: INTERACTIVE SPOTLIGHT ILLUMINATION */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider">
              5B. Spotlight Pointer Illumination System
            </h2>
            <span className="font-mono text-xs font-bold text-[var(--gold-dark)] uppercase">
              Dark: Golden-Yellow • Light: Oxford-Blue
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Pointer-tracking illumination constrained inside each surface. Uses requestAnimationFrame and CSS properties with zero React re-renders or layout shift.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Spotlight
              intensity="subtle"
              elevateOnHover
              className="p-5 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard-xs space-y-2"
            >
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]">
                Intensity: Subtle
              </span>
              <h4 className="font-heading font-bold text-sm text-[var(--text)]">Standard Content Surface</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Soft atmospheric glow for high-density cards and list items.
              </p>
            </Spotlight>

            <Spotlight
              intensity="normal"
              elevateOnHover
              className="p-5 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard-sm space-y-2"
            >
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--gold-dark)]">
                Intensity: Normal
              </span>
              <h4 className="font-heading font-bold text-sm text-[var(--text)]">Interactive Action Card</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Balanced illumination for calculators, forms, and service cards.
              </p>
            </Spotlight>

            <Spotlight
              intensity="strong"
              elevateOnHover
              className="p-5 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard space-y-2"
            >
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold-dark)]">
                Intensity: Strong
              </span>
              <h4 className="font-heading font-bold text-sm text-[var(--text)]">Primary Feature Spotlight</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Prominent cursor illumination for major value propositions and quotes.
              </p>
            </Spotlight>

            <Spotlight
              intensity="prominent"
              elevateOnHover
              className="p-5 rounded-[var(--r-md)] bg-[#071A33] text-white border border-slate-700/80 shadow-hard-md space-y-2"
            >
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F2B705] text-[#002147]">
                Intensity: Prominent
              </span>
              <h4 className="font-heading font-bold text-sm text-white">Hero Deep Surface</h4>
              <p className="text-xs text-slate-300">
                Ultra-vivid contrast on deep Oxford-blue containers and tracking HUDs.
              </p>
            </Spotlight>
          </div>
        </section>

        {/* SECTION 6: TIMELINE & STEPPER */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            6. Stepper &amp; Freight Milestone Timeline
          </h2>
          <div className="p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)] flex flex-col gap-8">
            <Stepper
              steps={[
                { id: '1', label: 'Booking Request' },
                { id: '2', label: 'Depot Inspection' },
                { id: '3', label: 'Air Transit' },
                { id: '4', label: 'Destination Handover' },
              ]}
              currentStepIndex={currentStep}
              onStepClick={setCurrentStep}
            />

            <Timeline
              items={[
                {
                  id: 'm1',
                  title: 'Consignment Created & Documented',
                  timestamp: '14 Oct 09:30 NPT',
                  location: 'Hetauda Operations Depot',
                  description: 'Parcel weighed, volumetric measure certified, and barcode waybill generated.',
                  status: 'completed',
                },
                {
                  id: 'm2',
                  title: 'Linehaul Transit to TIA Air Cargo Complex',
                  timestamp: '14 Oct 14:15 NPT',
                  location: 'Tribhuvan International Airport (TIA), Kathmandu',
                  description: 'Cleared provincial transit checkpoint; manifest transmitted to air forwarder.',
                  status: 'current',
                },
                {
                  id: 'm3',
                  title: 'Customs Clearance & Air Flight Departure',
                  timestamp: 'Scheduled 15 Oct',
                  location: 'Export Customs Terminal',
                  status: 'pending',
                },
              ]}
            />
          </div>
        </section>

        {/* SECTION 7: BESPOKE FREIGHT ICONS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            7. Custom Freight Icons (1.75px Stroke, No Emoji)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)]">
            <div className="flex flex-col items-center gap-2 p-4 border border-[var(--line)] rounded-[var(--r-sm)] bg-[var(--surface-2)]">
              <AirFreightIcon size={32} className="text-[#002147]" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider">Air Freight</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 border border-[var(--line)] rounded-[var(--r-sm)] bg-[var(--surface-2)]">
              <RoadFreightIcon size={32} className="text-[#002147]" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider">Road Linehaul</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 border border-[var(--line)] rounded-[var(--r-sm)] bg-[var(--surface-2)]">
              <SeaFreightIcon size={32} className="text-[#002147]" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider">Ocean Lines</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 border border-[var(--line)] rounded-[var(--r-sm)] bg-[var(--surface-2)]">
              <CustomsIcon size={32} className="text-[#002147]" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider">Customs Seal</span>
            </div>
          </div>
        </section>

        {/* SECTION 8: ACCORDION, TOAST & MODALS */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            8. Dialogs, Toasts, Counter &amp; Accordion
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Accordion
                items={[
                  {
                    id: 'faq1',
                    title: 'How is volumetric chargeable weight calculated?',
                    content: 'Volumetric weight is computed as (Length × Width × Height in cm) divided by 5000 for Air Express, and 6000 for Overland Linehaul.',
                  },
                  {
                    id: 'faq2',
                    title: 'Can liquids or food items be shipped internationally?',
                    content: 'Special handling surcharges and export documentation apply. Prohibited items cannot be shipped under air safety regulations.',
                  },
                ]}
              />

              <div className="flex flex-col gap-3">
                <Toast type="success" title="Booking Confirmed" message="Your consignment REF-4091 has been scheduled for doorstep pickup." />
                <Toast type="warning" title="Packaging Inspection Required" message="Liquids require secondary absorbent seal wrap." />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)] justify-between">
              <div>
                <h3 className="font-heading font-bold text-base uppercase mb-1">Live Animated Number Counters</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Triggered on view with IntersectionObserver.</p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-sm)]">
                    <Counter to={50} suffix="+" className="text-3xl text-[#002147]" />
                    <p className="text-[11px] font-heading uppercase text-[var(--text-muted)] mt-1">Global Gateways</p>
                  </div>
                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-sm)]">
                    <Counter to={18500} prefix="NPR " className="text-2xl text-[#8C6400]" />
                    <p className="text-[11px] font-heading uppercase text-[var(--text-muted)] mt-1">Starting Air Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--line)]">
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                  Trigger Modal
                </Button>
                <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                  Trigger Bottom Sheet
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: SKELETON & EMPTY STATE */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider border-b border-[var(--line)] pb-2">
            9. Skeleton &amp; Empty State
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-sm)] flex flex-col gap-3">
              <span className="text-xs font-mono uppercase text-[var(--text-muted)]">Skeleton Loaders:</span>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="rect" width="100%" height={80} />
            </div>

            <EmptyState
              title="No Consignments in Queue"
              description="Enter a valid Air Waybill (AWB) or book a scheduled doorstep pickup to track live cargo."
              actionLabel="Book First Pickup"
              onAction={() => alert('Book action clicked')}
            />
          </div>
        </section>
      </div>

      {/* Modal Dialog Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Consignment Waybill Manifest"
        description="Air Cargo Master Waybill #BC-90214-HKG"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>Print Waybill</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-[var(--text-secondary)]">
          <p>This modal dialog traps keyboard focus, listens for Escape key, and uses crisp flat industrial theme tokens.</p>
          <BarcodeStrip code="BC-90214-HKG" />
        </div>
      </Modal>

      {/* Bottom Sheet Demo */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Destination Quick Details"
        footer={<Button variant="primary" className="w-full" onClick={() => setIsSheetOpen(false)}>Confirm Destination</Button>}
      >
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Android-first bottom sheet drawer with grab handle and backdrop touch dismissal. Designed for comfortable one-thumb ergonomics on 360px mobile viewports.
        </p>
      </BottomSheet>
    </div>
  );
};
