/**
 * Form serialization and default values for the rating form.
 * Assumes a form with id "rating-form" and standard field names.
 */

export function getFormValues() {
  const form = document.getElementById('rating-form');
  const data = new FormData(form);

  const multiPolicy = data.get('multiPolicy') || 'yes';
  const dogRisk = data.get('dogRisk') || 'none';

  return {
    clientName: (data.get('clientName') || '').toString().trim(),
    age: Number(data.get('age') || 0),
    productType: data.get('productType') || 'auto',
    continuousAuto: data.get('continuousAuto') || 'yes',
    atFaultAccidents: data.get('atFaultAccidents') || '0',
    autoCompLosses: data.get('autoCompLosses') || '0-1',
    movingViolations: data.get('movingViolations') || 'none',
    vehicleUse: data.get('vehicleUse') || 'personal',
    annualMileage: data.get('annualMileage') || '<15000',
    vehicleType: data.get('vehicleType') || 'standard',
    occupancy: data.get('occupancy') || 'owner_primary',
    claimsHistory: data.get('claimsHistory') || 'none',
    dwellingValueBand: data.get('dwellingValueBand') || '<500k',
    creditTier: 'unknown',
    priorCarrierYears: data.get('priorCarrier') || '0',
    multiPolicy,
    progressiveAuto: data.get('progressiveAuto') || 'no',
    progressiveDeclined: data.get('progressiveDeclined') || 'no',
    firstTimeBuyer: data.get('firstTimeBuyer') || 'no',
    dogRisk,
    roofMaterial: data.get('roofMaterial') || 'asphalt_arch',
    roofAgeYears: Number(data.get('roofAgeYears') || 0),
    oldSystemsFlag: data.get('oldSystemsFlag') === 'on',
    hazardFlag: data.get('hazardFlag') === 'on',
  };
}

export function setFormValues(inputs) {
  const form = document.getElementById('rating-form');
  if (!form) return;

  function setSelect(id, value) {
    const el = form.querySelector(`#${id}`);
    if (el) el.value = value;
  }

  function setInput(id, value) {
    const el = form.querySelector(`#${id}`);
    if (el) el.value = value;
  }

  setInput('clientName', inputs.clientName || '');
  setInput('age', inputs.age || '');

  setSelect('productType', inputs.productType || 'auto');
  setSelect('occupancy', inputs.occupancy || 'owner_primary');
  setSelect('continuousAuto', inputs.continuousAuto || 'yes');
  setSelect('atFaultAccidents', inputs.atFaultAccidents || '0');
  setSelect('autoCompLosses', inputs.autoCompLosses || '0-1');
  setSelect('movingViolations', inputs.movingViolations || 'none');
  setSelect('vehicleUse', inputs.vehicleUse || 'personal');
  setSelect('annualMileage', inputs.annualMileage || '<15000');
  setSelect('vehicleType', inputs.vehicleType || 'standard');
  setSelect('claimsHistory', inputs.claimsHistory || 'none');
  setSelect('dwellingValueBand', inputs.dwellingValueBand || '<500k');
  setSelect('priorCarrier', inputs.priorCarrierYears || '0');
  setSelect('roofMaterial', inputs.roofMaterial || 'asphalt_arch');
  const roofAgeInput = form.querySelector('#roofAgeYears');
  if (roofAgeInput) roofAgeInput.value = inputs.roofAgeYears || '';

  const multiYes = form.querySelector('input[name="multiPolicy"][value="yes"]');
  const multiNo = form.querySelector('input[name="multiPolicy"][value="no"]');
  if (inputs.multiPolicy === 'no' && multiNo) multiNo.checked = true;
  else if (multiYes) multiYes.checked = true;

  const progYes = form.querySelector('input[name="progressiveAuto"][value="yes"]');
  const progNo = form.querySelector('input[name="progressiveAuto"][value="no"]');
  if (inputs.progressiveAuto === 'yes' && progYes) progYes.checked = true;
  else if (progNo) progNo.checked = true;

  const firstYes = form.querySelector('input[name="firstTimeBuyer"][value="yes"]');
  const firstNo = form.querySelector('input[name="firstTimeBuyer"][value="no"]');
  if (inputs.firstTimeBuyer === 'yes' && firstYes) firstYes.checked = true;
  else if (firstNo) firstNo.checked = true;

  const progDeclYes = form.querySelector('input[name="progressiveDeclined"][value="yes"]');
  const progDeclNo = form.querySelector('input[name="progressiveDeclined"][value="no"]');
  if (inputs.progressiveDeclined === 'yes' && progDeclYes) progDeclYes.checked = true;
  else if (progDeclNo) progDeclNo.checked = true;

  const dogNone = form.querySelector('input[name="dogRisk"][value="none"]');
  const dogOk = form.querySelector('input[name="dogRisk"][value="ok"]');
  const dogRes = form.querySelector('input[name="dogRisk"][value="restricted"]');
  if (inputs.dogRisk === 'ok' && dogOk) dogOk.checked = true;
  else if (inputs.dogRisk === 'restricted' && dogRes) dogRes.checked = true;
  else if (dogNone) dogNone.checked = true;

  const oldSystems = form.querySelector('#oldSystemsFlag');
  if (oldSystems) oldSystems.checked = !!inputs.oldSystemsFlag;
  const hazard = form.querySelector('#hazardFlag');
  if (hazard) hazard.checked = !!inputs.hazardFlag;
}

export function createEmptyInputs() {
  return {
    clientName: '',
    age: '',
    productType: 'auto',
    continuousAuto: 'yes',
    atFaultAccidents: '0',
    autoCompLosses: '0-1',
    movingViolations: 'none',
    vehicleUse: 'personal',
    annualMileage: '<15000',
    vehicleType: 'standard',
    occupancy: 'owner_primary',
    claimsHistory: 'none',
    dwellingValueBand: '<500k',
    priorCarrierYears: '0',
    multiPolicy: 'yes',
    progressiveAuto: 'no',
    progressiveDeclined: 'no',
    firstTimeBuyer: 'no',
    dogRisk: 'none',
    roofMaterial: 'asphalt_arch',
    roofAgeYears: '',
    oldSystemsFlag: false,
    hazardFlag: false,
  };
}
