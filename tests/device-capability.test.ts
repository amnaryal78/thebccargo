import { describe, it, expect } from 'vitest';
import { canRender3D, hasWebGL2Support } from '../src/lib/device-capability';

describe('device-capability: canRender3D()', () => {
  const createMockEnvironment = (overrides?: {
    matchesMedia?: Record<string, boolean>;
    saveData?: boolean;
    hardwareConcurrency?: number;
    hasWebGL2?: boolean;
  }) => {
    const mediaMap = overrides?.matchesMedia || {
      '(min-width: 1024px) and (pointer: fine)': true,
      '(prefers-reduced-motion: reduce)': false,
    };

    const mockWindow = {
      matchMedia: (query: string) => ({
        matches: Boolean(mediaMap[query]),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
      document: {
        createElement: (tag: string) => {
          if (tag === 'canvas') {
            return {
              getContext: (type: string) => {
                if (type === 'webgl2') {
                  return overrides?.hasWebGL2 !== false ? {} : null;
                }
                return null;
              },
            };
          }
          return {};
        },
      },
    } as unknown as Window;

    const mockNavigator = {
      hardwareConcurrency: overrides?.hardwareConcurrency ?? 8,
      connection: {
        saveData: Boolean(overrides?.saveData),
      },
    } as unknown as Navigator;

    return { mockWindow, mockNavigator };
  };

  it('returns true on standard desktop with WebGL2 and >= 6 cores', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment();
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(true);
  });

  it('returns false on mobile or touch viewports (< 1024px or touch pointer)', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment({
      matchesMedia: {
        '(min-width: 1024px) and (pointer: fine)': false,
        '(prefers-reduced-motion: reduce)': false,
      },
    });
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(false);
  });

  it('returns false when prefers-reduced-motion is requested', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment({
      matchesMedia: {
        '(min-width: 1024px) and (pointer: fine)': true,
        '(prefers-reduced-motion: reduce)': true,
      },
    });
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(false);
  });

  it('returns false when saveData is enabled', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment({
      saveData: true,
    });
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(false);
  });

  it('returns false when hardwareConcurrency is under 6', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment({
      hardwareConcurrency: 4,
    });
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(false);
  });

  it('returns false when WebGL2 context creation fails', () => {
    const { mockWindow, mockNavigator } = createMockEnvironment({
      hasWebGL2: false,
    });
    expect(canRender3D({ windowObj: mockWindow, navigatorObj: mockNavigator })).toBe(false);
    expect(hasWebGL2Support(mockWindow)).toBe(false);
  });
});
