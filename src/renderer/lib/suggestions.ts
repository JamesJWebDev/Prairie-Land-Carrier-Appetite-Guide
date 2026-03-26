/**
 * Carrier suggestion engine: eligibility and weight by product (auto, home, commercial).
 * Uses CARRIER_CONFIG and a rule-engine that applies shared + product-specific rules.
 */
import { CARRIER_CONFIG, CarrierEntry } from './carrierConfig'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RatingInputs {
  productType?: string
  clientName?: string
  age?: number
  continuousAuto?: string
  atFaultAccidents?: string
  autoCompLosses?: string
  movingViolations?: string
  vehicleUse?: string
  annualMileage?: string
  vehicleType?: string
  occupancy?: string
  claimsHistory?: string
  dwellingValueBand?: string
  creditTier?: string
  priorCarrierYears?: string
  multiPolicy?: string
  progressiveAuto?: string
  progressiveDeclined?: string
  firstTimeBuyer?: string
  dogRisk?: boolean | string
  hazardFlag?: boolean
  oldSystemsFlag?: boolean
  roofMaterial?: string
  roofAgeYears?: number | string
}

interface CarrierState {
  weight: number
  reasons: string[]
  eligible: boolean
  ineligibleReason: string
}

interface RuleContext {
  eligible?: boolean
  roofMat?: string
  roofAge?: number
}

interface Rule {
  when: (inputs: RatingInputs, ctx?: RuleContext) => boolean
  reason?: string | null
  reasonByCarrier?: Record<string, string>
  ineligible?: boolean
  weight?: number
  carriers?: string | string[]
}

export interface CarrierResult extends CarrierEntry {
  weight: number
  eligible: boolean
  ineligibleReason: string
}

export interface CarrierExplanation {
  carrier: string
  reasons: string[]
  eligible: boolean
  ineligibleReason: string
}

