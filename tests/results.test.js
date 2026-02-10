import { describe, it, expect, beforeEach } from 'vitest';
import { renderResult, resetForm } from '../js/results.js';
import { setupRatingFormDOM } from './helpers/dom.js';

describe('results', () => {
  beforeEach(() => {
    setupRatingFormDOM();
  });

  describe('renderResult', () => {
    it('updates resultSummary with client name and product label for auto', () => {
      const inputs = { clientName: 'Jane', productType: 'auto' };
      const suggestionResult = {
        carriers: [
          { name: 'Carrier A', eligible: true, weight: 4, ineligibleReason: '' },
          { name: 'Carrier B', eligible: false, weight: 2, ineligibleReason: 'Not eligible' },
        ],
      };
      renderResult(inputs, suggestionResult);
      const summary = document.getElementById('resultSummary');
      expect(summary.innerHTML).toMatch(/Jane/);
      expect(summary.innerHTML).toMatch(/Personal Auto/);
      expect(summary.innerHTML).toMatch(/suggested markets/);
    });

    it('uses Homeowners label for home product', () => {
      const inputs = { productType: 'home' };
      const suggestionResult = { carriers: [] };
      renderResult(inputs, suggestionResult);
      expect(document.getElementById('resultSummary').innerHTML).toMatch(/Homeowners/);
    });

    it('uses Small Commercial label for commercial product', () => {
      const inputs = { productType: 'commercial' };
      const suggestionResult = { carriers: [] };
      renderResult(inputs, suggestionResult);
      expect(document.getElementById('resultSummary').innerHTML).toMatch(/Small Commercial/);
    });

    it('renders resultDetails with ranked list of carriers', () => {
      const inputs = {};
      const suggestionResult = {
        carriers: [
          { name: 'Progressive', eligible: true, weight: 3.8, ineligibleReason: '' },
          { name: 'Erie', eligible: false, weight: 2, ineligibleReason: 'Prior insurance required' },
        ],
      };
      renderResult(inputs, suggestionResult);
      const details = document.getElementById('resultDetails');
      expect(details.innerHTML).toMatch(/1\. Progressive/);
      expect(details.innerHTML).toMatch(/2\. Erie/);
      expect(details.innerHTML).toMatch(/eligible • weight 3\.80/);
      expect(details.innerHTML).toMatch(/NOT eligible – Prior insurance required/);
    });

    it('includes guidance text in resultDetails', () => {
      const suggestionResult = { carriers: [] };
      renderResult({}, suggestionResult);
      expect(document.getElementById('resultDetails').innerHTML).toMatch(/Ranked by expected premium/);
    });
  });

  describe('resetForm', () => {
    it('resets the form', () => {
      const form = document.getElementById('rating-form');
      form.querySelector('#clientName').value = 'Test';
      form.querySelector('#age').value = '50';
      resetForm();
      expect(form.querySelector('#clientName').value).toBe('');
      expect(form.querySelector('#age').value).toBe('');
    });

    it('sets resultSummary to placeholder text', () => {
      document.getElementById('resultSummary').innerHTML = 'Some results';
      resetForm();
      expect(document.getElementById('resultSummary').textContent).toMatch(/Fill in the form/);
      expect(document.getElementById('resultSummary').textContent).toMatch(/Suggest Carriers/);
    });

    it('clears resultDetails', () => {
      document.getElementById('resultDetails').innerHTML = '<ul><li>Item</li></ul>';
      resetForm();
      expect(document.getElementById('resultDetails').innerHTML).toBe('');
    });
  });
});
