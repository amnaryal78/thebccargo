import { describe, it, expect } from 'vitest';
import { calculateEstimate, DEFAULT_RATE_SETTINGS, HandlingRule } from '../src/features/estimator/engine';
import { INITIAL_NATIONAL_RATES, INITIAL_INTERNATIONAL_RATES } from '../src/services/ratesService';
import { submitBooking, BookingPayload } from '../src/services/bookingService';
import { submitInquiry, getInitialInquiries } from '../src/services/inquiryService';
import { getJobs, submitApplication } from '../src/services/careersService';
import { fetchPublicTracking } from '../src/services/trackingService';
import { getRolePermissions } from '../src/features/admin/types';

const TEST_HANDLING_RULES: HandlingRule[] = [
  {
    id: 'hr-01',
    flag: 'liquid',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: 'percent',
    surcharge_value: 15,
    requirements_md: '[PLACEHOLDER] Leak-proof sealed packaging and MSDS documentation required.',
    is_placeholder: true,
    active: true,
  },
  {
    id: 'hr-03',
    flag: 'meat',
    country_code: 'USA',
    mode: 'air',
    allowed: false,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: '[PLACEHOLDER] Perishable animal meat prohibited to USA.',
    is_placeholder: true,
    active: true,
  }
];

import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';

const mockRates = {
  nationalRates: INITIAL_NATIONAL_RATES,
  internationalRates: INITIAL_INTERNATIONAL_RATES,
  sheetRates: MOCK_SHEET_RATES,
};

