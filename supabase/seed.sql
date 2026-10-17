-- BC Cargo & Courier — Production Seed Data

-- 1. Seed Shipments
INSERT INTO shipments (
    tracking_number, booking_ref, mode, service_name, status, commodity,
    shipper_company, shipper_city, shipper_country,
    consignee_company, consignee_city, consignee_country,
    origin, origin_hub, destination, destination_gateway, carrier_info,
    gross_weight_kg, chargeable_weight_kg, volume_cbm, pieces, incoterm, estimated_delivery,
    telemetry_temp, telemetry_eseal, battery_level
) VALUES 
(
    'BC-90214-HKG', 'BK-2026-90214', 'air', 'Air Freight Express (Priority Charters)', 'In Transit', 'Specialized Garments & Precision Optics',
    'Himalayan Textiles Corp.', 'Hetauda', 'Nepal',
    'Schneider Optik & Textil GmbH', 'Frankfurt am Main', 'Germany',
    'Hetauda, Nepal', 'Hetauda Global HQ Hub', 'Frankfurt (FRA), Germany', 'FRA (Lufthansa Cargo Hub 1)', 'Flight BC-702 / Connecting LH-739',
    2450, 2800, 8.40, 8, 'CIF - Cost, Insurance, Freight', 'Oct 26, 2026 • 14:30 CET',
    '+18.4°C (Optimal)', 'E-Seal #NP-88319 Verified', '94%'
),
(
    'BC-88192-DXB', 'BK-2026-88192', 'express', 'Express Courier Door-to-Airport', 'In Transit', 'Handmade Pashmina Shawls & Organic Tea',
    'Lumbini Handicrafts & Weavers', 'Kathmandu', 'Nepal',
    'Gulf Luxury Imports LLC', 'Dubai', 'United Arab Emirates',
    'Kathmandu, Nepal', 'Kathmandu Air Cargo Complex (TIA)', 'Dubai (DXB), UAE', 'DXB Cargo Terminal 2', 'FlyDubai Cargo FZ-576',
    185, 210, 1.25, 4, 'DAP - Delivered at Place', 'Oct 25, 2026 • 21:00 GST',
    '+21.0°C (Normal)', 'E-Seal #NP-55412 Active', '98%'
),
(
    'NP-4421-DEL', 'BK-2026-4421', 'overland', 'Cross-Border Overland Linehaul', 'In Transit', 'Precision Industrial Bearings & Valve Spares',
    'Narayani Heavy Machinery Spares', 'Hetauda', 'Nepal',
    'NCR Industrial Engineering Ltd.', 'Faridabad (Delhi NCR)', 'India',
    'Hetauda, Nepal', 'Hetauda Global HQ Hub', 'Delhi NCR, India', 'Tughlakabad Dry Port / ICD Patparganj', 'BC Cargo Fleet Truck #BA-2-KHA-8840',
    14200, 14200, 38.0, 22, 'FOB - Free on Board', 'Oct 26, 2026 • 09:00 IST',
    '+24.5°C Ambient', 'Smart GPS E-Lock #BC-TRK-771', '89%'
)
ON CONFLICT (tracking_number) DO NOTHING;

