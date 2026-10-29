import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EstimateBillModal } from '../src/features/estimator/EstimateBillModal';
import { calculateSheetShipmentQuote } from '../src/features/estimator/engine';
import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';
import { numberToWords } from '../src/utils/numberToWords';

describe('Phase 3 — Bill Parity & Mathematical Strictness', () => {
  it('correctly converts numbers to words for South Asian / Nepali currency format', () => {
    expect(numberToWords(0)).toBe('Zero');
    expect(numberToWords(1000)).toBe('One Thousand');
    expect(numberToWords(35600)).toBe('Thirty Five Thousand Six Hundred');
    expect(numberToWords(125000)).toBe('One Lakh Twenty Five Thousand');
    expect(numberToWords(1020)).toBe('One Thousand Twenty');
  });

  it('guarantees that Total strictly equals the sum of visible line items for multi-box shipment', () => {
    const quote = calculateSheetShipmentQuote(
      {
        destination: 'United Kingdom',
        actualWeightKg: 30, // 2 boxes: [20kg, 10kg]
        hasLiquid: true,
        hasMeat: true,
        meatKg: 3,
        hasMedicine: true,
      },
      MOCK_SHEET_RATES
    );

    expect(quote.allowed).toBe(true);
    // Math assertion:
    const calculatedSum =
      quote.baseShippingCharge +
      quote.boxCharge +
      quote.liquidCharge +
      quote.meatCharge +
      quote.medicineCharge;

    expect(quote.totalNpr).toBe(calculatedSum);
    expect(quote.totalNpr).toBe(28800); // 23,500 + 2,200 + 700 (1 btl) + 2,400 (3 kg meat) + 0 (medicine is quoted by us)
  });

  it('renders bill with all required Phase 3 fields and Hetauda office address', () => {
    const quote = calculateSheetShipmentQuote(
      {
        destination: 'United Kingdom',
        actualWeightKg: 30,
        hasLiquid: true,
        hasMeat: true,
        meatKg: 3,
        hasMedicine: false,
      },
      MOCK_SHEET_RATES
    );

    const html = renderToStaticMarkup(
      React.createElement(EstimateBillModal, {
        quote,
        onClose: () => {},
      })
    );

    // Required fields:
    expect(html).toContain('id="printable-bill"');
    expect(html).toContain('The BC <span class="text-[#F5B301]">Cargo</span> &amp; Courier');
    expect(html).toContain('School Road -4, Hetauda, Nepal');
    expect(html).toContain('Phone: 057-591816 / 9855019485');
    expect(html).toContain('thebccargo@gmail.com');
    expect(html).toContain('United Kingdom');
    expect(html).toContain('30.00');
    expect(html).toContain('Base Shipping Charge');
    expect(html).toContain('Custom box charge');
    expect(html).toContain('Liquid Handling Surcharge');
    expect(html).toContain('Meat Compliance Surcharge');
    expect(html).toContain('TOTAL');
    expect(html).toContain('Grand Total');
    expect(html).toContain('Important Notice:');
    expect(html).toContain('Final bill is made after physical check at our office');
    expect(html).toContain('Authorized Signature');
  });

  it('renders Medicine row ONLY when medicine is selected, and hides it when not selected', () => {
    // 1. Without medicine
    const quoteWithoutMed = calculateSheetShipmentQuote(
      {
        destination: 'United Kingdom',
        actualWeightKg: 15,
        hasMedicine: false,
      },
      MOCK_SHEET_RATES
    );

    const htmlWithoutMed = renderToStaticMarkup(
      React.createElement(EstimateBillModal, {
        quote: quoteWithoutMed,
        onClose: () => {},
      })
    );

    expect(quoteWithoutMed.medicineCharge).toBe(0);
    expect(htmlWithoutMed).not.toContain('Medicine (price on request');

    // 2. With medicine
    const quoteWithMed = calculateSheetShipmentQuote(
      {
        destination: 'United Kingdom',
        actualWeightKg: 15,
        hasMedicine: true,
      },
      MOCK_SHEET_RATES
    );

    const htmlWithMed = renderToStaticMarkup(
      React.createElement(EstimateBillModal, {
        quote: quoteWithMed,
        onClose: () => {},
      })
    );

    expect(quoteWithMed.medicineCharge).toBe(0); // no fixed price: contact us
    expect(quoteWithMed.medicineOnRequest).toBe(true);
    expect(quoteWithMed.totalNpr).toBe(quoteWithoutMed.totalNpr);
    expect(htmlWithMed).toContain('Medicine (price on request, contact us)');
  });

  it('renders Under-10 kg shipments with 0.5kg flat tier pricing method and single box', () => {
    const quoteSmall = calculateSheetShipmentQuote(
      {
        destination: 'South Korea',
        actualWeightKg: 3,
      },
      MOCK_SHEET_RATES
    );

    const htmlSmall = renderToStaticMarkup(
      React.createElement(EstimateBillModal, {
        quote: quoteSmall,
        onClose: () => {},
      })
    );

    expect(quoteSmall.boxCount).toBe(1);
    expect(quoteSmall.totalWeightKg).toBe(3);
    expect(quoteSmall.baseShippingCharge).toBe(3550);
    expect(quoteSmall.boxCharge).toBe(1100);
    expect(quoteSmall.totalNpr).toBe(4650);

    expect(htmlSmall).toContain('0.5kg Flat Tier');
    expect(htmlSmall).toContain('South Korea');
    expect(htmlSmall).toContain('4,650.00');
    expect(htmlSmall).toContain('Four Thousand Six Hundred Fifty Rupees Only');
  });
});
