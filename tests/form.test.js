import { describe, it, expect, beforeEach } from 'vitest';
import { getFormValues, setFormValues, createEmptyInputs } from '../js/form.js';
import { setupRatingFormDOM } from './helpers/dom.js';

describe('form', () => {
  beforeEach(() => {
    setupRatingFormDOM();
  });

  describe('getFormValues', () => {
    it('returns default values when form is empty or default', () => {
      const values = getFormValues();
      expect(values.productType).toBe('auto');
      expect(values.continuousAuto).toBe('yes');
      expect(values.multiPolicy).toBe('yes');
      expect(values.dogRisk).toBe('none');
      expect(values.progressiveAuto).toBe('no');
      expect(values.progressiveDeclined).toBe('no');
      expect(values.claimsHistory).toBe('none');
      expect(values.clientName).toBe('');
      expect(values.age).toBe(0);
      expect(values.oldSystemsFlag).toBe(false);
      expect(values.hazardFlag).toBe(false);
    });

    it('reads clientName and age from inputs', () => {
      const form = document.getElementById('rating-form');
      form.querySelector('#clientName').value = '  Jane Doe  ';
      form.querySelector('#age').value = '35';
      const values = getFormValues();
      expect(values.clientName).toBe('Jane Doe');
      expect(values.age).toBe(35);
    });

    it('reads productType and occupancy', () => {
      const form = document.getElementById('rating-form');
      form.querySelector('#productType').value = 'home';
      form.querySelector('#occupancy').value = 'owner_primary';
      const values = getFormValues();
      expect(values.productType).toBe('home');
      expect(values.occupancy).toBe('owner_primary');
    });

    it('reads multiPolicy from radio', () => {
      const form = document.getElementById('rating-form');
      const noRadio = form.querySelector('input[name="multiPolicy"][value="no"]');
      noRadio.checked = true;
      const values = getFormValues();
      expect(values.multiPolicy).toBe('no');
    });

    it('reads checkboxes for oldSystemsFlag and hazardFlag', () => {
      const form = document.getElementById('rating-form');
      form.querySelector('#oldSystemsFlag').checked = true;
      const values = getFormValues();
      expect(values.oldSystemsFlag).toBe(true);
      form.querySelector('#hazardFlag').checked = true;
      const values2 = getFormValues();
      expect(values2.hazardFlag).toBe(true);
    });
  });

  describe('setFormValues', () => {
    it('populates text and number inputs', () => {
      setFormValues({ clientName: 'John', age: 25 });
      const form = document.getElementById('rating-form');
      expect(form.querySelector('#clientName').value).toBe('John');
      expect(form.querySelector('#age').value).toBe('25');
    });

    it('sets select values', () => {
      setFormValues({
        productType: 'home',
        occupancy: 'rental_or_airbnb',
        atFaultAccidents: '1',
        claimsHistory: 'one',
      });
      const form = document.getElementById('rating-form');
      expect(form.querySelector('#productType').value).toBe('home');
      expect(form.querySelector('#occupancy').value).toBe('rental_or_airbnb');
      expect(form.querySelector('#atFaultAccidents').value).toBe('1');
      expect(form.querySelector('#claimsHistory').value).toBe('one');
    });

    it('sets multiPolicy radio to no', () => {
      setFormValues({ multiPolicy: 'no' });
      const form = document.getElementById('rating-form');
      const noRadio = form.querySelector('input[name="multiPolicy"][value="no"]');
      expect(noRadio.checked).toBe(true);
    });

    it('sets dogRisk radio', () => {
      setFormValues({ dogRisk: 'restricted' });
      const form = document.getElementById('rating-form');
      const restricted = form.querySelector('input[name="dogRisk"][value="restricted"]');
      expect(restricted.checked).toBe(true);
    });

    it('sets checkboxes', () => {
      setFormValues({ oldSystemsFlag: true, hazardFlag: true });
      expect(document.getElementById('oldSystemsFlag').checked).toBe(true);
      expect(document.getElementById('hazardFlag').checked).toBe(true);
    });
  });

  describe('createEmptyInputs', () => {
    it('returns object with all expected keys', () => {
      const empty = createEmptyInputs();
      expect(empty).toHaveProperty('clientName', '');
      expect(empty).toHaveProperty('productType', 'auto');
      expect(empty).toHaveProperty('continuousAuto', 'yes');
      expect(empty).toHaveProperty('multiPolicy', 'yes');
      expect(empty).toHaveProperty('dogRisk', 'none');
      expect(empty).toHaveProperty('roofMaterial', 'asphalt_arch');
      expect(empty).toHaveProperty('oldSystemsFlag', false);
      expect(empty).toHaveProperty('hazardFlag', false);
    });

    it('matches shape expected by getFormValues', () => {
      const empty = createEmptyInputs();
      const keys = [
        'clientName', 'age', 'productType', 'continuousAuto', 'atFaultAccidents',
        'autoCompLosses', 'movingViolations', 'vehicleUse', 'annualMileage',
        'vehicleType', 'occupancy', 'claimsHistory', 'dwellingValueBand',
        'priorCarrierYears', 'multiPolicy', 'progressiveAuto', 'progressiveDeclined',
        'firstTimeBuyer', 'dogRisk', 'roofMaterial', 'roofAgeYears',
        'oldSystemsFlag', 'hazardFlag',
      ];
      for (const k of keys) {
        expect(empty).toHaveProperty(k);
      }
    });
  });
});
