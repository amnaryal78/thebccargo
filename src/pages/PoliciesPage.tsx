import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  FileCheck2, 
  Printer, 
  ChevronRight,
  Scale
} from 'lucide-react';
import { Button } from '../design/primitives/Button';
import { SEOHead } from '../components/SEOHead';
import { Spotlight } from '../components/ui/spotlight';
import { PAGE_META } from '../data/pageMeta';

interface PolicySection {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  lastUpdated: string;
  summary: string;
  content: React.ReactNode;
}

const POLICIES: PolicySection[] = [
  {
    id: 'terms-of-carriage',
    title: 'Standard Terms & Conditions of Carriage',
    shortTitle: 'Terms of Carriage',
    icon: FileText,
    lastUpdated: 'October 2026',
    summary: 'Standard trading terms governing all cross-border road linehaul and international air cargo tendered to The BC Cargo & Courier under Air Waybills and Consignment Notes.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">1. Principle of Agreement</h3>
          <p>
            By tendering a consignment to The BC Cargo &amp; Courier ("Company") under an Air Waybill (AWB), Consignment Note, or electronic booking reference, the shipper ("Consignor") agrees to these standard conditions on behalf of themselves and all parties with an interest in the consignment.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">2. Shipper Warranties &amp; Declarations</h3>
          <p>
            The shipper warrants that all declarations relating to cargo descriptions, gross weight, volumetric dimensions, and values are accurate. Shippers must ensure cargo is packed securely to withstand the ordinary risks of multimodal transit, including air carriage turbulence and highland road conditions.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">3. Right of Inspection &amp; Security Screening</h3>
          <p>
            In compliance with the Civil Aviation Authority of Nepal (CAAN) and international aviation security mandates, all air cargo packages are subject to X-ray inspection, explosive trace detection, and physical verification at Tribhuvan International Airport (TIA) bonded cargo facilities.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">4. Delivery &amp; Handover</h3>
          <p>
            Shipments will be delivered to the consignee address specified on the consignment note. If delivery cannot be completed due to incorrect recipient information or refusal to accept, the shipper remains liable for storage charges and return transit costs.
          </p>
        </section>
      </div>
    )
  },
  {
    id: 'privacy-policy',
    title: 'Privacy & Data Protection Policy',
    shortTitle: 'Privacy Policy',
    icon: Lock,
    lastUpdated: 'October 2026',
    summary: 'How BC Cargo collects, uses, and protects customer telemetry, booking records, and commercial trade identities.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">1. Legislative Compliance</h3>
          <p>
            The BC Cargo &amp; Courier processes customer and commercial data in full compliance with the Privacy Act 2075 (2018) of Nepal and applicable international data protection standards.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">2. Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Shipper &amp; Consignee Details:</strong> Full name, verified tax identifier (PAN/EXIM), physical address, email, and contact phone numbers.</li>
            <li><strong>Shipment Telemetry:</strong> Milestone checkpoints, e-seal verification status, transit times, and carrier routing identifiers.</li>
            <li><strong>Customs Documents:</strong> Commercial invoices, packing lists, and Pragyapan Patra declarations necessary for customs entry.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">3. Zero PII Public Disclosure</h3>
          <p>
            Public tracking searches query an isolated RPC projection (<code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--surface-2)]">get_public_shipment</code>) that completely excludes customer names, contact numbers, and monetary invoices. Live milestone data is strictly limited to transit checkpoints and operational statuses.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">4. Data Retention</h3>
          <p>
            Air Waybill records and customs manifests are securely archived for seven (7) years in accordance with Nepal Department of Customs regulatory mandates.
          </p>
        </section>
      </div>
    )
  },
  {
    id: 'cargo-liability',
    title: 'Cargo Liability & Transit Insurance Policy',
    shortTitle: 'Liability & Insurance',
    icon: ShieldCheck,
    lastUpdated: 'October 2026',
    summary: 'Carrier liability limits, statutory international conventions, and optional all-risk cargo insurance provisions.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">1. International Carriage Limits</h3>
          <p>
            Where air carriage is involved, the Company's liability for loss or damage is limited in accordance with the Montreal Convention (or Warsaw Convention where applicable) to 22 Special Drawing Rights (SDR) per kilogram, unless a higher declared value is contracted prior to departure.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">2. Cross-Border Road Linehaul Limits</h3>
          <p>
            For overland linehaul carriage between Nepal and transit ports/terminals (including Kolkata / Haldia / border ICDs), liability is limited to SDR 8.33 per kilogram or CMR-equivalent statutory limits unless declared value insurance has been contracted.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">3. All-Risk Comprehensive Insurance</h3>
          <p>
            Shippers may elect to purchase comprehensive first-party transit insurance covering Institute Cargo Clauses (A) all-risk protection up to 110% of the CIF commercial invoice value.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">4. Exclusions from Liability</h3>
          <p>
            The Company shall not be liable for damage arising from inherent vice of the goods, improper packaging by the consignor, acts of God (natural landslides, extreme mountain floods), or civil authority customs seizures.
          </p>
        </section>
      </div>
    )
  },
  {
    id: 'dangerous-goods',
    title: 'Restricted & Prohibited Cargo Policy',
    shortTitle: 'Dangerous Goods',
    icon: AlertTriangle,
    lastUpdated: 'October 2026',
    summary: 'Mandatory rules on hazardous materials, lithium battery transport, perishable biologicals, and contraband.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">1. Strictly Prohibited Commodities</h3>
          <p>Under no circumstances does BC Cargo accept:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Illegal narcotics, psychotropic substances, or unregulated pharmaceuticals.</li>
            <li>Firearms, ammunition, explosive devices, or military tactical hardware.</li>
            <li>Antiquities, archaeological artifacts, or cultural relics lacking Department of Archaeology export permits.</li>
            <li>Live animals or endangered wildlife species listed under CITES appendices.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">2. Regulated Dangerous Goods (IATA DG)</h3>
          <p>
            Commodities such as lithium-ion battery packs, perfumes, aerosols, and laboratory reagents must be declared prior to booking. Such consignments require UN-certified packaging, Dangerous Goods Shipper's Declarations (DGD), and certified handler sign-off.
          </p>
        </section>
      </div>
    )
  },
  {
    id: 'claims-disputes',
    title: 'Claims & Dispute Resolution Procedure',
    shortTitle: 'Claims & Disputes',
    icon: Scale,
    lastUpdated: 'October 2026',
    summary: 'Statutory notice deadlines for cargo distress, documentation requirements, and arbitration jurisdiction.',
    content: (
      <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">1. Time Limits for Notification</h3>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Visible Damage / Shortage:</strong> Notice must be noted on the delivery receipt and submitted in writing within <strong>7 calendar days</strong> of receipt.</li>
            <li><strong>Concealed Damage:</strong> Written notice within <strong>14 calendar days</strong> of delivery.</li>
            <li><strong>Non-Delivery / Total Loss:</strong> Formal claim filed within <strong>21 calendar days</strong> of scheduled delivery date.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">2. Claim Documentation Package</h3>
          <p>
            All formal claims must include: (a) Original Air Waybill / Consignment Note copy, (b) Commercial invoice &amp; packing list, (c) High-resolution photographic evidence of packaging distress, and (d) Official Joint Survey Report if applicable.
          </p>
        </section>

        <section>
          <h3 className="font-heading font-bold text-base text-[var(--text)] mb-2">3. Jurisdiction &amp; Governing Law</h3>
          <p>
            These conditions and any dispute arising hereunder shall be governed by the laws of Nepal. Any unresolved disputes shall be submitted to binding arbitration in Hetauda or Kathmandu under the Nepal Arbitration Act 2055.
          </p>
        </section>
      </div>
    )
  }
];

