import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { stageOf, StatusBadge } from '../src/design/primitives/Badge';

describe('StatusBadge', () => {
  it('maps free-text staff statuses to one of five stages', () => {
    expect(stageOf('Delivered')).toBe('delivered');
    expect(stageOf('Out for delivery')).toBe('transit');
    expect(stageOf('In Transit')).toBe('transit');
    expect(stageOf('Held at destination customs awaiting importer documents')).toBe('hold');
    expect(stageOf('Returned to sender')).toBe('problem');
    expect(stageOf('Booked')).toBe('booked');
    expect(stageOf('something staff typed')).toBe('booked'); // unknown is never shown as a problem
  });

  it('renders nothing for an empty status and keeps the full text otherwise', () => {
    expect(renderToStaticMarkup(React.createElement(StatusBadge, { status: '  ' }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(StatusBadge, { status: 'In Transit' }))).toContain('In Transit');
  });
});
