/**
 * Title + description for every static public page. The page components render these through <Seo>,
 * and scripts/prerender.mjs writes the same text into the static HTML, so Googlebot sees identical
 * metadata before and after JavaScript runs. Titles stay at 60 characters or fewer (enforced by tests).
 * Do not state prices, transit times, licence numbers, years or counts here unless the owner confirmed them.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'International Courier & Cargo from Nepal | BC Cargo',
    description: 'International courier and cargo from Hetauda, Nepal. Send parcels, documents and commercial cargo worldwide with live per-kg rates and online tracking.'
  },
  '/rates': {
    title: 'Shipping Rates from Nepal: Per-kg Estimator | BC Cargo',
    description: 'Estimate the cost of sending a parcel or cargo from Nepal. Choose a country and weight to see per-kg rates and a printable estimate.'
  },
  '/services': {
    title: 'Courier & Cargo Services from Nepal | BC Cargo',
    description: 'International courier, air cargo, overland and sea freight, and customs documentation support from Hetauda, Nepal. See what each service covers.'
  },
  '/about': {
    title: 'About The BC Cargo & Courier | Hetauda, Nepal',
    description: 'The BC Cargo & Courier Pvt. Ltd. is an international courier and cargo company based in Hetauda, Nepal. See who we are and how to reach us.'
  },
  '/contact': {
    title: 'Contact BC Cargo | Hetauda, Nepal',
    description: 'Visit School Road -4, Hetauda or call 057-591816 / 9855019485. Open Sunday to Friday, 9 am to 6 pm. Email thebccargo@gmail.com.'
  },
  '/track': {
    title: 'Track Your Shipment | The BC Cargo & Courier',
    description: 'Enter your consignment number to see where your parcel is and its latest status updates.'
  },
  '/book': {
    title: 'Book a Shipment or Pickup | The BC Cargo & Courier',
    description: 'Request a booking with BC Cargo. Tell us what you are sending and where, and our team will get back to you to confirm.'
  },
  '/careers': {
    title: 'Careers at The BC Cargo & Courier | Nepal',
    description: 'See current job openings at The BC Cargo & Courier in Nepal and how to apply.'
  },
  '/blogs': {
    title: 'Country Shipping Guides | The BC Cargo & Courier',
    description: 'Country-by-country guides for sending parcels from Nepal: what you can send, what is not allowed, and what the receiver needs.'
  },
  '/faq': {
    title: 'FAQ: Shipping from Nepal | The BC Cargo & Courier',
    description: 'Answers to common questions about sending parcels from Nepal: customs documents, volumetric weight, pricing, pickup and tracking.'
  },
  '/policies': {
    title: 'Terms & Conditions of Carriage | BC Cargo',
    description: 'Read the terms for shipping with The BC Cargo & Courier, including what we carry, liability, claims and prohibited items.'
  },
  '/how-to-ship': {
    title: 'How to Ship: What You Can Send | BC Cargo',
    description: 'A simple English and Nepali guide to sending a parcel from Nepal: what you can send, prohibited items, customs documents and packing.'
  },
  '/send-parcel-nepal-to-europe': {
    title: 'Send Cargo from Nepal to Europe | BC Cargo',
    description: 'Send parcels and cargo from Hetauda, Nepal to European countries. Live per-kg rates, customs help and tracking. See our country guides.'
  },
  '/send-parcel-nepal-to-gulf': {
    title: 'Send Courier from Nepal to the Gulf | BC Cargo',
    description: 'Send parcels from Hetauda, Nepal to UAE, Qatar, Saudi Arabia, Kuwait and Bahrain. Live per-kg rates and tracking. See our country guides.'
  }
};