export const PoliciesPage: React.FC = () => {
  const [activePolicyId, setActivePolicyId] = useState<string>('terms-of-carriage');

  const currentPolicy = POLICIES.find((p) => p.id === activePolicyId) || POLICIES[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10">
      <SEOHead
        title={PAGE_META['/policies'].title}
        description={PAGE_META['/policies'].description}
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--oxford-deep)] text-xs font-mono font-bold uppercase tracking-wider">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Statutory Terms &amp; Compliance</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] tracking-tight">
          Policies &amp; Conditions of Carriage
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Governing agreements for cross-border freight corridor linehaul, international air waybills, customs declarations, and cargo protection.
        </p>
      </div>

      {/* Desktop / Mobile Policy Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="p-3 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] shadow-hard-sm flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold px-3 py-1 block">
              Policy Documents
            </span>
            {POLICIES.map((policy) => {
              const Icon = policy.icon;
              const isActive = policy.id === activePolicyId;
              return (
                <button
                  key={policy.id}
                  onClick={() => setActivePolicyId(policy.id)}
                  className={`w-full text-left p-3.5 rounded-[var(--r-xs)] text-xs font-heading font-bold transition-all duration-[var(--t-fast)] flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--oxford-deep)] text-white shadow-hard-sm'
                      : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{policy.shortTitle}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-1' : 'opacity-40'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Legal Help Card */}
          <div className="p-5 rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--line)] shadow-hard-xs flex flex-col gap-2">
            <span className="text-[11px] font-mono text-[var(--gold-dark)] font-bold uppercase">
              Legal &amp; Claims Desk
            </span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              For official notices, insurance survey reports, or customs declarations inquiries, contact our compliance desk directly.
            </p>
            <a
              href="mailto:info@thebccargo.com"
              className="text-xs font-mono font-bold text-[var(--oxford-deep)] hover:underline pt-1 inline-block"
            >
              info@thebccargo.com ➔
            </a>
          </div>
        </div>

        {/* Policy Document Content Area (8 cols on lg) */}
        <div className="lg:col-span-8">
          <Spotlight
            intensity="subtle"
            className="p-6 sm:p-10 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard flex flex-col gap-8"
          >
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-[var(--gold-dark)] uppercase font-bold">
                  Official Standard Trading Conditions • Effective {currentPolicy.lastUpdated}
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text)]">
                  {currentPolicy.title}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                  {currentPolicy.summary}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="shrink-0 self-start sm:self-auto"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                <span>Print Policy</span>
              </Button>
            </div>

            {/* Document Text */}
            <div>
              {currentPolicy.content}
            </div>

            {/* Footer Certification Note */}
            <div className="pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] font-mono">
              <span>The BC Cargo &amp; Courier Legal &amp; Compliance Directorate</span>
              <span>School Road -4, Hetauda, Nepal</span>
            </div>

          </Spotlight>
        </div>

      </div>
    </div>
  );
};