export interface SuggestionResult {
  productKey: string
  carriers: CarrierResult[]
  explanations: CarrierExplanation[]
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

function appliesTo(carrierKey: string, rule: Rule): boolean {
  if (!rule.carriers) return true
  const list = Array.isArray(rule.carriers) ? rule.carriers : [rule.carriers]
  return list.includes(carrierKey)
}

function applyRule(
  rule: Rule,
  inputs: RatingInputs,
  carrier: CarrierEntry,
  state: CarrierState,
  ctx: RuleContext = {}
): void {
  ctx.eligible = state.eligible
  if (!rule.when(inputs, ctx)) return
  const key = carrier.key

  if (rule.reasonByCarrier && key in rule.reasonByCarrier) {
    state.eligible = false
    state.ineligibleReason = state.ineligibleReason || rule.reasonByCarrier[key]
    return
  }
  if (!appliesTo(key, rule)) return

  if (rule.ineligible) {
    state.eligible = false
    if (rule.reason) state.ineligibleReason = state.ineligibleReason || rule.reason
  }
  if (rule.weight != null) {
    state.weight += rule.weight
    if (rule.reason) state.reasons.push(rule.reason)
  } else if (rule.reason && !rule.ineligible) {
    state.reasons.push(rule.reason)
  }
}

function applyRules(
  rules: Rule[],
  inputs: RatingInputs,
  carrier: CarrierEntry,
  state: CarrierState,
  ctx: RuleContext = {}
): void {
  for (const rule of rules) {
    applyRule(rule, inputs, carrier, state, ctx)
  }
}

// ---------------------------------------------------------------------------
// Shared rules (all products)
// ---------------------------------------------------------------------------

const SHARED_WEIGHT_RULES: Rule[] = [
  {
    when: (i) => i.claimsHistory === 'none',
    weight: 0.4,
    reason: 'No recent claims — preferred markets favored.',
  },
  {
    when: (i) => i.claimsHistory === 'one',
    reason: 'One claim — most markets still open.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    weight: -0.4,
    reason: 'Multiple claims — tilt away from strict preferred markets.',
  },
  {
    when: (i) => Number(i.priorCarrierYears || 0) === 0,
    weight: -0.3,
    reason: 'No continuous insurance — some carriers less competitive.',
  },
  {
    when: (i) => Number(i.priorCarrierYears || 0) >= 3,
    weight: 0.3,
    reason: '3+ years continuous insurance — stability credit.',
  },
  {
    when: (i) => i.multiPolicy === 'yes',
    weight: 0.3,
    reason: 'Bundling opportunity — favor package-friendly carriers.',
  },
]

// ---------------------------------------------------------------------------
// Auto rules
// ---------------------------------------------------------------------------

const AUTO_INELIGIBILITY_RULES: Rule[] = [
  {
    when: (i) => i.continuousAuto === 'no',
    carriers: ['erieAuto'],
    ineligible: true,
    reason: 'Erie auto requires roughly 6+ months of continuous prior insurance for new business.',
  },
  {
    when: (i) => i.progressiveDeclined === 'yes',
    carriers: ['progressiveAuto'],
    ineligible: true,
    reason:
      'Applicant or a listed driver was previously declined, nonrenewed, or cancelled by Progressive for underwriting reasons — not acceptable per Progressive guidelines.',
  },
  {
    when: (i) => i.atFaultAccidents === '2plus',
    carriers: ['erieAuto'],
    ineligible: true,
    reason: 'More than one at-fault accident in recent years — outside standard Erie auto guidelines.',
  },
  {
    when: (i) => i.autoCompLosses === '4plus',
    carriers: ['erieAuto'],
    ineligible: true,
    reason: 'Four or more comprehensive losses in 5 years — outside typical Erie auto guidelines.',
  },
  {
    when: (i) => i.movingViolations === 'many_or_major',
    carriers: ['erieAuto'],
    ineligible: true,
    reason: 'Multiple / major moving violations — exceeds Erie auto violation thresholds.',
  },
  {
    when: (i) => i.vehicleType === 'modified_or_not_roadworthy',
    carriers: ['erieAuto'],
    ineligible: true,
    reason:
      'Modified / non-roadworthy / rebuild-in-progress vehicles are ineligible for Erie private passenger auto.',
  },
  {
    when: (i) => i.vehicleType === 'modified_or_not_roadworthy',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason:
      'Per WIM guidelines: customized, modified, midget, or kit cars are non-binding (Vehicle Non-Binding).',
  },
  {
    when: (i) => i.vehicleType === 'sports_performance',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason:
      'Per WIM guidelines: vehicle is on the Unacceptable/Restricted list (e.g. high-performance, sports cars).',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['erieAuto'],
    ineligible: true,
    reason: 'Erie auto appetite is limited for multiple-claim risks.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason: 'Wisconsin Mutual is stricter on UW; multiple claims typically ineligible.',
  },
  {
    when: (i) => i.continuousAuto === 'no',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason:
      'Per WIM guidelines: applicant operating an owned vehicle without insurance during past 12 months is non-binding.',
  },
  {
    when: (i) => i.movingViolations === 'many_or_major',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason:
      'Per WIM guidelines: a major violation within the past 5 years (OWI, suspended/revoked, reckless, etc.) is ineligible for binding.',
  },
  {
    when: (i) => i.atFaultAccidents === '2plus',
    carriers: ['wisconsinMutualAuto'],
    ineligible: true,
    reason:
      'Per WIM loss history: max 1 at-fault in past 3 years (damage <$6K); 2+ at-fault exceeds binding guidelines.',
  },
]

const AUTO_WEIGHT_RULES: Rule[] = [
  {
    when: (i) => i.continuousAuto === 'no',
    carriers: ['progressiveAuto'],
    weight: 0.2,
    reason:
      'No prior or lapse — Progressive may still accept; up to 31 days lapse counts as prior. Prior insurance discount may not apply.',
  },
  {
    when: (i) => i.atFaultAccidents === '1',
    carriers: ['erieAuto'],
    reason: 'One at-fault accident — may be acceptable for Erie if otherwise clean; watch other negatives.',
  },
  {
    when: (i) => i.atFaultAccidents === '2plus',
    carriers: ['progressiveAuto'],
    weight: 0.2,
    reason: 'Multiple at-fault accidents — Progressive may still consider non-standard auto.',
  },
  {
    when: (i) => i.movingViolations === 'few_minor',
    reason: 'Some minor violations — most markets still in play.',
  },
  {
    when: (i) => i.movingViolations === 'many_or_major',
    carriers: ['progressiveAuto'],
    weight: 0.2,
    reason:
      'Multiple / major violations — Progressive rates on violations (35/59 mo) rather than hard-declining; expect surcharges.',
  },
  {
    when: (i) => i.annualMileage === '>25000',
    carriers: ['erieAuto'],
    weight: -0.3,
    reason: 'Very high annual mileage — Erie guidelines flag >25,000 miles as a concern.',
  },
  {
    when: (i) => i.vehicleUse === 'tnc',
    carriers: ['progressiveAuto'],
    reason:
      'Rideshare/delivery — Progressive allows with Rideshare Insurance endorsement; ensure proper TNC coverage.',
  },
  {
    when: (i) => i.vehicleUse === 'business',
    carriers: ['progressiveAuto'],
    reason: 'Business use (e.g. sales, real estate, agent) — acceptable per Progressive; may be surcharged.',
  },
  {
    when: (i) => i.vehicleType === 'sports_or_perf',
    carriers: ['erieAuto'],
    weight: -0.2,
    reason: 'Sports / performance vehicle — may require positive factors for Erie.',
  },
  {
    when: (i) => (i.age ?? 0) > 0 && (i.age ?? 0) < 22,
    carriers: ['progressiveAuto'],
    weight: 0.2,
    reason: 'Youthful driver — Progressive often competitive here.',
  },
  {
    when: (i) => (i.age ?? 0) > 0 && (i.age ?? 0) < 22,
    carriers: ['erieAuto'],
    weight: -0.2,
    reason: 'Youthful driver — Erie prefers cleaner profiles.',
  },
  {
    when: (i) => (i.age ?? 0) > 0 && (i.age ?? 0) < 22,
    carriers: ['wisconsinMutualAuto', 'foremostAuto', 'libertyAuto', 'donegalAuto', 'grinnellAuto', 'dairylandAuto'],
    weight: -0.1,
    reason: 'Youthful driver — most carriers less competitive.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['progressiveAuto'],
    weight: 0.2,
    reason: 'Multiple claims — Progressive more tolerant of non-standard auto.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['erieAuto'],
    weight: -0.1,
    reason: null,
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['foremostAuto'],
    weight: 0.5,
    reason: 'High-risk profile — Foremost is best for non-standard auto.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['dairylandAuto'],
    weight: 0.6,
    reason: "Very high-risk — Dairyland is agency's best option for difficult auto.",
  },
  {
    when: (i) => {
      const highRisk =
        i.continuousAuto === 'no' ||
        i.movingViolations === 'many_or_major' ||
        i.atFaultAccidents === '2plus'
      return highRisk && i.claimsHistory !== 'multiple'
    },
    carriers: ['foremostAuto'],
    weight: 0.4,
    reason: 'Non-standard factors — Foremost competitive for high-risk auto.',
  },
  {
    when: (i) => {
      return (
        (i.continuousAuto === 'no' &&
          (i.movingViolations === 'many_or_major' || i.atFaultAccidents === '2plus')) ||
        (i.claimsHistory === 'one' && i.movingViolations === 'many_or_major')
      )
    },
    carriers: ['dairylandAuto'],
    weight: 0.5,
    reason:
      'Very high-risk combo — Dairyland is best option when others decline or are uncompetitive.',
  },
]

// ---------------------------------------------------------------------------
// Home rules (reason-by-carrier maps + rule arrays; roof logic uses ctx)
// ---------------------------------------------------------------------------

const HOME_NON_OWNER_OCCUPANCY: Record<string, string> = {
  erieHome: 'ErieSecure Home is intended for owner-occupied primary/secondary dwellings.',
  progressiveHome:
    'Progressive HO3 requires owner-occupied primary/secondary residence with no rental exposure.',
  wisconsinMutualHome: 'Per WIM guidelines: non-owner occupied or vacant residence is ineligible.',
  travellersHome:
    'Per Travelers guidelines: risk is not eligible if vacant, unoccupied, for sale, or non-owner-occupied (HO-2/HO-3 for owner-occupant).',
  libertyHome:
    'Per Safeco Eligibility Guide: buildings that are vacant or unoccupied, house for sale, or risks rented/held for rental (other than private residential or in excess of 6 months per year) are ineligible. Primary must be owner-occupied at least 6 months/year.',
}

const HOME_DOG_RESTRICTED: Record<string, string> = {
  erieHome: 'Restricted dog breed or prior bite history — not eligible under Erie guidelines.',
  progressiveHome:
    'Restricted dog breed or prior bite history — not eligible under Progressive HO3 guidelines.',
  travellersHome:
    'Per Travelers guidelines: vicious/bite-history animals or restricted breeds (e.g. Akita, Alaskan Malamute, Am Staff, Bullmastiff, Chow, Doberman, Great Dane, Pit Bull, Presa Canario, Rottweiler, Siberian Husky, Staffordshire Bull Terrier, Wolf Hybrid, or mix) are not eligible.',
  libertyHome:
    'Per Safeco Eligibility Guide: restricted breeds (e.g. Akita, Am Bull Terrier, Staffordshire Bull Terrier, Chow, Doberman, Dogo Argentino, German Shepherd, Pit Bull, Presa Canario, Rottweiler, Wolf hybrid, Husky, Mastiff) or vicious/aggressive history are ineligible unless additional considerations are met (e.g. 6-ft fence, AKC Canine Good Citizen). Exception for registered service animals.',
}

const HOME_HAZARD_FLAG: Record<string, string> = {
  erieHome:
    'Hazardous premises exposures (unfenced pool, trampoline, debris, etc.) — not eligible for Erie home.',
  progressiveHome:
    'Hazardous premises exposures / debris — not eligible for Progressive HO3 homeowners.',
  travellersHome:
    'Per Travelers guidelines: attractive nuisance exposures (unfenced in-ground pool, trampolines, skateboard ramps, bicycle jumps, etc.) are not eligible.',
  libertyHome:
    'Per Safeco Eligibility Guide: nuisance/hazard exposures (unfenced or unprotected in-ground pool, skateboard ramp, above-ground trampoline without safety netting, unrepaired damages, uncorrected code violations) are ineligible.',
}

const HOME_INELIGIBILITY_RULES: Rule[] = [
  {
    when: (i) =>
      i.occupancy === 'rental_or_airbnb' || i.occupancy === 'vacant_or_other',
    reasonByCarrier: HOME_NON_OWNER_OCCUPANCY,
    ineligible: true,
  },
  {
    when: (i) => i.dogRisk === 'restricted',
    reasonByCarrier: HOME_DOG_RESTRICTED,
    ineligible: true,
  },
  {
    when: (i) => !!i.hazardFlag,
    reasonByCarrier: HOME_HAZARD_FLAG,
    ineligible: true,
  },
  {
    when: (i) => !!i.oldSystemsFlag,
    carriers: ['libertyHome'],
    ineligible: true,
    reason:
      'Per Safeco Eligibility Guide: dwelling and all major systems (plumbing, heating, electrical, roof) must be in good condition with no unreported conditions or uncorrected fire or building code violations.',
  },
  {
    when: (i) => i.priorCarrierYears === '0' && i.firstTimeBuyer !== 'yes',
    carriers: ['progressiveHome'],
    ineligible: true,
    reason:
      'No prior voluntary homeowners coverage — Progressive HO3 requires prior insurance except for first-time buyers.',
  },
  {
    when: (i) => i.progressiveAuto !== 'yes',
    carriers: ['progressiveHome'],
    ineligible: true,
    reason: 'Progressive HO3 program requires an in-force Progressive auto policy.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['erieHome'],
    ineligible: true,
    reason: 'Erie home appetite is limited for multiple-claim property risks.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['progressiveHome'],
    ineligible: true,
    reason:
      'Two or more property claims in recent years — outside Progressive HO3 prior loss guidelines.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['travellersHome'],
    ineligible: true,
    reason:
      'Per Travelers guidelines: more than 3 losses in past 5 years or more than 2 in past 3 years (excluding closed without payment) is not eligible.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason:
      'Per WIM guidelines: more than one wind/hail in 5 years or non-weather loss in 3 years is non-binding; multiple claims ineligible.',
  },
  {
    when: (i) => i.priorCarrierYears === '0' && i.firstTimeBuyer !== 'yes',
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason:
      'Per WIM guidelines: canceled/rejected/non-renewed within past 3 years is non-binding; no prior coverage requires UW review.',
  },
  {
    when: (i) => i.dogRisk === 'restricted',
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason:
      'Per WIM guidelines: Pit Bulls, Am Staff, Rottweilers, Dobermans, Chows, wolf hybrids, or dogs with bite/vicious act history are ineligible.',
  },
  {
    when: (i) => !!i.hazardFlag,
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason:
      'Per WIM guidelines: swimming pool without fence or with diving board/slide, or other hazardous premises, is ineligible.',
  },
  {
    when: (i, ctx) => {
      const roofMat = ctx?.roofMat || 'asphalt_arch'
      return roofMat === 'wood_shake' || roofMat === 'rolled_tar'
    },
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason:
      'Per WIM guidelines: wood shake, clay tile, asbestos, or interlocking asphalt roofing materials are non-binding.',
  },
  {
    when: (i, ctx) => (ctx?.roofAge || 0) > 20,
    carriers: ['wisconsinMutualHome'],
    ineligible: true,
    reason: 'Per WIM guidelines: roofs over 20 years old are ineligible.',
  },
]

// Roof rules use ctx.roofMat and ctx.roofAge
const HOME_ROOF_RULES: Rule[] = [
  {
    when: (i, ctx) => {
      const m = ctx?.roofMat || 'asphalt_arch'
      return m === 'wood_shake' || m === 'rolled_tar'
    },
    carriers: ['erieHome'],
    ineligible: true,
    reason:
      'Wood shake / rolled or tar & gravel roofs are generally ineligible for ErieSecure Home.',
  },
  {
    when: (i, ctx) => (ctx?.roofMat === 'asphalt_arch' && (ctx?.roofAge || 0) >= 20),
    carriers: ['erieHome'],
    ineligible: true,
    reason:
      'Architectural shingle roof ≥ 20 years — Erie guidelines require underwriting approval; treat as not eligible here.',
  },
  {
    when: (i, ctx) => (ctx?.roofMat === 'asphalt_3tab' && (ctx?.roofAge || 0) >= 10),
    carriers: ['erieHome'],
    ineligible: true,
    reason:
      '3-tab shingle roof ≥ 10 years — Erie guidelines require underwriting approval; treat as not eligible here.',
  },
  {
    when: (i, ctx) => (ctx?.roofMat === 'metal_or_slate' && (ctx?.roofAge || 0) >= 50),
    carriers: ['erieHome'],
    ineligible: true,
    reason:
      'Metal / slate / tile roof ≥ 50 years — Erie guidelines require underwriting approval; treat as not eligible here.',
  },
  {
    when: (i, ctx) => (ctx?.roofMat === 'flat_membrane' && (ctx?.roofAge || 0) >= 10),
    carriers: ['erieHome'],
    ineligible: true,
    reason:
      'Flat roof ≥ 10 years — Erie guidelines require underwriting approval; treat as not eligible here.',
  },
  {
    when: (i, ctx) => {
      const m = ctx?.roofMat || ''
      return m === 'wood_shake' || m === 'rolled_tar'
    },
    carriers: ['progressiveHome'],
    ineligible: true,
    reason: 'Roof material type is listed as ineligible under Progressive HO3 guidelines.',
  },
  {
    when: (i, ctx) => {
      const m = ctx?.roofMat
      const age = ctx?.roofAge || 0
      return (
        (m === 'asphalt_arch' || m === 'asphalt_3tab' || m === 'metal_or_slate') && age > 25
      )
    },
    carriers: ['progressiveHome'],
    ineligible: true,
    reason:
      'Roof age exceeds Progressive HO3 roof age limits (generally 25 years for most materials).',
  },
  {
    when: (i, ctx) => {
      const m = ctx?.roofMat
      const age = ctx?.roofAge || 0
      return (
        (m === 'asphalt_arch' || m === 'asphalt_3tab' || m === 'metal_or_slate') &&
        age >= 21 &&
        age <= 25
      )
    },
    carriers: ['progressiveHome'],
    weight: -0.2,
    reason:
      'Roof age 21–25 years — near Progressive 25-year age cap; expect closer underwriting review.',
  },
  {
    when: (i, ctx) => ctx?.roofMat === 'flat_membrane' && (ctx?.roofAge || 0) > 15,
    carriers: ['progressiveHome'],
    ineligible: true,
    reason:
      'Flat roof older than roughly 2010–2012 equivalent — outside Progressive HO3 flat roof guidelines.',
  },
  {
    when: (i, ctx) => {
      const tileOrLifetime = ctx?.roofMat === 'metal_or_slate'
      const now = new Date()
      const feb15 = new Date(now.getFullYear(), 1, 15)
      const useStrict = now < feb15
      const age = ctx?.roofAge || 0
      if (tileOrLifetime) return false
      return useStrict && age > 15
    },
    carriers: ['travellersHome'],
    ineligible: true,
    reason:
      'Per Travelers: this period only roofs 15 years or newer are considered; 2/15 is the first day to write a 20-year-old roof.',
  },
  {
    when: (i, ctx) => {
      const tileOrLifetime = ctx?.roofMat === 'metal_or_slate'
      const now = new Date()
      const feb15 = new Date(now.getFullYear(), 1, 15)
      const useStrict = now < feb15
      const age = ctx?.roofAge || 0
      if (tileOrLifetime) return false
      return !useStrict && age > 20
    },
    carriers: ['travellersHome'],
    ineligible: true,
    reason:
      'Per Travelers: roofs over 20 years require inspection or UW review — not eligible here; only roofs 20 years or newer (no inspection/review) are eligible.',
  },
  {
    when: (i, ctx) => ctx?.roofMat === 'wood_shake',
    carriers: ['libertyHome'],
    ineligible: true,
    reason: 'Per Safeco Eligibility Guide: wood roofs of all ages are ineligible.',
  },
  {
    when: (i, ctx) =>
      ctx?.roofMat === 'metal_or_slate' && (ctx?.roofAge || 0) > 65,
    carriers: ['libertyHome'],
    ineligible: true,
    reason:
      'Per Safeco Eligibility Guide: metal, slate or tile roofs older than 65 years are ineligible.',
  },
  {
    when: (i, ctx) =>
      ctx?.roofMat !== 'metal_or_slate' &&
      ctx?.roofMat !== 'wood_shake' &&
      (ctx?.roofAge || 0) > 20,
    carriers: ['libertyHome'],
    ineligible: true,
    reason:
      'Per Safeco Eligibility Guide: all other roofs older than 20 years are ineligible.',
  },
]

const HOME_WEIGHT_RULES: Rule[] = [
  {
    when: (i) => i.dwellingValueBand === '>1500k',
    carriers: ['erieHome'],
    reason:
      'Dwelling value over $1.5M — Erie requires underwriting approval prior to binding.',
  },
  {
    when: (i) =>
      i.dwellingValueBand === '1000-1500k' || i.dwellingValueBand === '>1500k',
    carriers: ['progressiveHome'],
    weight: -0.1,
    reason:
      'Coverage A likely over Progressive $750k review threshold — expect underwriting review.',
  },
  {
    when: (i) =>
      i.dwellingValueBand === '1000-1500k' || i.dwellingValueBand === '>1500k',
    carriers: ['travellersHome'],
    weight: -0.1,
    reason:
      'Per Travelers guidelines: dwelling with Coverage A of $1,000,000 or greater requires a monitored central station fire and burglar alarm system to be eligible.',
  },
  {
    when: (i) => !!i.oldSystemsFlag,
    carriers: ['erieHome'],
    weight: -0.3,
    reason:
      'Older electrical/plumbing/heating — Erie may require updates or is less competitive.',
  },
  {
    when: (i) => !!i.oldSystemsFlag,
    carriers: ['progressiveHome'],
    weight: -0.3,
    reason:
      'Older electrical/plumbing/heating — Progressive guidelines require updated major systems.',
  },
  {
    when: (i) => !!i.oldSystemsFlag,
    carriers: ['travellersHome'],
    weight: -0.2,
    reason:
      'Per Travelers guidelines: dwelling and all systems (plumbing, heating, electrical, roof) must be in good condition with no unrepaired conditions or code violations.',
  },
  {
    when: (i) => i.priorCarrierYears === '0' && i.firstTimeBuyer === 'yes',
    carriers: ['progressiveHome'],
    reason: 'First-time home buyer — Progressive HO3 allows no prior coverage for new home purchases.',
  },
  {
    when: (i) => i.multiPolicy === 'yes',
    carriers: ['erieHome'],
    weight: 0.3,
    reason: 'Good package opportunity — Erie often strong on auto/home bundle.',
  },
  {
    when: (i) => i.multiPolicy === 'yes' && i.progressiveAuto === 'yes',
    carriers: ['progressiveHome'],
    weight: 0.3,
    reason: 'Progressive auto + HO3 package — stronger appetite for bundled business.',
  },
  {
    when: (i) => i.claimsHistory === 'multiple',
    carriers: ['libertyHome'],
    weight: -0.2,
    reason:
      'Per Safeco Eligibility Guide: more than 1 loss in prior 5 years — refer to underwriting. All losses in prior 5 years are subject to underwriting review.',
  },
  {
    when: (i) => i.claimsHistory === 'one',
    carriers: ['libertyHome'],
    weight: -0.05,
    reason:
      'Per Safeco Eligibility Guide: all losses in the prior 5 years are subject to underwriting review.',
  },
  {
    when: (i) => i.multiPolicy === 'yes',
    carriers: ['libertyHome'],
    reason:
      'Safeco offers Multi-Policy Discount when customer holds Auto or Umbrella with Safeco.',
  },
  {
    when: (i) =>
      ['500-1000k', '1000-1500k', '>1500k'].includes(i.dwellingValueBand || ''),
    carriers: ['libertyHome'],
    reason:
      'Safeco Premier coverage level (dwelling $500K+) may be available. Cov A >$1M in Protection Class 10 or >$3M in PC 9 may have additional requirements.',
  },
  {
    when: (i, ctx) => {
      if (!ctx?.eligible) return false
      return (
        i.claimsHistory === 'multiple' ||
        (i.priorCarrierYears === '0' && i.firstTimeBuyer !== 'yes') ||
        !!i.hazardFlag ||
        !!i.oldSystemsFlag
      )
    },
    carriers: ['foremostHome'],
    weight: 0.5,
    reason: 'High-risk home profile — Foremost is best for non-standard homeowners.',
  },
  {
    when: (i, ctx) => {
      if (!ctx?.eligible) return false
      return (
        (i.claimsHistory === 'multiple' && i.priorCarrierYears === '0') ||
        (i.claimsHistory === 'multiple' && (!!i.hazardFlag || !!i.oldSystemsFlag))
      )
    },
    carriers: ['dairylandHome'],
    weight: 0.6,
    reason:
      'Very high-risk home — Dairyland is best option when other markets decline or are uncompetitive.',
  },
]

// ---------------------------------------------------------------------------
// Commercial rules
// ---------------------------------------------------------------------------

const COMMERCIAL_WEIGHT_RULES: Rule[] = [
  {
    when: () => true,
    carriers: ['travellersComm'],
    weight: 0.2,
    reason: 'Travelers has strong small commercial/BOP presence.',
  },
  {
    when: () => true,
    carriers: ['grinnellComm', 'donegalComm'],
    reason: 'Very competitive on commercial — strong option for BOP/small commercial at this agency.',
  },
  {
    when: (i) => Number(i.priorCarrierYears || 0) >= 3 && i.claimsHistory !== 'multiple',
    weight: 0.1,
    reason: 'Stable small commercial risk — most markets comfortable.',
  },
]

const COMMERCIAL_INELIGIBILITY_RULES: Rule[] = [
  {
    when: (i) =>
      Number(i.priorCarrierYears || 0) === 0 && i.claimsHistory === 'multiple',
    carriers: ['erieComm'],
    ineligible: true,
    reason:
      'Zero prior insurance with multiple claims — Erie commercial appetite likely limited.',
  },
]

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function calculateCarrierSuggestions(inputs: RatingInputs): SuggestionResult {
  const productKey = inputs.productType || 'auto'
  const config = CARRIER_CONFIG[productKey as keyof typeof CARRIER_CONFIG] || []
  const explanations: CarrierExplanation[] = []

  const scored: CarrierResult[] = config.map((carrier) => {
    const state: CarrierState = {
      weight: carrier.baseWeight,
      reasons: [],
      eligible: true,
      ineligibleReason: '',
    }

    applyRules(SHARED_WEIGHT_RULES, inputs, carrier, state)

    if (productKey === 'auto') {
      applyRules(AUTO_INELIGIBILITY_RULES, inputs, carrier, state)
      applyRules(AUTO_WEIGHT_RULES, inputs, carrier, state)
    }

    if (productKey === 'home') {
      const ctx: RuleContext = {
        roofMat: inputs.roofMaterial || 'asphalt_arch',
        roofAge: Number(inputs.roofAgeYears || 0),
      }
      applyRules(HOME_INELIGIBILITY_RULES, inputs, carrier, state, ctx)
      applyRules(HOME_ROOF_RULES, inputs, carrier, state, ctx)
      applyRules(HOME_WEIGHT_RULES, inputs, carrier, state, ctx)
    }

    if (productKey === 'commercial') {
      applyRules(COMMERCIAL_WEIGHT_RULES, inputs, carrier, state)
      applyRules(COMMERCIAL_INELIGIBILITY_RULES, inputs, carrier, state)
    }

    explanations.push({
      carrier: carrier.name,
      reasons: state.reasons,
      eligible: state.eligible,
      ineligibleReason: state.ineligibleReason,
    })

    return {
      ...carrier,
      weight: state.weight,
      eligible: state.eligible,
      ineligibleReason: state.ineligibleReason,
    }
  })

  scored.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
    return b.weight - a.weight
  })

  return { productKey, carriers: scored, explanations }
}