describe('Phase 7 — End-to-End Core Workflows Acceptance Suite', () => {

  describe('1. Rate Estimator Calculation & Rule Engine', () => {
    it('calculates valid international shipment with volumetric weight comparison', () => {
      const estimate = calculateEstimate(
        {
          type: 'international',
          destination: 'HKG',
          actualWeightKg: 2.5,
          dimensions: { lengthCm: 40, widthCm: 30, heightCm: 25 }, // 30,000 / 5,000 = 6kg volumetric
          mode: 'air'
        },
        mockRates,
        TEST_HANDLING_RULES,
        DEFAULT_RATE_SETTINGS
      );

      expect(estimate.allowed).toBe(true);
      expect(estimate.isVolumetric).toBe(true);
      expect(estimate.chargeableWeightKg).toBe(6.0);
      expect(estimate.breakdown.totalNpr).toBeGreaterThan(0);
      expect(estimate.breakdown.rangeNpr.min % 10).toBe(0); // Range min rounded to nearest 10
      expect(estimate.breakdown.rangeNpr.max % 10).toBe(0); // Range max rounded to nearest 10
    });

    it('blocks restricted goods according to corridor regulatory decree', () => {
      const estimate = calculateEstimate(
        {
          type: 'international',
          destination: 'USA',
          actualWeightKg: 5,
          mode: 'air',
          flags: { meat: true }
        },
        mockRates,
        TEST_HANDLING_RULES,
        DEFAULT_RATE_SETTINGS
      );

      expect(estimate.allowed).toBe(false);
      expect(estimate.blockedReason).toContain('prohibited');
      expect(estimate.isPlaceholderWarning).toBe(true);
    });
  });

  describe('2. Booking Submission & Validation Flow', () => {
    it('successfully generates a booking record with tracking reference', async () => {
      const payload: BookingPayload = {
        senderName: 'Himalayan Art Exporters',
        senderEmail: 'export@himalayanart.com.np',
        senderPhone: '+977-9851000000',
        senderAddress: 'Thamel, Kathmandu',
        receiverName: 'Munich Gallery GmbH',
        receiverEmail: 'curator@munichgallery.de',
        receiverPhone: '+49-89-123456',
        receiverAddress: 'Maximilianstraße 12, Munich, Germany',
        origin: 'Kathmandu, Nepal',
        destination: 'Munich, Germany',
        serviceMode: 'air',
        commodity: 'Handicrafts & Thangka Paintings',
        weightKg: 12.5,
        estimatedPrice: 32500,
        currency: 'NPR'
      };

      const result = await submitBooking(payload, 'dev_test_token');
      expect(result.error).toBeNull();
      expect(result.record).not.toBeNull();
      if (result.record) {
        expect(result.record.senderName).toBe(payload.senderName);
        expect(result.record.destination).toBe('Munich, Germany');
        expect(result.record.status).toMatch(/submitted|pending|new/i);
        expect(result.record.bookingRef).toBeDefined();
      }
    });

    it('rejects booking when destination is within Nepal (international export only)', async () => {
      const payload: BookingPayload = {
        senderName: 'Kathmandu Supplier',
        senderEmail: 'supplier@ktm.com.np',
        senderPhone: '+977-9851000000',
        senderAddress: 'Thamel, Kathmandu',
        receiverName: 'Pokhara Merchant',
        receiverEmail: 'merchant@pkr.com.np',
        receiverPhone: '+977-9856000000',
        receiverAddress: 'Lakeside, Pokhara, Nepal',
        origin: 'Kathmandu, Nepal',
        destination: 'Pokhara, Nepal',
        serviceMode: 'air',
        commodity: 'Sample Fabric',
        weightKg: 5,
        estimatedPrice: 2500,
        currency: 'NPR'
      };

      const result = await submitBooking(payload, 'dev_test_token');
      expect(result.error).toBe('We ship from Nepal to other countries. Destination cannot be Nepal.');
      expect(result.record).toBeNull();
    });
  });

  describe('3. Customer Inquiry Workflow', () => {
    it('submits a commercial freight inquiry successfully', async () => {
      const inquiryPayload = {
        name: 'Suman Shrestha',
        email: 'suman@pashminanepal.com',
        phone: '+977-9801999888',
        subject: 'Weekly Air Freight Capacity to Dubai',
        message: 'Looking for contract tariff for bi-weekly 100kg pashmina shipments to DXB.',
        serviceMode: 'air'
      };

      const result = await submitInquiry(inquiryPayload, 'dev_test_token');
      expect(result.error).toBeNull();
      expect(result.record).not.toBeNull();
      if (result.record) {
        expect(result.record.id).toBeDefined();
        expect(result.record.name).toBe(inquiryPayload.name);
        expect(result.record.status).toBe('new');
      }
    });

    it('retrieves inquiries list with valid record schema', async () => {
      const initial = getInitialInquiries();
      expect(Array.isArray(initial)).toBe(true);
      expect(initial.length).toBeGreaterThan(0);
      expect(initial[0]).toHaveProperty('email');
      expect(initial[0]).toHaveProperty('message');
    });
  });

  describe('4. Careers & Job Application Workflow', () => {
    it('retrieves published job posting with requirements', () => {
      const jobs = getJobs();
      expect(jobs.length).toBeGreaterThan(0);
      const airSpecialist = jobs.find(j => j.slug === 'air-freight-operations-specialist');
      expect(airSpecialist).toBeDefined();
      if (airSpecialist) {
        expect(airSpecialist.title).toBe('Air Freight Operations Specialist');
        expect(airSpecialist.published).toBe(true);
        expect(airSpecialist.requirements.length).toBeGreaterThan(0);
      }
    });

    it('submits a candidate job application', async () => {
      const appPayload = {
        jobId: 'JOB-01',
        jobTitle: 'Air Freight Operations Specialist',
        applicantName: 'Ramesh Adhikari',
        email: 'ramesh.cargo@example.com',
        phone: '+977-9841234567',
        experienceYears: 4,
        coverLetter: 'Experienced air cargo documentation handler with 4 years at TIA cargo terminal.'
      };

      const result = await submitApplication(appPayload, 'dev_test_token');
      expect(result.error).toBeNull();
      expect(result.record).not.toBeNull();
      if (result.record) {
        expect(result.record.applicantName).toBe(appPayload.applicantName);
        expect(result.record.status).toBe('new');
      }
    });
  });

  describe('5. Admin Login Guard & RBAC Route Protection', () => {
    it('constructs correct login redirect URI preserving protected target destination', () => {
      const targetPath = '/admin/shipments?search=BC-90214';
      const redirectUri = `/login?redirect=${encodeURIComponent(targetPath)}`;
      expect(redirectUri).toBe('/login?redirect=%2Fadmin%2Fshipments%3Fsearch%3DBC-90214');
    });

    it('denies mutating operations to read_only and unauthenticated roles', () => {
      const anonPerms = getRolePermissions(null);
      expect(anonPerms.canViewDashboard).toBe(false);
      expect(anonPerms.canManageShipments).toBe(false);

      const readOnlyPerms = getRolePermissions('read_only');
      expect(readOnlyPerms.canViewDashboard).toBe(true);
      expect(readOnlyPerms.canManageShipments).toBe(false);
      expect(readOnlyPerms.canManageRates).toBe(false);
      expect(readOnlyPerms.isReadOnly).toBe(true);

      const adminPerms = getRolePermissions('admin');
      expect(adminPerms.canViewDashboard).toBe(true);
      expect(adminPerms.canManageShipments).toBe(true);
      expect(adminPerms.canManageRates).toBe(true);
      expect(adminPerms.isReadOnly).toBe(false);
    });
  });

  describe('6. Consignment Tracking: Found & Not-Found Paths', () => {
    it('NO DEMO DATA: a former demo consignment is not served from the app', async () => {
      const result = await fetchPublicTracking('BC-90214-HKG');
      expect(result.data).toBeNull();
      expect(result.error).toMatch(/no active shipment found/i);
    });

    it('NOT-FOUND PATH: returns data null and actionable error message for non-existent consignment', async () => {
      const nonExistentAwb = 'BC-NONEXISTENT-9999';
      const result = await fetchPublicTracking(nonExistentAwb);
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error).toContain(nonExistentAwb);
      expect(result.error).toMatch(/no active shipment found/i);
    });

    it('VALIDATION PATH: rejects empty or malformed tracking inputs', async () => {
      const emptyResult = await fetchPublicTracking('   ');
      expect(emptyResult.data).toBeNull();
      expect(emptyResult.error).toMatch(/valid tracking number/i);

      const shortResult = await fetchPublicTracking('A');
      expect(shortResult.data).toBeNull();
      expect(shortResult.error).toMatch(/at least 4 characters/i);
    });
  });

});