-- 2. Seed Shipment Milestones
INSERT INTO shipment_milestones (shipment_id, title, description, location, timestamp, status, completed, sort_order)
SELECT id, 'Shipment Accepted & Calibrated', 'Dimensions checked, tamper-proof barcode security seals applied.', 'The BC Cargo Regional Depot, Kantirajpath, Hetauda-4, Nepal', 'Oct 24, 08:30 NPT', 'completed', true, 1 FROM shipments WHERE tracking_number = 'BC-90214-HKG'
UNION ALL
SELECT id, 'Customs Export Clearance & Bonded Transit to TIA', 'ASYCUDA World Export Pragyapan Patra #EX-88902 registered.', 'Birgunj Customs / Kathmandu Expressway Corridor', 'Oct 24, 15:45 NPT', 'completed', true, 2 FROM shipments WHERE tracking_number = 'BC-90214-HKG'
UNION ALL
SELECT id, 'Air Manifest Loaded & Departed from Kathmandu (KTM)', 'Aircraft departure confirmed on schedule.', 'Runway Gate 4, Tribhuvan International Airport (TIA) Cargo Precinct', 'Oct 25, 02:10 NPT', 'completed', true, 3 FROM shipments WHERE tracking_number = 'BC-90214-HKG'
UNION ALL
SELECT id, 'In-Transit Inspection & Consolidation (HKG Hub)', 'Active connecting transfer to Flight LH-739 bound for Frankfurt.', 'Hong Kong International Airport Cargo Complex', 'Oct 25, 11:20 HKT', 'current', true, 4 FROM shipments WHERE tracking_number = 'BC-90214-HKG'
UNION ALL
SELECT id, 'Doorstep Courier Collection', 'Handover complete, weighing and dimension laser verified.', 'Thamel, Kathmandu Depot', 'Oct 24, 11:00 NPT', 'completed', true, 1 FROM shipments WHERE tracking_number = 'BC-88192-DXB'
UNION ALL
SELECT id, 'Customs Pre-Clearance at TIA', 'Export duty drawback and origin certification validated.', 'Kathmandu Air Cargo Terminal', 'Oct 24, 18:30 NPT', 'completed', true, 2 FROM shipments WHERE tracking_number = 'BC-88192-DXB'
UNION ALL
SELECT id, 'Flight Uplift & Trans-Arabian Transit', 'ETA Dubai within 45 minutes.', 'Airborne KTM-DXB Corridor', 'Oct 25, 14:15 NPT', 'current', true, 3 FROM shipments WHERE tracking_number = 'BC-88192-DXB';

-- 3. Seed National Rates
INSERT INTO national_rates (service_name, origin_region, destination_region, min_weight_kg, max_weight_kg, base_rate_npr, per_kg_rate_npr, effective_date) VALUES
('Express Parcel', 'Kathmandu Valley', 'Pokhara / Gandaki', 0, 1, 250, 60, '2026-01-01'),
('Express Parcel', 'Kathmandu Valley', 'Biratnagar / Koshi', 0, 1, 280, 70, '2026-01-01'),
('Express Parcel', 'Kathmandu Valley', 'Nepalgunj / Banke', 0, 1, 320, 80, '2026-01-01'),
('Overland Freight', 'Hetauda Central HQ', 'Birgunj ICD / Parsa', 0, 100, 1500, 12, '2026-01-01'),
('Overland Freight', 'Hetauda Central HQ', 'Chitwan / Narayangarh', 0, 100, 1200, 10, '2026-01-01'),
('Express Parcel', 'Kathmandu Valley', 'Butwal / Lumbini', 0, 1, 290, 65, '2026-01-01'),
('Overland Freight', 'Hetauda Central HQ', 'Kathmandu Valley Hub', 0, 100, 1800, 14, '2026-01-01');

-- 4. Seed International Rates
INSERT INTO international_rates (country_code, country_name, service_name, min_weight_kg, max_weight_kg, rate_usd, effective_date) VALUES
('HKG', 'Hong Kong SAR', 'Air Freight Express', 0.5, 5, 45.0, '2026-01-01'),
('HKG', 'Hong Kong SAR', 'Air Freight Express', 5.1, 20, 120.0, '2026-01-01'),
('UAE', 'United Arab Emirates (Dubai)', 'Air Express Courier', 0.5, 5, 38.0, '2026-01-01'),
('USA', 'United States', 'Priority Air Cargo', 0.5, 5, 65.0, '2026-01-01'),
('GBR', 'United Kingdom (London)', 'Priority Air Cargo', 0.5, 5, 58.0, '2026-01-01'),
('IND', 'India (New Delhi / Mumbai)', 'Cross-Border Overland', 1, 50, 25.0, '2026-01-01'),
('AUS', 'Australia (Sydney)', 'Air Express Courier', 0.5, 5, 72.0, '2026-01-01'),
('DEU', 'Germany (Frankfurt)', 'Priority Air Cargo', 0.5, 5, 62.0, '2026-01-01'),
('JPN', 'Japan (Tokyo)', 'Air Freight Express', 0.5, 5, 54.0, '2026-01-01'),
('CAN', 'Canada (Toronto)', 'Priority Air Cargo', 0.5, 5, 68.0, '2026-01-01'),
('QAT', 'Qatar (Doha)', 'Air Express Courier', 0.5, 5, 40.0, '2026-01-01');

