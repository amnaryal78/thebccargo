/**
 * Prerenders static HTML files for all public routes into dist/<route>/index.html
 * Injects static title, meta description, canonical, OpenGraph, Twitter, and JSON-LD schemas
 * Guarantees zero-JS social preview rendering (WhatsApp, Facebook, Twitter, Googlebot).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_URL = 'https://thebccargo.com';

const ROUTE_METADATA = {
  '/': {
    title: 'BC Cargo & Courier — Freight & Express Courier from Nepal',
    description: 'Reliable air cargo, overland cross-border freight, ocean shipping, and express courier from Nepal to 220+ destinations. Central operations in Hetauda & TIA.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'The BC Cargo & Courier',
        url: BASE_URL,
        logo: `${BASE_URL}/icon-512.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+977-57-591816',
          contactType: 'Customer Support',
          areaServed: ['NP', 'IN', 'US', 'GB', 'DE', 'AE', 'AU', 'JP'],
          availableLanguage: ['English', 'Nepali']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'The BC Cargo & Courier - Central HQ',
        image: `${BASE_URL}/og-banner.png`,
        telephone: '+977-57-591816',
        email: 'thebccargo@gmail.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'School Road -4',
          addressLocality: 'Hetauda',
          addressCountry: 'NP'
        }
      }
    ]
  },
  '/rates': {
    title: 'Rate Estimator & Freight Matrices | The BC Cargo & Courier',
    description: 'Calculate door-to-port and doorstep courier freight rates from Nepal with instant volumetric weights, handling fees, and live corridor tariff matrices.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'The BC Cargo Rate Estimator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'NPR',
        price: '500'
      }
    }
  },
  '/rates/international': {
    title: 'International Courier Rates from Nepal | The BC Cargo & Courier',
    description: 'Official worldwide cargo and express air courier tariff matrix from Nepal to 190+ countries and global ports.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/rates/rfq': {
    title: 'Request a Quote (RFQ) | Commercial Air Cargo | BC Cargo',
    description: 'Submit high-volume commercial air freight, full-flight charters, and bulk logistics RFQs to BC Cargo operations desk in Nepal.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/services': {
    title: 'Multimodal Freight & Logistics Services | The BC Cargo & Courier',
    description: 'End-to-end international logistics solutions from Nepal: scheduled air cargo freight, overland road transport, ocean container shipping, and customs clearance.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/services/international-air-freight': {
    title: 'International Air Freight Express from Nepal | The BC Cargo',
    description: 'Priority scheduled air cargo charters and belly space via Kathmandu TIA to 190+ international airports. 48-72 hour global SLA.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'International Air Freight Express',
      provider: {
        '@type': 'Organization',
        name: 'The BC Cargo & Courier'
      },
      areaServed: 'Worldwide',
      serviceType: 'Air Cargo Logistics',
      description: 'Priority international air cargo shipments routed through Tribhuvan International Airport (TIA), Kathmandu.'
    }
  },
  '/services/cross-border-overland': {
    title: 'Cross-Border Overland Freight (Nepal-India) | BC Cargo',
    description: 'High-capacity heavy linehaul fleets connecting Birgunj Dry Port, Kolkata maritime terminal, and Indian industrial corridors.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Cross-Border Overland Linehaul (Nepal-India)',
      provider: {
        '@type': 'Organization',
        name: 'The BC Cargo & Courier'
      },
      areaServed: ['NP', 'IN'],
      serviceType: 'Overland Highway Freight'
    }
  },
  '/services/ocean-freight-intermodal': {
    title: 'Ocean Multimodal Shipping Lines (FCL/LCL) | The BC Cargo',
    description: 'Global container shipping connected from Nepal inland dry ports via Kolkata and Visakhapatnam to European, American, and Gulf seaports.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Ocean Multimodal Shipping Lines (FCL / LCL)',
      provider: {
        '@type': 'Organization',
        name: 'The BC Cargo & Courier'
      },
      serviceType: 'Ocean Freight Shipping'
    }
  },
  '/services/customs-brokerage-clearance': {
    title: 'Nepal Customs Brokerage & Border Clearance | The BC Cargo',
    description: 'Licensed customs agent #B-409 providing rapid clearance, ASYCUDA filing, Certificate of Origin, and export documentation at Kathmandu TIA and Birgunj dry port.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Customs Brokerage & Border Clearance (License #B-409)',
      provider: {
        '@type': 'Organization',
        name: 'The BC Cargo & Courier'
      },
      areaServed: ['NP', 'IN', 'Worldwide'],
      serviceType: 'Customs Clearance & Trade Compliance'
    }
  },
  '/about': {
    title: 'About Us | The BC Cargo & Courier — Hetauda & Kathmandu',
    description: 'Nepal\'s trusted freight forwarder and licensed customs broker (#B-409). 24/7 central transshipment operations rooted in Makwanpur since 2012.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/contact': {
    title: 'Contact Us & Operating Hubs | The BC Cargo & Courier',
    description: 'Connect with central dispatch at School Road -4 Hetauda HQ, Kathmandu TIA cargo terminal, Birgunj ICD, or Pokhara hub. Real-time operating status.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/track': {
    title: 'Track Waybill Consignment | The BC Cargo & Courier',
    description: 'Direct database tracking across Nepal linehaul, bonded customs checkpoints, and international air waybills. Zero-PII public lookup.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/book': {
    title: 'Book Cargo Consignment Online | The BC Cargo & Courier',
    description: 'Direct booking into central dispatch. Secure waybill generation and collection coordination across Nepal.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/careers': {
    title: 'Careers in Aviation & Logistics | The BC Cargo & Courier',
    description: 'Explore active job vacancies in air cargo operations, customs clearance, fleet dispatch, and logistics technology at BC Cargo across Nepal.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/careers/customs-broker-specialist': {
    title: 'Customs Clearance Specialist Job Opening | BC Cargo Nepal',
    description: 'Join BC Cargo as a licensed Customs Broker Specialist at Birgunj Dry Port & TIA Kathmandu. Full-time position with comprehensive benefits.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: 'Senior Customs Clearance Specialist',
      description: 'Lead commercial customs declarations and Pragyapan Patra clearance under Department of Customs license #B-409.',
      datePosted: '2026-10-01',
      validThrough: '2026-12-31',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'The BC Cargo & Courier',
        sameAs: BASE_URL,
        logo: `${BASE_URL}/icon-512.png`
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Customs Yard Office #4, Sirsia ICD',
          addressLocality: 'Birgunj',
          addressRegion: 'Parsa',
          addressCountry: 'NP'
        }
      }
    }
  },
  '/careers/air-cargo-operations-lead': {
    title: 'Air Cargo Operations Lead Job Opening | BC Cargo TIA',
    description: 'Coordinate passenger belly cargo allocations and CAAN-certified cargo escort operations at Tribhuvan International Airport (TIA).',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/careers/cross-border-fleet-dispatcher': {
    title: 'Cross-Border Fleet Dispatcher Job Opening | BC Cargo',
    description: 'Manage intermodal container haulage, GPS telemetry, and Nepal-India cross-border freight movements at Hetauda HQ.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/careers/warehouse-sortation-supervisor': {
    title: 'Warehouse Sortation Supervisor Job Opening | BC Cargo',
    description: 'Oversee package sortation, volumetric weight calibration, and e-seal application at Hetauda Central Sorting Depot.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/blogs': {
    title: 'Trade & Logistics Knowledge Base | The BC Cargo & Courier',
    description: 'Authoritative analysis on Nepal export procedures, customs regulations (#B-409), transit corridors, and international air cargo logistics.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/blogs/nepal-air-cargo-customs-guide-2026': {
    title: 'Nepal Air Cargo Customs Guide 2026 | The BC Cargo',
    description: 'Complete breakdown of export tariffs, Pragyapan Patra electronic filing, and CAAN inspection standards at Tribhuvan International Airport.',
    ogType: 'article',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Nepal Air Cargo Customs Clearance Guide 2026',
        description: 'Complete breakdown of export tariffs, Pragyapan Patra electronic filing, and CAAN inspection standards at Tribhuvan International Airport.',
        image: `${BASE_URL}/og-banner.png`,
        datePublished: '2026-10-10T08:00:00+05:45',
        dateModified: '2026-10-12T10:00:00+05:45',
        author: {
          '@type': 'Person',
          name: 'Prakash Adhikari',
          jobTitle: 'Senior Customs Broker (#B-409)'
        },
        publisher: {
          '@type': 'Organization',
          name: 'The BC Cargo & Courier',
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/icon-512.png`
          }
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Knowledge Base', item: `${BASE_URL}/blogs` },
          { '@type': 'ListItem', position: 3, name: 'Nepal Air Cargo Customs Guide', item: `${BASE_URL}/blogs/nepal-air-cargo-customs-guide-2026` }
        ]
      }
    ]
  },
  '/blogs/kolkata-dry-port-rail-transit-guide': {
    title: 'Kolkata Port to Birgunj ICD Transit Guide | The BC Cargo',
    description: 'Navigating customs escrow, electronic cargo tracking systems (ECTS), and direct rail linehaul from Indian seaports into Nepal.',
    ogType: 'article',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/blogs/cold-chain-pharma-logistics-nepal': {
    title: 'Cold-Chain Pharma Logistics in Nepal | The BC Cargo',
    description: 'Maintaining +2°C to +8°C thermal compliance across high-altitude mountain corridors and passenger airline cargo holds.',
    ogType: 'article',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) | The BC Cargo & Courier',
    description: 'Clear answers to common questions about air waybills, customs documents (#B-409), dimensional weight, freight billing, and tracking in Nepal.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does customs clearance work for export from Nepal?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every commercial shipment leaving Nepal passes through the Department of Customs. Our licensed in-house customs brokers (License #B-409) submit the required electronic declarations directly through ASYCUDA World.'
          }
        },
        {
          '@type': 'Question',
          name: 'How is volumetric weight calculated for air freight?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under IATA standards, volumetric weight is calculated as Length (cm) × Width (cm) × Height (cm) / 5000 (or 6000 for overland freight).'
          }
        }
      ]
    }
  },
  '/policies': {
    title: 'Policies & Conditions of Carriage | The BC Cargo & Courier',
    description: 'Official trading terms, cargo liability limits under Montreal Convention, customs broker policies (#B-409), and claims resolution procedures.',
    ogType: 'website',
    ogImage: `${BASE_URL}/og-banner.png`
  },
  '/how-to-ship': {
    title: 'How to Ship | Before You Ship | The BC Cargo & Courier',
    description: 'Simple bilingual parcel shipping guide. Learn what you can send, prohibited items, required customs documents, and packaging instructions before dispatch.',
    ogType: 'article',
    ogImage: `${BASE_URL}/og-banner.png`
  },

  // =========================================================================
  // TOP COUNTRY CORRIDORS (Phase 4 High-Converting SEO Landing Pages)
  // =========================================================================
  '/send-parcel-nepal-to-south-korea': {
    title: 'Cargo & Parcel Service from Hetauda Nepal to South Korea | BC Cargo',
    description: 'Send parcel and commercial cargo from Hetauda and Nepal to South Korea. Doorstep pickup in Hetauda, fast air freight via Incheon (ICN), transparent live tariffs, and customs assistance.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'The BC Cargo & Courier - Hetauda Central HQ',
        telephone: '+977-9855019485',
        email: 'thebccargo@gmail.com',
        url: `${BASE_URL}/send-parcel-nepal-to-south-korea`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'School Road -4',
          addressLocality: 'Hetauda',
          addressCountry: 'NP'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Cargo Service from Hetauda Nepal to South Korea',
        provider: { '@type': 'Organization', name: 'The BC Cargo & Courier' },
        areaServed: ['South Korea', 'Nepal'],
        serviceType: 'International Air Freight & Express Courier'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I send a parcel from Hetauda to South Korea?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bring your items to our Hetauda Central Office at School Road -4, Hetauda, or schedule a doorstep pickup in Makwanpur. We inspect, pack into standard 20 kg cartons, and generate live quotation bills.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I send meat products like Sukuti to South Korea?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. South Korean agricultural quarantine strictly prohibits all animal meat and livestock products from Nepal.'
            }
          }
        ]
      }
    ],
    bodyHtml: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 2.5rem 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #102033; line-height: 1.6;">
        <header style="border-bottom: 3px solid #002147; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <span style="display: inline-block; padding: 4px 12px; background: #002147; color: #F2B705; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">
            🇰🇷 Nepal to South Korea Air Cargo
          </span>
          <h1 style="color: #002147; font-size: 2.2rem; font-weight: 800; margin: 0.8rem 0 0.4rem 0;">
            Send Parcel from Hetauda &amp; Nepal to South Korea
          </h1>
          <p style="font-size: 1.1rem; color: #475569; margin: 0;">
            Fast, secure air cargo and courier service from our Hetauda Central Hub to Seoul, Busan, Incheon, and across South Korea. Live per-kg tariffs, box packaging, and customs clearance.
          </p>
          <div style="margin-top: 1.2rem; font-size: 0.9rem; font-weight: 600; color: #002147; background: #eef3f8; padding: 10px 14px; border-radius: 6px;">
            <span>⏱ 3–5 Business Days</span> • 
            <span>📍 Central Office: School Road -4, Hetauda, Nepal</span> • 
            <span>📞 057-591816 / 9855019485</span>
          </div>
        </header>

        <section style="margin-bottom: 2rem;">
          <h2 style="color: #002147; font-size: 1.4rem;">Export Packing Standards &amp; Box Limits</h2>
          <p>Every international air cargo consignment is partitioned into cartons of maximum 20 kg each for safe air freight handling and certified electronic scale weighing.</p>
          <ul>
            <li>Double-wall corrugated export cartons required.</li>
            <li>Box packaging charge: Rs 1,000 per box.</li>
            <li>Recipient Korean address, local telephone, and PCCC / ARC recommended.</li>
          </ul>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="color: #002147; font-size: 1.4rem;">Customs Restrictions for South Korea</h2>
          <p style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px; color: #92400e; font-size: 0.95rem;">
            <strong>Important Restriction:</strong> Animal meat and meat-containing products (Sukuti, sausages, jerky) are strictly prohibited for South Korea by national quarantine authorities.
          </p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="color: #002147; font-size: 1.4rem;">Hetauda Central Office Drop-off &amp; Doorstep Booking</h2>
          <p>Bring your parcels directly to our Hetauda headquarters at School Road -4, Hetauda. Doorstep collection is also available across Makwanpur and Kathmandu Valley.</p>
        </section>

        <section style="margin-bottom: 2rem;">
          <h2 style="color: #002147; font-size: 1.4rem;">Frequently Asked Questions</h2>
          <div style="margin-bottom: 1rem;">
            <h3 style="color: #002147; font-size: 1.1rem; margin-bottom: 4px;">How do I send a parcel from Hetauda to South Korea?</h3>
            <p style="margin: 0; color: #475569;">Visit our Central Office at School Road -4, Hetauda, or schedule a doorstep pickup. We weigh, inspect, pack into standard 20 kg boxes, and generate your live quotation bill and tracking number.</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <h3 style="color: #002147; font-size: 1.1rem; margin-bottom: 4px;">Can I send meat products like Sukuti to Korea?</h3>
            <p style="margin: 0; color: #475569;">No. South Korean quarantine regulations strictly prohibit all animal meat and livestock products from Nepal.</p>
          </div>
        </section>
      </main>
    `
  },

  '/send-parcel-nepal-to-malaysia': {
    title: 'Send Courier from Hetauda Nepal to Malaysia | BC Cargo',
    description: 'Economical cargo and courier services from Hetauda and Kathmandu to Malaysia. Fast 3–5 day delivery to Kuala Lumpur and Selangor with full customs documentation.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'The BC Cargo & Courier - Hetauda Central HQ',
        telephone: '+977-9855019485',
        url: `${BASE_URL}/send-parcel-nepal-to-malaysia`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'School Road -4',
          addressLocality: 'Hetauda',
          addressCountry: 'NP'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Cargo Service from Hetauda Nepal to Malaysia',
        provider: { '@type': 'Organization', name: 'The BC Cargo & Courier' }
      }
    ],
    bodyHtml: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 2.5rem 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #102033; line-height: 1.6;">
        <header style="border-bottom: 3px solid #002147; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <span style="display: inline-block; padding: 4px 12px; background: #002147; color: #F2B705; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">
            🇲🇾 Nepal to Malaysia Air Cargo
          </span>
          <h1 style="color: #002147; font-size: 2.2rem; font-weight: 800; margin: 0.8rem 0 0.4rem 0;">
            Express Parcel Delivery from Hetauda &amp; Nepal to Malaysia
          </h1>
          <p style="font-size: 1.1rem; color: #475569; margin: 0;">
            Reliable air courier for families, students, and businesses from Hetauda Central Hub to Kuala Lumpur, Penang, Johor Bahru, and throughout Malaysia.
          </p>
          <div style="margin-top: 1.2rem; font-size: 0.9rem; font-weight: 600; color: #002147; background: #eef3f8; padding: 10px 14px; border-radius: 6px;">
            <span>⏱ 3–5 Business Days</span> • 
            <span>📍 Central Office: School Road -4, Hetauda, Nepal</span> • 
            <span>📞 057-591816 / 9855019485</span>
          </div>
        </header>

        <section style="margin-bottom: 2rem;">
          <h2 style="color: #002147; font-size: 1.4rem;">Service Features</h2>
          <p>Scheduled air departures from Nepal connecting directly into Kuala Lumpur International Airport (KUL) with last-mile door delivery.</p>
        </section>
      </main>
    `
  },

  '/send-parcel-nepal-to-uk': {
    title: 'Air Cargo & Parcel Service from Hetauda to UK | The BC Cargo',
    description: 'Send personal packages, legal documents, dry foods, and commercial goods from Hetauda Nepal to the UK. 3–5 day delivery to London and nationwide.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`,
    bodyHtml: `
      <main style="max-width: 1000px; margin: 0 auto; padding: 2.5rem 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #102033; line-height: 1.6;">
        <header style="border-bottom: 3px solid #002147; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <span style="display: inline-block; padding: 4px 12px; background: #002147; color: #F2B705; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">
            🇬🇧 Nepal to United Kingdom Air Cargo
          </span>
          <h1 style="color: #002147; font-size: 2.2rem; font-weight: 800; margin: 0.8rem 0 0.4rem 0;">
            Send Parcel &amp; Cargo from Hetauda &amp; Nepal to United Kingdom
          </h1>
          <p style="font-size: 1.1rem; color: #475569; margin: 0;">
            Priority air courier from Hetauda to London, Birmingham, Manchester, Edinburgh, and across Great Britain. Sukuti and meat compliance available.
          </p>
          <div style="margin-top: 1.2rem; font-size: 0.9rem; font-weight: 600; color: #002147; background: #eef3f8; padding: 10px 14px; border-radius: 6px;">
            <span>⏱ 3–5 Business Days</span> • 
            <span>📍 Central Office: School Road -4, Hetauda, Nepal</span> • 
            <span>📞 057-591816 / 9855019485</span>
          </div>
        </header>
      </main>
    `
  },

  '/send-parcel-nepal-to-japan': {
    title: 'Send Parcel from Hetauda Nepal to Japan | The BC Cargo',
    description: 'Send parcel and courier from Hetauda and Nepal to Japan. Fast 3–5 business day delivery to Tokyo and all prefectures. Live sheet pricing and customs clearance.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`
  },

  '/send-parcel-nepal-to-europe': {
    title: 'Cargo & Parcel Service from Hetauda Nepal to Europe | BC Cargo',
    description: 'Send personal and commercial cargo from Hetauda to Europe (EU). Fast customs-cleared air freight to Frankfurt, Paris, Rome, Madrid, and across the EU.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`
  },

  '/send-parcel-nepal-to-gulf': {
    title: 'Send Courier from Hetauda Nepal to Dubai UAE & Gulf | BC Cargo',
    description: 'Fast courier service from Hetauda to Dubai, UAE, Qatar, and Gulf region. Low per-kg tariffs, 2–4 business days delivery, and complete tracking.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`
  },

  '/send-parcel-nepal-to-hong-kong': {
    title: 'Air Cargo from Hetauda Nepal to Hong Kong | The BC Cargo',
    description: 'Send courier and air freight from Hetauda Nepal to Hong Kong. Direct flights, special meat compliance rate, fast 2–4 day delivery, and online tracking.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`
  },

  '/send-parcel-nepal-to-usa': {
    title: 'Send Parcel from Hetauda Nepal to USA | The BC Cargo',
    description: 'Send parcel and commercial air cargo from Hetauda Nepal to the United States. 4–6 day delivery nationwide with tracking, customs assistance, and live sheet rates.',
    ogType: 'service',
    ogImage: `${BASE_URL}/og-banner.png`
  }
};

const esc = (v) => String(v).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const NAV_LINKS = [
  ['/', 'Home'], ['/rates', 'Rates'], ['/services', 'Services'], ['/track', 'Track a shipment'], ['/book', 'Book'],
  ['/how-to-ship', 'How to ship'], ['/faq', 'FAQ'], ['/about', 'About'], ['/contact', 'Contact'], ['/policies', 'Policies']
];

/** Plain, truthful fallback shown before JavaScript loads and read by crawlers: heading, summary, links. */
function fallbackBody(routePath, meta) {
  const heading = esc(meta.title.split(' | ')[0].split(' — ')[0]);
  const links = NAV_LINKS.filter(([href]) => href !== routePath).map(([href, label]) => `<a href="${href}">${label}</a>`).join(' ');
  return `<main style="max-width:720px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#121211"><h1>${heading}</h1><p>${esc(meta.description)}</p><nav aria-label="Main">${links}</nav></main>`;
}

