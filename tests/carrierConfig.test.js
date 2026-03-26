import { describe, it, expect } from 'vitest';
import { CARRIER_CONFIG } from '../src/renderer/lib/carrierConfig.ts';

describe('CARRIER_CONFIG', () => {
  it('has auto, home, and commercial product keys', () => {
    expect(CARRIER_CONFIG).toHaveProperty('auto');
    expect(CARRIER_CONFIG).toHaveProperty('home');
    expect(CARRIER_CONFIG).toHaveProperty('commercial');
    expect(Object.keys(CARRIER_CONFIG).sort()).toEqual(['auto', 'commercial', 'home']);
  });

  it('each product has a non-empty array of carriers', () => {
    for (const key of ['auto', 'home', 'commercial']) {
      const list = CARRIER_CONFIG[key];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  it('each carrier has name, baseWeight, and key', () => {
    for (const key of ['auto', 'home', 'commercial']) {
      for (const carrier of CARRIER_CONFIG[key]) {
        expect(carrier).toHaveProperty('name');
        expect(typeof carrier.name).toBe('string');
        expect(carrier.name.length).toBeGreaterThan(0);
        expect(carrier).toHaveProperty('baseWeight');
        expect(typeof carrier.baseWeight).toBe('number');
        expect(carrier).toHaveProperty('key');
        expect(typeof carrier.key).toBe('string');
        expect(carrier.key.length).toBeGreaterThan(0);
      }
    }
  });

  it('base weights are positive numbers', () => {
    for (const key of ['auto', 'home', 'commercial']) {
      for (const carrier of CARRIER_CONFIG[key]) {
        expect(carrier.baseWeight).toBeGreaterThan(0);
      }
    }
  });

  it('carrier keys are unique within each product', () => {
    for (const key of ['auto', 'home', 'commercial']) {
      const keys = CARRIER_CONFIG[key].map((c) => c.key);
      const unique = [...new Set(keys)];
      expect(unique.length).toBe(keys.length);
    }
  });

  it('auto has expected carrier keys', () => {
    const autoKeys = CARRIER_CONFIG.auto.map((c) => c.key);
    expect(autoKeys).toContain('progressiveAuto');
    expect(autoKeys).toContain('erieAuto');
    expect(autoKeys).toContain('foremostAuto');
  });

  it('home has expected carrier keys', () => {
    const homeKeys = CARRIER_CONFIG.home.map((c) => c.key);
    expect(homeKeys).toContain('erieHome');
    expect(homeKeys).toContain('progressiveHome');
  });

  it('commercial has expected carrier keys', () => {
    const commKeys = CARRIER_CONFIG.commercial.map((c) => c.key);
    expect(commKeys).toContain('travellersComm');
    expect(commKeys).toContain('grinnellComm');
  });
});
