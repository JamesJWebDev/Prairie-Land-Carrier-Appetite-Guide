import { describe, it, expect } from 'vitest';
import { calculateCarrierSuggestions } from '../js/suggestions.js';

describe('calculateCarrierSuggestions', () => {
  it('returns productKey, carriers array, and explanations', () => {
    const inputs = { productType: 'auto' };
    const result = calculateCarrierSuggestions(inputs);
    expect(result).toHaveProperty('productKey', 'auto');
    expect(result).toHaveProperty('carriers');
    expect(result).toHaveProperty('explanations');
    expect(Array.isArray(result.carriers)).toBe(true);
    expect(Array.isArray(result.explanations)).toBe(true);
  });

  it('uses home product when productType is home', () => {
    const result = calculateCarrierSuggestions({ productType: 'home' });
    expect(result.productKey).toBe('home');
    expect(result.carriers.length).toBeGreaterThan(0);
  });

  it('uses commercial product when productType is commercial', () => {
    const result = calculateCarrierSuggestions({ productType: 'commercial' });
    expect(result.productKey).toBe('commercial');
    expect(result.carriers.length).toBeGreaterThan(0);
  });

  it('defaults to auto when productType is missing', () => {
    const result = calculateCarrierSuggestions({});
    expect(result.productKey).toBe('auto');
  });

  it('each carrier has name, weight, eligible, ineligibleReason', () => {
    const result = calculateCarrierSuggestions({ productType: 'auto' });
    for (const c of result.carriers) {
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('weight');
      expect(c).toHaveProperty('eligible');
      expect(c).toHaveProperty('ineligibleReason');
      expect(typeof c.eligible).toBe('boolean');
      expect(typeof c.weight).toBe('number');
    }
  });

  it('sorts eligible carriers before ineligible', () => {
    const result = calculateCarrierSuggestions({
      productType: 'auto',
      continuousAuto: 'no',
      atFaultAccidents: '2plus',
      movingViolations: 'many_or_major',
      progressiveDeclined: 'yes',
    });
    const carriers = result.carriers;
    const firstIneligible = carriers.findIndex((c) => !c.eligible);
    if (firstIneligible === -1) return;
    for (let i = 0; i < firstIneligible; i++) {
      expect(carriers[i].eligible).toBe(true);
    }
    for (let i = firstIneligible; i < carriers.length; i++) {
      expect(carriers[i].eligible).toBe(false);
    }
  });

  it('ranks eligible carriers by weight descending', () => {
    const result = calculateCarrierSuggestions({
      productType: 'auto',
      claimsHistory: 'none',
      priorCarrierYears: '3',
      multiPolicy: 'yes',
    });
    const eligible = result.carriers.filter((c) => c.eligible);
    for (let i = 1; i < eligible.length; i++) {
      expect(eligible[i].weight).toBeLessThanOrEqual(eligible[i - 1].weight);
    }
  });

  describe('auto eligibility', () => {
    it('marks Erie ineligible when continuous auto is no', () => {
      const result = calculateCarrierSuggestions({
        productType: 'auto',
        continuousAuto: 'no',
      });
      const erie = result.carriers.find((c) => c.key === 'erieAuto');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
      expect(erie.ineligibleReason).toMatch(/continuous|prior insurance/i);
    });

    it('marks Progressive ineligible when progressiveDeclined is yes', () => {
      const result = calculateCarrierSuggestions({
        productType: 'auto',
        progressiveDeclined: 'yes',
      });
      const prog = result.carriers.find((c) => c.key === 'progressiveAuto');
      expect(prog).toBeDefined();
      expect(prog.eligible).toBe(false);
      expect(prog.ineligibleReason).toMatch(/declined|nonrenewed|Progressive/i);
    });

    it('marks Erie ineligible for 2+ at-fault accidents', () => {
      const result = calculateCarrierSuggestions({
        productType: 'auto',
        atFaultAccidents: '2plus',
      });
      const erie = result.carriers.find((c) => c.key === 'erieAuto');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
    });

    it('marks Erie ineligible for 4+ comp losses', () => {
      const result = calculateCarrierSuggestions({
        productType: 'auto',
        autoCompLosses: '4plus',
      });
      const erie = result.carriers.find((c) => c.key === 'erieAuto');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
    });

    it('marks Erie ineligible for many_or_major violations', () => {
      const result = calculateCarrierSuggestions({
        productType: 'auto',
        movingViolations: 'many_or_major',
      });
      const erie = result.carriers.find((c) => c.key === 'erieAuto');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
    });

    it('gives higher weight for no claims', () => {
      const withClaims = calculateCarrierSuggestions({
        productType: 'auto',
        claimsHistory: 'multiple',
      });
      const noClaims = calculateCarrierSuggestions({
        productType: 'auto',
        claimsHistory: 'none',
      });
      const progNoClaims = noClaims.carriers.find((c) => c.key === 'progressiveAuto');
      const progWithClaims = withClaims.carriers.find((c) => c.key === 'progressiveAuto');
      expect(progNoClaims.weight).toBeGreaterThan(progWithClaims.weight);
    });
  });

  describe('home eligibility', () => {
    it('marks Erie home ineligible for rental occupancy', () => {
      const result = calculateCarrierSuggestions({
        productType: 'home',
        occupancy: 'rental_or_airbnb',
      });
      const erie = result.carriers.find((c) => c.key === 'erieHome');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
    });

    it('marks Erie home ineligible for restricted dog risk', () => {
      const result = calculateCarrierSuggestions({
        productType: 'home',
        dogRisk: 'restricted',
      });
      const erie = result.carriers.find((c) => c.key === 'erieHome');
      expect(erie).toBeDefined();
      expect(erie.eligible).toBe(false);
    });

    it('marks Progressive home ineligible without Progressive auto', () => {
      const result = calculateCarrierSuggestions({
        productType: 'home',
        progressiveAuto: 'no',
      });
      const prog = result.carriers.find((c) => c.key === 'progressiveHome');
      expect(prog).toBeDefined();
      expect(prog.eligible).toBe(false);
    });
  });

  describe('explanations', () => {
    it('each explanation has carrier name, reasons array, and eligible', () => {
      const result = calculateCarrierSuggestions({ productType: 'auto' });
      expect(result.explanations.length).toBe(result.carriers.length);
      for (const ex of result.explanations) {
        expect(ex).toHaveProperty('carrier');
        expect(ex).toHaveProperty('reasons');
        expect(ex).toHaveProperty('eligible');
        expect(Array.isArray(ex.reasons)).toBe(true);
      }
    });
  });
});
