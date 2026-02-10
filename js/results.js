/**
 * Renders carrier suggestion results into the DOM and resets the result area.
 */

export function renderResult(inputs, suggestionResult) {
  const resultSummary = document.getElementById('resultSummary');
  const resultDetails = document.getElementById('resultDetails');

  const namePart = inputs.clientName ? `${inputs.clientName} – ` : '';

  const productLabel =
    inputs.productType === 'home'
      ? 'Homeowners'
      : inputs.productType === 'commercial'
        ? 'Small Commercial'
        : 'Personal Auto';

  resultSummary.innerHTML = `
    <div>
      <div style="margin-bottom: 4px;">
        ${namePart}<span>${productLabel} quote – suggested markets</span>
      </div>
    </div>
  `;

  const listHtml = suggestionResult.carriers
    .map(
      (c, index) => `
      <li>
        <strong>${index + 1}. ${c.name}</strong>
        <span style="color:#6b7280; font-size:11px;">
          ${c.eligible ? `(eligible • weight ${c.weight.toFixed(2)})` : `(NOT eligible – ${c.ineligibleReason})`}
        </span>
      </li>
    `
    )
    .join('');

  resultDetails.innerHTML = `
    <div>Ranked by expected premium (1 = lowest premium for customer). Eligibility & ranking are guidance only – does not rate or bind.</div>
    <ul>${listHtml}</ul>
  `;
}

export function resetForm() {
  const form = document.getElementById('rating-form');
  form.reset();

  document.getElementById('resultSummary').textContent =
    'Fill in the form and click "Suggest Carriers".';
  document.getElementById('resultDetails').innerHTML = '';
}
