import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TrackingSection } from '../src/components/TrackingSection';
import type { Shipment } from '../src/types';

const shipment = {
  trackingNumber: 'BC-1001-KOR',
  mode: 'air',
  status: 'In Transit',
  origin: 'Hetauda',
  destination: 'Seoul',
  estimatedDelivery: '3 Nov 2026',
  grossWeightKg: 15,
  originHub: 'Hetauda Logistics Hub',
  telemetry: { lastUpdated: '' },
  milestones: [
    { id: '1', title: 'Shipment booked', location: 'Hetauda', timestamp: '2026-10-28T09:00:00Z', status: 'completed' },
    { id: '2', title: 'Left Nepal', location: 'Kathmandu', timestamp: '2026-10-29T06:00:00Z', status: 'completed' },
    { id: '3', title: 'Delivered', location: 'Seoul', timestamp: '', status: 'pending' },
  ],
} as unknown as Shipment;

const render = (s: Shipment | null) =>
  renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/track'] }, React.createElement(TrackingSection, { shipment: s })));

describe('Tracking page', () => {
  it('shows only real tracking data, in order, with no invented fields', () => {
    const html = render(shipment);
    expect(html).toContain('BC-1001-KOR');
    expect(html.indexOf('Shipment booked')).toBeLessThan(html.indexOf('Left Nepal'));
    expect(html).toContain('Delivered');
    // service placeholders must never reach the customer
    expect(html).not.toContain('15 kg');
    expect(html).not.toContain('Logistics Hub');
    expect(html).not.toContain('Last updated');
    expect(html).not.toMatch(/Print Waybill/i);
  });

  it('shows the empty state before any search', () => {
    expect(render(null)).toContain('Where is my tracking number?');
  });
});

describe('Tracking page worst-case data', () => {
  it('never invents a time, never shows a broken timestamp, and drops empty fields', async () => {
    const { TRACKING_FIXTURES } = await import('../src/dev/trackingFixtures');
    const worst = render(TRACKING_FIXTURES.worst);
    expect(worst).toContain('22 Oct 2026'); // date-only checkpoint
    expect(worst).not.toMatch(/22 Oct 2026, \d{2}:\d{2}/); // ...without a made-up time
    expect(worst).not.toContain('not-a-date');
    expect(worst).toContain('yesterday afternoon'); // staff free text kept as typed

    const empty = render(TRACKING_FIXTURES.empty);
    expect(empty).toContain('No checkpoints have been added yet');
    expect(empty).toContain('We will confirm soon');
    expect(empty).not.toContain('Last updated');
  });
});