-- 5. Seed Blogs
INSERT INTO blogs (title, slug, category, read_time, published, author_name, excerpt, content, cover_image_url) VALUES
(
    'How to Track Your Package Step by Step',
    'how-to-track-your-package-step-by-step',
    'Shipping Tips',
    '3 min read',
    true,
    'The BC Cargo Support Team',
    'Learn how to check your package status, expected delivery date, and milestone history in real time.',
    'Tracking your package with The BC Cargo is quick and simple. Every shipment is assigned a unique tracking code (such as BC-90214-HKG). Type your code into our website search bar to see where your box is right now.',
    'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80'
),
(
    'Understanding Box Size and Scale Weight',
    'understanding-box-size-and-scale-weight',
    'Prices & Billing',
    '4 min read',
    true,
    'Suresh Adhikari',
    'Find out how package dimensions affect your final delivery price and how to pack efficiently.',
    'When sending packages, pricing depends on both physical scale weight and package size. Lightweight boxes that take up large space are calculated using box size weight.',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'
),
(
    'Customs Clearance Made Easy for Exporters',
    'customs-clearance-made-easy-nepal-export',
    'Worldwide & Customs',
    '5 min read',
    true,
    'Licensed Customs Desk #B-409',
    'A simple guide to export documentation, customs clearance, and paperwork for goods leaving Nepal.',
    'Every item leaving Nepal passes through official customs. Our licensed customs brokers (License #B-409) handle all electronic paperwork (ASYCUDA / Pragyapan Patra) directly with Nepal Customs for you.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Seed FAQs
INSERT INTO faqs (question, answer, category, sort_order, published) VALUES
('How do I track my package?', 'When you send a package with The BC Cargo, you get a tracking number (like BC-90214-HKG). Type your number into the search bar at the top of our website or on the Track Package page to see where your box is right now, step by step.', 'General Questions', 1, true),
('What documents do I need to send items outside Nepal?', 'To send personal gifts or items abroad, you only need your ID, a list of what is inside the box, and the receiver’s address. For businesses sending goods for sale, our licensed customs brokers (License #B-409) will help you prepare and file all required paperwork quickly.', 'Worldwide & Customs', 2, true),
('How is box size and weight calculated?', 'We check two things: how heavy the box is on the scale, and how much space it takes up. If a box is very light but very big (like pillows), pricing is based on its size. If it is small and heavy, pricing is based on scale weight. Our online calculator does this automatically for you.', 'Prices & Billing', 3, true),
('Can you pick up my package from my home or office?', 'Yes! We pick up packages across Nepal, including Hetauda, Kathmandu, Birgunj, Pokhara, Chitwan, Butwal, Biratnagar, and many other cities. Just give us your address when booking or call our nearest office.', 'Delivery Across Nepal', 4, true),
('How long does delivery take to other countries?', 'Fast air delivery to Europe, North America, the Middle East, and Asia usually takes 2 to 5 business days. Larger sea shipments take about 18 to 28 days. You can track your package every step of the way.', 'Worldwide & Customs', 5, true);

-- 7. Seed Reviews
INSERT INTO reviews (customer_name, role, company, rating, mode, comment, verified, approved) VALUES
('Ramesh Adhikari', 'Export Manager', 'Himalayan Handicrafts Ltd.', 5, 'Air Delivery', 'The BC Cargo delivered our urgent package from Kathmandu to Frankfurt in under 48 hours. Easy customs clearance and clear live tracking throughout.', true, true),
('Priya Sharma', 'Supply Chain Director', 'Nepal Agro Industries', 5, 'Sea Delivery', 'Dependable delivery from Birgunj to Kolkata port. Digital tracking gave us full peace of mind for our large shipment.', true, true),
('David Miller', 'Logistics Procurement', 'Global Trade Syndicate (UAE)', 5, 'Fast Courier', 'Very polite staff and fast delivery from Hetauda to Delhi. A trusted and reliable delivery partner in Nepal.', true, true);

-- 8. Seed Services
INSERT INTO services (title, slug, category, description, features, icon_name, display_order, published) VALUES
('Fast International Air Delivery', 'fast-international-air-delivery', 'Worldwide', 'Daily flight connections from Kathmandu (TIA) to over 50 countries.', ARRAY['Daily Flights Worldwide', 'Doorstep Pickup Across Nepal', 'Customs Paperwork Included'], 'Plane', 1, true),
('International Sea Delivery', 'international-sea-delivery', 'Worldwide', 'Best for large, heavy, and bulk container shipments via Kolkata port.', ARRAY['Full Container (FCL) & Groupage (LCL)', 'Direct Rail Corridor Birgunj-Kolkata', 'Cost-Effective Heavy Cargo'], 'Ship', 2, true),
('Cross-Border Road Delivery', 'cross-border-road-delivery', 'Inside Nepal', 'Daily truck network connecting Nepal, India, and China border posts.', ARRAY['Nepal-India ICP Raxaul/Birgunj', 'China Border Tatopani & Rasuwagadhi', 'GPS Tracked Fleet Trucks'], 'Truck', 3, true),
('Customs & Clearance Support', 'customs-and-clearance-support', 'Worldwide', 'Government-licensed customs brokerage (#B-409) for stress-free export/import clearance.', ARRAY['Licensed Customs Broker #B-409', 'ASYCUDA World Pre-Filing', 'Commercial Duty Guidance'], 'FileCheck', 4, true);

-- 9. Seed Careers
INSERT INTO careers (title, slug, department, location, type, description, requirements, responsibilities, published) VALUES
('Air Cargo & Customer Dispatch Specialist', 'air-cargo-customer-dispatch-specialist', 'Operations', 'Kathmandu Airport (TIA) / Hetauda HQ', 'Full-Time', 'Join our core dispatch team coordinating air package bookings, customer support, and flight manifest processing.', ARRAY['2+ years experience in customer service or courier operations', 'Good communication skills in Nepali and English', 'Proficient with computer software and tracking systems'], ARRAY['Process customer bookings and package check-ins', 'Coordinate with drivers and airport handling staff', 'Provide live tracking support to customers'], true),
('Customs Clearance Documentation Officer', 'customs-clearance-documentation-officer', 'Customs Desk', 'Birgunj Dry Port / Hetauda HQ', 'Full-Time', 'Assist our licensed customs team (#B-409) in preparing and filing electronic export paperwork.', ARRAY['Knowledge of Nepal Customs ASYCUDA procedures', 'Attention to detail for invoice and packing list verification', 'Strong organizational skills'], ARRAY['Review export invoice & packing list details', 'Assist customs brokers with electronic filing', 'Coordinate border checkpost documentation'], true);

-- 10. Seed Policies
INSERT INTO policies (slug, title, short_title, summary, content, version, last_updated, published) VALUES
('terms-of-carriage', 'Terms & Conditions of Delivery', 'Terms of Carriage', 'Standard rules governing all package deliveries handled by The BC Cargo & Courier.', 'By sending a package with The BC Cargo & Courier, the sender agrees to our standard delivery conditions. All items must be packed securely, and sender declarations must be accurate. Packages are inspected for safety in compliance with Civil Aviation Authority of Nepal (CAAN) rules.', '2026-v1', 'January 2026', true),
('privacy-policy', 'Privacy & Data Protection Policy', 'Privacy Policy', 'How The BC Cargo collects, uses, and protects customer information and tracking data.', 'The BC Cargo respects your privacy. We process sender and receiver contact information solely for delivery and customs purposes. Public tracking searches display status updates without exposing personal phone numbers or private addresses.', '2026-v1', 'January 2026', true),
('cargo-liability', 'Delivery Protection & Liability Policy', 'Liability & Insurance', 'Coverage limits and options for package protection during transit.', 'All shipments handled by The BC Cargo are protected under standard courier guidelines. For high-value or delicate shipments, additional full-value protection coverage can be arranged upon request.', '2026-v1', 'January 2026', true);

-- 11. Seed Site Settings
INSERT INTO site_settings (key, value) VALUES
('company_info', '{"name": "The BC Cargo & Courier Pvt. Ltd.", "license": "Customs Broker License #B-409", "email": "thebcargo@gmail.com", "phone": "+977-057-520000", "headquarters": "Central HQ: Kantirajpath, Hetauda-4, Makwanpur, Nepal"}'::jsonb),
('office_locations', '[{"id": "hetauda", "name": "Hetauda Central HQ", "city": "Hetauda", "address": "Kantirajpath, Ward 4, Makwanpur", "phone": "+977-057-520000", "email": "thebcargo@gmail.com"}, {"id": "kathmandu", "name": "Kathmandu Airport Hub", "city": "Kathmandu", "address": "Tribhuvan International Airport (TIA) Cargo Complex", "phone": "+977-01-4429910", "email": "thebcargo@gmail.com"}, {"id": "birgunj", "name": "Birgunj Dry Port Office", "city": "Birgunj", "address": "ICP Sirsiya / Dry Port Gate", "phone": "+977-051-524100", "email": "thebcargo@gmail.com"}]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