export function prerender() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`[PRERENDER] dist/index.html not found! Please run 'vite build' first.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8').replace(/\s*<meta name="description"[^>]*>/i, '');
  let renderedCount = 0;

  for (const [routePath, routeMeta] of Object.entries(ROUTE_METADATA)) {
    let meta = routeMeta;
    const canonical = `${BASE_URL}${routePath === '/' ? '/' : routePath}`;
    
    // Format JSON-LD scripts
    let jsonLdTags = '';
    if (meta.jsonLd) {
      const schemas = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
      jsonLdTags = schemas.map((s, idx) => 
        `<script type="application/ld+json" id="prerender-jsonld-${idx}">${JSON.stringify(s)}</script>`
      ).join('\n    ');
    }

    // Build replacement head metadata
    const metaTags = [
      `<title>${esc(meta.title)}</title>`,
      `<meta name="description" content="${esc(meta.description)}" />`,
      `<link rel="canonical" href="${canonical}" />`,
      `<meta property="og:title" content="${esc(meta.title)}" />`,
      `<meta property="og:description" content="${esc(meta.description)}" />`,
      `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
      `<meta property="og:url" content="${canonical}" />`,
      `<meta property="og:image" content="${meta.ogImage || `${BASE_URL}/og-banner.png`}" />`,
      `<meta property="og:site_name" content="The BC Cargo &amp; Courier" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(meta.title)}" />`,
      `<meta name="twitter:description" content="${esc(meta.description)}" />`,
      `<meta name="twitter:image" content="${meta.ogImage || `${BASE_URL}/og-banner.png`}" />`,
      jsonLdTags
    ].filter(Boolean).join('\n    ');

    // Replace <title> and inject tags inside <head>
    let prerenderedHtml = baseHtml;
    // Remove existing <title> tag
    prerenderedHtml = prerenderedHtml.replace(/<title>.*?<\/title>/i, '');
    // Home only: the dotted world map is the largest above-the-fold element on phones, so fetch it early.
    let extraHead = '';
    if (routePath === '/') {
      const assets = fs.readdirSync(path.join(DIST_DIR, 'assets'));
      const map = assets.find((f) => /^world-dots-1280-.*.png$/.test(f));
      if (map) {
        extraHead = `
    <link rel="preload" as="image" href="/assets/${map}" crossorigin="anonymous" fetchpriority="high" />`;
      }
    }
    // Inject custom head meta
    prerenderedHtml = prerenderedHtml.replace('</head>', `    ${metaTags}${extraHead}\n  </head>`);

    // Inject semantic body content if provided for JavaScript-disabled fallback & crawler indexability
    if (!meta.bodyHtml) meta = { ...meta, bodyHtml: fallbackBody(routePath, meta) };
    if (meta.bodyHtml) {
      prerenderedHtml = prerenderedHtml.replace('<div id="root"></div>', `<div id="root">${meta.bodyHtml}</div>`);
    }

    // Target directory: dist/<route>/index.html
    const targetDir = routePath === '/' 
      ? DIST_DIR 
      : path.join(DIST_DIR, routePath.replace(/^\//, ''));
    
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), prerenderedHtml, 'utf8');
    renderedCount++;
  }

  console.log(`[PRERENDER] Successfully generated ${renderedCount} static HTML pages in dist/!`);
}

prerender();
