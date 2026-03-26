import React from 'react'
import { RatingInputs } from '../lib/suggestions'

export interface FormValues extends RatingInputs {
  clientName: string
  age: number | string
  productType: string
  continuousAuto: string
  atFaultAccidents: string
  autoCompLosses: string
  movingViolations: string
  vehicleUse: string
  annualMileage: string
  vehicleType: string
  occupancy: string
  claimsHistory: string
  dwellingValueBand: string
  priorCarrierYears: string
  multiPolicy: string
  progressiveAuto: string
  progressiveDeclined: string
  firstTimeBuyer: string
  dogRisk: string
  roofMaterial: string
  roofAgeYears: number | string
  oldSystemsFlag: boolean
  hazardFlag: boolean
}

export function createEmptyInputs(): FormValues {
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
  }
}

interface Props {
  values: FormValues
  onChange: (values: FormValues) => void
  onSubmit: (values: FormValues) => void
  onReset: () => void
}

export const RatingForm: React.FC<Props> = ({ values, onChange, onSubmit, onReset }) => {
  const isAuto = values.productType === 'auto'
  const isHome = values.productType === 'home'

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form id="rating-form" className="form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="clientName">Client name</label>
        <input
          id="clientName"
          name="clientName"
          type="text"
          autoComplete="off"
          value={values.clientName}
          onChange={(e) => set('clientName', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min={16}
          max={100}
          value={values.age}
          onChange={(e) => set('age', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label htmlFor="productType">Policy type</label>
        <select
          id="productType"
          name="productType"
          value={values.productType}
          onChange={(e) => set('productType', e.target.value)}
        >
          <option value="auto">Personal Auto</option>
          <option value="home">Homeowners</option>
          <option value="commercial">Small Commercial</option>
        </select>
      </div>

      {isHome && (
        <div className="field section-home">
          <label htmlFor="occupancy">Home occupancy (for home quotes)</label>
          <select
            id="occupancy"
            name="occupancy"
            value={values.occupancy}
            onChange={(e) => set('occupancy', e.target.value)}
          >
            <option value="owner_primary">Owner-occupied primary</option>
            <option value="owner_secondary">Owner-occupied secondary</option>
            <option value="rental_or_airbnb">Rental / Airbnb / seasonal</option>
            <option value="vacant_or_other">Vacant / estate / student housing / other</option>
          </select>
        </div>
      )}

      {isAuto && (
        <>
          <div className="field section-auto">
            <label htmlFor="continuousAuto">Continuous auto insurance (last 6+ months)</label>
            <select
              id="continuousAuto"
              name="continuousAuto"
              value={values.continuousAuto}
              onChange={(e) => set('continuousAuto', e.target.value)}
            >
              <option value="yes">Yes – continuous insurance 6+ months</option>
              <option value="no">No – lapse / no prior in last 6 months</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="atFaultAccidents">At-fault accidents (last 5 years)</label>
            <select
              id="atFaultAccidents"
              name="atFaultAccidents"
              value={values.atFaultAccidents}
              onChange={(e) => set('atFaultAccidents', e.target.value)}
            >
              <option value="0">None</option>
              <option value="1">One at-fault accident</option>
              <option value="2plus">Two or more at-fault accidents</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="autoCompLosses">Comprehensive losses (last 5 years)</label>
            <select
              id="autoCompLosses"
              name="autoCompLosses"
              value={values.autoCompLosses}
              onChange={(e) => set('autoCompLosses', e.target.value)}
            >
              <option value="0-1">0–1 comp losses</option>
              <option value="2-3">2–3 comp losses</option>
              <option value="4plus">4+ comp losses</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="movingViolations">Moving / vehicle code violations</label>
            <select
              id="movingViolations"
              name="movingViolations"
              value={values.movingViolations}
              onChange={(e) => set('movingViolations', e.target.value)}
            >
              <option value="none">None</option>
              <option value="few_minor">1–2 minor violations</option>
              <option value="many_or_major">3+ or major speeding (20+ over)</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="vehicleUse">Vehicle use</label>
            <select
              id="vehicleUse"
              name="vehicleUse"
              value={values.vehicleUse}
              onChange={(e) => set('vehicleUse', e.target.value)}
            >
              <option value="personal">Personal / commute only</option>
              <option value="business">Business use (contractor / realtor / agent etc.)</option>
              <option value="tnc">Rideshare / delivery (Uber, Lyft, DoorDash, etc.)</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="annualMileage">Annual mileage (per vehicle)</label>
            <select
              id="annualMileage"
              name="annualMileage"
              value={values.annualMileage}
              onChange={(e) => set('annualMileage', e.target.value)}
            >
              <option value="<15000">Under 15,000 miles</option>
              <option value="15000-25000">15,000–25,000 miles</option>
              <option value=">25000">Over 25,000 miles</option>
            </select>
          </div>

          <div className="field section-auto">
            <label htmlFor="vehicleType">Vehicle type</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={values.vehicleType}
              onChange={(e) => set('vehicleType', e.target.value)}
            >
              <option value="standard">Standard private passenger auto</option>
              <option value="sports_or_perf">Sports / high performance</option>
              <option value="modified_or_not_roadworthy">Modified / not roadworthy / in process of rebuild</option>
            </select>
          </div>

          <div className="field section-auto">
            <label>Previously declined / nonrenewed / cancelled by Progressive?</label>
            <div className="inline-options">
              <label>
                <input
                  type="radio"
                  name="progressiveDeclined"
                  value="yes"
                  checked={values.progressiveDeclined === 'yes'}
                  onChange={() => set('progressiveDeclined', 'yes')}
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="progressiveDeclined"
                  value="no"
                  checked={values.progressiveDeclined === 'no'}
                  onChange={() => set('progressiveDeclined', 'no')}
                />{' '}
                No
              </label>
            </div>
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="claimsHistory">Claims in last 5 years</label>
        <select
          id="claimsHistory"
          name="claimsHistory"
          value={values.claimsHistory}
          onChange={(e) => set('claimsHistory', e.target.value)}
        >
          <option value="none">None</option>
          <option value="one">1 claim</option>
          <option value="multiple">2+ claims</option>
        </select>
      </div>

      {isHome && (
        <>
          <div className="field section-home">
            <label htmlFor="dwellingValueBand">Approx. dwelling coverage amount</label>
            <select
              id="dwellingValueBand"
              name="dwellingValueBand"
              value={values.dwellingValueBand}
              onChange={(e) => set('dwellingValueBand', e.target.value)}
            >
              <option value="<500k">Under $500k</option>
              <option value="500-1000k">$500k–$1M</option>
              <option value="1000-1500k">$1M–$1.5M</option>
              <option value=">1500k">Over $1.5M</option>
            </select>
          </div>

          <div className="field section-home">
            <label>Progressive auto policy in force?</label>
            <div className="inline-options">
              <label>
                <input
                  type="radio"
                  name="progressiveAuto"
                  value="yes"
                  checked={values.progressiveAuto === 'yes'}
                  onChange={() => set('progressiveAuto', 'yes')}
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="progressiveAuto"
                  value="no"
                  checked={values.progressiveAuto === 'no'}
                  onChange={() => set('progressiveAuto', 'no')}
                />{' '}
                No
              </label>
            </div>
          </div>

          <div className="field section-home">
            <label>First-time home buyer?</label>
            <div className="inline-options">
              <label>
                <input
                  type="radio"
                  name="firstTimeBuyer"
                  value="yes"
                  checked={values.firstTimeBuyer === 'yes'}
                  onChange={() => set('firstTimeBuyer', 'yes')}
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="firstTimeBuyer"
                  value="no"
                  checked={values.firstTimeBuyer === 'no'}
                  onChange={() => set('firstTimeBuyer', 'no')}
                />{' '}
                No
              </label>
            </div>
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="priorCarrier">Continuous insurance (years)</label>
        <select
          id="priorCarrier"
          name="priorCarrier"
          value={values.priorCarrierYears}
          onChange={(e) => set('priorCarrierYears', e.target.value)}
        >
          <option value="0">None</option>
          <option value="1">1–2 years</option>
          <option value="3">3–5 years</option>
          <option value="6">6+ years</option>
        </select>
      </div>

      <div className="field field-full">
        <label>Multi-policy (bundled)?</label>
        <div className="inline-options">
          <label>
            <input
              type="radio"
              name="multiPolicy"
              value="yes"
              checked={values.multiPolicy === 'yes'}
              onChange={() => set('multiPolicy', 'yes')}
            />{' '}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="multiPolicy"
              value="no"
              checked={values.multiPolicy === 'no'}
              onChange={() => set('multiPolicy', 'no')}
            />{' '}
            No
          </label>
        </div>
      </div>

      {isHome && (
        <>
          <div className="field field-full section-home">
            <label>Dogs on premises (for home quotes)</label>
            <div className="inline-options">
              <label>
                <input
                  type="radio"
                  name="dogRisk"
                  value="none"
                  checked={values.dogRisk === 'none'}
                  onChange={() => set('dogRisk', 'none')}
                />{' '}
                None / no dog exposure
              </label>
              <label>
                <input
                  type="radio"
                  name="dogRisk"
                  value="ok"
                  checked={values.dogRisk === 'ok'}
                  onChange={() => set('dogRisk', 'ok')}
                />{' '}
                Dogs, no bite history / restricted breeds
              </label>
              <label>
                <input
                  type="radio"
                  name="dogRisk"
                  value="restricted"
                  checked={values.dogRisk === 'restricted'}
                  onChange={() => set('dogRisk', 'restricted')}
                />{' '}
                Restricted breed or bite history
              </label>
            </div>
          </div>

          <div className="field field-full section-home">
            <label>Home condition flags (for home quotes)</label>
            <div className="inline-options">
              <label>
                <input
                  type="checkbox"
                  id="oldSystemsFlag"
                  name="oldSystemsFlag"
                  checked={values.oldSystemsFlag}
                  onChange={(e) => set('oldSystemsFlag', e.target.checked)}
                />{' '}
                Older electrical / plumbing / heating concerns
              </label>
              <label>
                <input
                  type="checkbox"
                  id="hazardFlag"
                  name="hazardFlag"
                  checked={values.hazardFlag}
                  onChange={(e) => set('hazardFlag', e.target.checked)}
                />{' '}
                Hazards: trampoline, unfenced pool, debris, etc.
              </label>
            </div>
          </div>

          <div className="field section-home">
            <label htmlFor="roofMaterial">Roof material / type</label>
            <select
              id="roofMaterial"
              name="roofMaterial"
              value={values.roofMaterial}
              onChange={(e) => set('roofMaterial', e.target.value)}
            >
              <option value="asphalt_arch">Asphalt architectural/composition shingles</option>
              <option value="asphalt_3tab">Asphalt 3-tab shingles</option>
              <option value="metal_or_slate">Metal / slate / clay tile</option>
              <option value="flat_membrane">Flat roof (rubber / membrane / built-up)</option>
              <option value="wood_shake">Wood shingle / wood shake</option>
              <option value="rolled_tar">Rolled / tar &amp; gravel / older tin or corrugated</option>
              <option value="other">Other / unsure</option>
            </select>
          </div>

          <div className="field section-home">
            <label htmlFor="roofAgeYears">Exact roof age (years)</label>
            <input
              id="roofAgeYears"
              name="roofAgeYears"
              type="number"
              min={0}
              max={80}
              placeholder="e.g. 12"
              value={values.roofAgeYears}
              onChange={(e) => set('roofAgeYears', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="primary-button">
          Suggest Carriers
        </button>
        <button type="button" className="secondary-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  )
}
