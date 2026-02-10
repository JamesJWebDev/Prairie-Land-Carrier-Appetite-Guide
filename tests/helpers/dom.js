/**
 * Build a minimal DOM that matches the rating form and result areas for tests.
 * Call setupRatingFormDOM() in beforeEach to attach to document.
 */
function createRatingFormHTML() {
  return `
    <form id="rating-form">
      <input id="clientName" name="clientName" type="text" />
      <input id="age" name="age" type="number" />
      <select id="productType" name="productType">
        <option value="auto">Auto</option>
        <option value="home">Home</option>
        <option value="commercial">Commercial</option>
      </select>
      <select id="occupancy" name="occupancy">
        <option value="owner_primary">Owner</option>
        <option value="rental_or_airbnb">Rental</option>
      </select>
      <select id="continuousAuto" name="continuousAuto">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <select id="atFaultAccidents" name="atFaultAccidents">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2plus">2+</option>
      </select>
      <select id="autoCompLosses" name="autoCompLosses">
        <option value="0-1">0-1</option>
        <option value="4plus">4+</option>
      </select>
      <select id="movingViolations" name="movingViolations">
        <option value="none">None</option>
        <option value="many_or_major">Many</option>
      </select>
      <select id="vehicleUse" name="vehicleUse">
        <option value="personal">Personal</option>
      </select>
      <select id="annualMileage" name="annualMileage">
        <option value="<15000">&lt;15k</option>
        <option value=">25000">&gt;25k</option>
      </select>
      <select id="vehicleType" name="vehicleType">
        <option value="standard">Standard</option>
        <option value="modified_or_not_roadworthy">Modified</option>
      </select>
      <input type="radio" name="progressiveDeclined" value="yes" />
      <input type="radio" name="progressiveDeclined" value="no" checked />
      <select id="claimsHistory" name="claimsHistory">
        <option value="none">None</option>
        <option value="one">One</option>
        <option value="multiple">Multiple</option>
      </select>
      <select id="dwellingValueBand" name="dwellingValueBand">
        <option value="<500k">&lt;500k</option>
      </select>
      <input type="radio" name="progressiveAuto" value="yes" />
      <input type="radio" name="progressiveAuto" value="no" checked />
      <input type="radio" name="firstTimeBuyer" value="yes" />
      <input type="radio" name="firstTimeBuyer" value="no" checked />
      <select id="priorCarrier" name="priorCarrier">
        <option value="0">0</option>
        <option value="3">3</option>
      </select>
      <input type="radio" name="multiPolicy" value="yes" checked />
      <input type="radio" name="multiPolicy" value="no" />
      <input type="radio" name="dogRisk" value="none" checked />
      <input type="radio" name="dogRisk" value="ok" />
      <input type="radio" name="dogRisk" value="restricted" />
      <input type="checkbox" id="oldSystemsFlag" name="oldSystemsFlag" />
      <input type="checkbox" id="hazardFlag" name="hazardFlag" />
      <select id="roofMaterial" name="roofMaterial">
        <option value="asphalt_arch">Asphalt</option>
      </select>
      <input id="roofAgeYears" name="roofAgeYears" type="number" />
    </form>
    <div id="resultSummary"></div>
    <div id="resultDetails"></div>
  `;
}

/**
 * Replace document body with the rating form + result divs. Returns the container.
 */
function setupRatingFormDOM() {
  const container = document.createElement('div');
  container.innerHTML = createRatingFormHTML();
  document.body.innerHTML = '';
  document.body.appendChild(container);
  return container;
}

export { createRatingFormHTML, setupRatingFormDOM };
