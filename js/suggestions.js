/**
 * Carrier suggestion engine: eligibility and weight by product (auto, home, commercial).
 * Uses CARRIER_CONFIG and applies shared + carrier-specific UW-style rules.
 */
import { CARRIER_CONFIG } from './carrierConfig.js';

export function calculateCarrierSuggestions(inputs) {
  const productKey = inputs.productType || 'auto';
  const config = CARRIER_CONFIG[productKey] || [];

  const explanations = [];

  const scored = config.map((carrier) => {
    let weight = carrier.baseWeight;
    const reasons = [];
    let eligible = true;
    let ineligibleReason = '';

    if (inputs.claimsHistory === 'none') {
      weight += 0.4;
      reasons.push('No recent claims – preferred markets favored.');
    } else if (inputs.claimsHistory === 'one') {
      reasons.push('One claim – most markets still open.');
    } else {
      weight -= 0.4;
      reasons.push('Multiple claims – tilt away from strict preferred markets.');
    }

    const priorYears = Number(inputs.priorCarrierYears || 0);
    if (priorYears === 0) {
      weight -= 0.3;
      reasons.push('No continuous insurance – some carriers less competitive.');
    } else if (priorYears >= 3) {
      weight += 0.3;
      reasons.push('3+ years continuous insurance – stability credit.');
    }

    if (inputs.multiPolicy === 'yes') {
      weight += 0.3;
      reasons.push('Bundling opportunity – favor package-friendly carriers.');
    }

    if (productKey === 'auto') {
      if (inputs.continuousAuto === 'no') {
        if (carrier.key === 'erieAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Erie auto requires roughly 6+ months of continuous prior insurance for new business.';
        } else if (carrier.key === 'progressiveAuto') {
          weight += 0.2;
          reasons.push(
            'No prior or lapse – Progressive may still accept; up to 31 days lapse counts as prior. Prior insurance discount may not apply.'
          );
        }
      }

      if (carrier.key === 'progressiveAuto' && inputs.progressiveDeclined === 'yes') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Applicant or a listed driver was previously declined, nonrenewed, or cancelled by Progressive for underwriting reasons – not acceptable per Progressive guidelines.';
      }

      if (inputs.atFaultAccidents === '1') {
        if (carrier.key === 'erieAuto') {
          reasons.push(
            'One at-fault accident – may be acceptable for Erie if otherwise clean; watch other negatives.',
          );
        }
      } else if (inputs.atFaultAccidents === '2plus') {
        if (carrier.key === 'erieAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'More than one at-fault accident in recent years – outside standard Erie auto guidelines.';
        }
        if (carrier.key === 'progressiveAuto') {
          weight += 0.2;
          reasons.push('Multiple at-fault accidents – Progressive may still consider non‑standard auto.');
        }
      }

      if (inputs.autoCompLosses === '4plus' && carrier.key === 'erieAuto') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Four or more comprehensive losses in 5 years – outside typical Erie auto guidelines.';
      }

      if (inputs.movingViolations === 'few_minor') {
        reasons.push('Some minor violations – most markets still in play.');
      } else if (inputs.movingViolations === 'many_or_major') {
        if (carrier.key === 'erieAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Multiple / major moving violations – exceeds Erie auto violation thresholds.';
        } else if (carrier.key === 'progressiveAuto') {
          weight += 0.2;
          reasons.push(
            'Multiple / major violations – Progressive rates on violations (35/59 mo) rather than hard-declining; expect surcharges.'
          );
        }
      }

      if (inputs.annualMileage === '>25000') {
        if (carrier.key === 'erieAuto') {
          weight -= 0.3;
          reasons.push('Very high annual mileage – Erie guidelines flag >25,000 miles as a concern.');
        }
      }

      if (inputs.vehicleUse === 'tnc' && carrier.key === 'progressiveAuto') {
        reasons.push(
          'Rideshare/delivery – Progressive allows with Rideshare Insurance endorsement; ensure proper TNC coverage.'
        );
      }
      if (inputs.vehicleUse === 'business' && carrier.key === 'progressiveAuto') {
        reasons.push('Business use (e.g. sales, real estate, agent) – acceptable per Progressive; may be surcharged.');
      }

      if (inputs.vehicleType === 'sports_or_perf') {
        if (carrier.key === 'erieAuto') {
          reasons.push('Sports / performance vehicle – may require positive factors for Erie.');
          weight -= 0.2;
        }
      } else if (inputs.vehicleType === 'modified_or_not_roadworthy') {
        if (carrier.key === 'erieAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Modified / non‑roadworthy / rebuild‑in‑progress vehicles are ineligible for Erie private passenger auto.';
        }
        if (carrier.key === 'wisconsinMutualAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Per WIM guidelines: customized, modified, midget, or kit cars are non-binding (Vehicle Non-Binding).';
        }
      } else if (inputs.vehicleType === 'sports_performance') {
        if (carrier.key === 'wisconsinMutualAuto') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Per WIM guidelines: vehicle is on the Unacceptable/Restricted list (e.g. high-performance, sports cars).';
        }
      }

      if (inputs.age > 0 && inputs.age < 22) {
        if (carrier.key === 'progressiveAuto') {
          weight += 0.2;
          reasons.push('Youthful driver – Progressive often competitive here.');
        } else if (carrier.key === 'erieAuto') {
          weight -= 0.2;
          reasons.push('Youthful driver – Erie prefers cleaner profiles.');
        } else {
          weight -= 0.1;
        }
      }

      if (inputs.claimsHistory === 'multiple') {
        if (carrier.key === 'progressiveAuto') {
          weight += 0.2;
          reasons.push('Multiple claims – Progressive more tolerant of non‑standard auto.');
        } else if (carrier.key === 'erieAuto') {
          weight -= 0.1;
          eligible = false;
          ineligibleReason = 'Erie auto appetite is limited for multiple-claim risks.';
        } else if (carrier.key === 'wisconsinMutualAuto') {
          eligible = false;
          ineligibleReason = 'Wisconsin Mutual is stricter on UW; multiple claims typically ineligible.';
        } else if (carrier.key === 'foremostAuto') {
          weight += 0.5;
          reasons.push('High-risk profile – Foremost is best for non-standard auto.');
        } else if (carrier.key === 'dairylandAuto') {
          weight += 0.6;
          reasons.push('Very high-risk – Dairyland is agency\'s best option for difficult auto.');
        }
      }

      if (carrier.key === 'wisconsinMutualAuto') {
        if (inputs.continuousAuto === 'no') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: applicant operating an owned vehicle without insurance during past 12 months is non-binding.';
        }
        if (inputs.movingViolations === 'many_or_major') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: a major violation within the past 5 years (OWI, suspended/revoked, reckless, etc.) is ineligible for binding.';
        }
        if (inputs.atFaultAccidents === '2plus') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM loss history: max 1 at-fault in past 3 years (damage <$6K); 2+ at-fault exceeds binding guidelines.';
        }
      }

      if (carrier.key === 'foremostAuto' && eligible) {
        const highRisk =
          inputs.continuousAuto === 'no' ||
          inputs.movingViolations === 'many_or_major' ||
          inputs.atFaultAccidents === '2plus';
        if (highRisk && inputs.claimsHistory !== 'multiple') {
          weight += 0.4;
          reasons.push('Non-standard factors – Foremost competitive for high-risk auto.');
        }
      }

      if (carrier.key === 'dairylandAuto' && eligible) {
        const veryHighRisk =
          (inputs.continuousAuto === 'no' && (inputs.movingViolations === 'many_or_major' || inputs.atFaultAccidents === '2plus')) ||
          (inputs.claimsHistory === 'one' && inputs.movingViolations === 'many_or_major');
        if (veryHighRisk) {
          weight += 0.5;
          reasons.push('Very high-risk combo – Dairyland is best option when others decline or are uncompetitive.');
        }
      }
    }

    if (productKey === 'home') {
      const roofMat = inputs.roofMaterial || 'asphalt_arch';
      const roofAge = Number(inputs.roofAgeYears || 0);

      if (
        inputs.occupancy === 'rental_or_airbnb' ||
        inputs.occupancy === 'vacant_or_other'
      ) {
        if (carrier.key === 'erieHome') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'ErieSecure Home is intended for owner-occupied primary/secondary dwellings.';
        }
        if (carrier.key === 'progressiveHome') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Progressive HO3 requires owner-occupied primary/secondary residence with no rental exposure.';
        }
        if (carrier.key === 'wisconsinMutualHome') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Per WIM guidelines: non-owner occupied or vacant residence is ineligible.';
        }
        if (carrier.key === 'travellersHome') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Per Travelers guidelines: risk is not eligible if vacant, unoccupied, for sale, or non-owner-occupied (HO-2/HO-3 for owner-occupant).';
        }
        if (carrier.key === 'libertyHome') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Per Safeco Eligibility Guide: buildings that are vacant or unoccupied, house for sale, or risks rented/held for rental (other than private residential or in excess of 6 months per year) are ineligible. Primary must be owner-occupied at least 6 months/year.';
        }
      }

      if (inputs.dwellingValueBand === '>1500k' && carrier.key === 'erieHome') {
        reasons.push(
          'Dwelling value over $1.5M – Erie requires underwriting approval prior to binding.'
        );
      }

      if ((inputs.dwellingValueBand === '1000-1500k' || inputs.dwellingValueBand === '>1500k') && carrier.key === 'progressiveHome') {
        reasons.push(
          'Coverage A likely over Progressive $750k review threshold – expect underwriting review.'
        );
        weight -= 0.1;
      }

      if ((inputs.dwellingValueBand === '1000-1500k' || inputs.dwellingValueBand === '>1500k') && carrier.key === 'travellersHome') {
        reasons.push(
          'Per Travelers guidelines: dwelling with Coverage A of $1,000,000 or greater requires a monitored central station fire and burglar alarm system to be eligible.'
        );
        weight -= 0.1;
      }

      if (inputs.dogRisk === 'restricted' && carrier.key === 'erieHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Restricted dog breed or prior bite history – not eligible under Erie guidelines.';
      }

      if (inputs.dogRisk === 'restricted' && carrier.key === 'progressiveHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Restricted dog breed or prior bite history – not eligible under Progressive HO3 guidelines.';
      }

      if (inputs.dogRisk === 'restricted' && carrier.key === 'travellersHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Travelers guidelines: vicious/bite-history animals or restricted breeds (e.g. Akita, Alaskan Malamute, Am Staff, Bullmastiff, Chow, Doberman, Great Dane, Pit Bull, Presa Canario, Rottweiler, Siberian Husky, Staffordshire Bull Terrier, Wolf Hybrid, or mix) are not eligible.';
      }

      if (inputs.dogRisk === 'restricted' && carrier.key === 'libertyHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Safeco Eligibility Guide: restricted breeds (e.g. Akita, Am Bull Terrier, Staffordshire Bull Terrier, Chow, Doberman, Dogo Argentino, German Shepherd, Pit Bull, Presa Canario, Rottweiler, Wolf hybrid, Husky, Mastiff) or vicious/aggressive history are ineligible unless additional considerations are met (e.g. 6-ft fence, AKC Canine Good Citizen). Exception for registered service animals.';
      }

      if (inputs.hazardFlag && carrier.key === 'erieHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Hazardous premises exposures (unfenced pool, trampoline, debris, etc.) – not eligible for Erie home.';
      }

      if (inputs.hazardFlag && carrier.key === 'progressiveHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Hazardous premises exposures / debris – not eligible for Progressive HO3 homeowners.';
      }

      if (inputs.hazardFlag && carrier.key === 'travellersHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Travelers guidelines: attractive nuisance exposures (unfenced in-ground pool, trampolines, skateboard ramps, bicycle jumps, etc.) are not eligible.';
      }

      if (inputs.hazardFlag && carrier.key === 'libertyHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Safeco Eligibility Guide: nuisance/hazard exposures (unfenced or unprotected in-ground pool, skateboard ramp, above-ground trampoline without safety netting, unrepaired damages, uncorrected code violations) are ineligible.';
      }

      if (inputs.oldSystemsFlag && carrier.key === 'erieHome') {
        weight -= 0.3;
        reasons.push(
          'Older electrical/plumbing/heating – Erie may require updates or is less competitive.'
        );
      }

      if (inputs.oldSystemsFlag && carrier.key === 'progressiveHome') {
        weight -= 0.3;
        reasons.push(
          'Older electrical/plumbing/heating – Progressive guidelines require updated major systems.'
        );
      }

      if (inputs.oldSystemsFlag && carrier.key === 'travellersHome') {
        weight -= 0.2;
        reasons.push(
          'Per Travelers guidelines: dwelling and all systems (plumbing, heating, electrical, roof) must be in good condition with no unrepaired conditions or code violations.'
        );
      }

      if (inputs.oldSystemsFlag && carrier.key === 'libertyHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Safeco Eligibility Guide: dwelling and all major systems (plumbing, heating, electrical, roof) must be in good condition with no unreported conditions or uncorrected fire or building code violations.';
      }

      if (carrier.key === 'erieHome') {
        if (roofMat === 'wood_shake' || roofMat === 'rolled_tar') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Wood shake / rolled or tar & gravel roofs are generally ineligible for ErieSecure Home.';
        } else if (roofMat === 'asphalt_arch' && roofAge >= 20) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Architectural shingle roof ≥ 20 years – Erie guidelines require underwriting approval; treat as not eligible here.';
        } else if (roofMat === 'asphalt_3tab' && roofAge >= 10) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            '3-tab shingle roof ≥ 10 years – Erie guidelines require underwriting approval; treat as not eligible here.';
        } else if (roofMat === 'metal_or_slate' && roofAge >= 50) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Metal / slate / tile roof ≥ 50 years – Erie guidelines require underwriting approval; treat as not eligible here.';
        } else if (roofMat === 'flat_membrane' && roofAge >= 10) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Flat roof ≥ 10 years – Erie guidelines require underwriting approval; treat as not eligible here.';
        }
      }

      if (carrier.key === 'progressiveHome') {
        if (roofMat === 'wood_shake' || roofMat === 'rolled_tar') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Roof material type is listed as ineligible under Progressive HO3 guidelines.';
        } else if (
          (roofMat === 'asphalt_arch' || roofMat === 'asphalt_3tab' || roofMat === 'metal_or_slate') &&
          roofAge > 25
        ) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Roof age exceeds Progressive HO3 roof age limits (generally 25 years for most materials).';
        } else if (
          (roofMat === 'asphalt_arch' || roofMat === 'asphalt_3tab' || roofMat === 'metal_or_slate') &&
          roofAge >= 21 &&
          roofAge <= 25
        ) {
          weight -= 0.2;
          reasons.push(
            'Roof age 21–25 years – near Progressive 25-year age cap; expect closer underwriting review.',
          );
        } else if (roofMat === 'flat_membrane' && roofAge > 15) {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Flat roof older than roughly 2010–2012 equivalent – outside Progressive HO3 flat roof guidelines.';
        }
      }

      if (carrier.key === 'travellersHome') {
        const tileOrLifetime = roofMat === 'metal_or_slate';
        const now = new Date();
        const feb15ThisYear = new Date(now.getFullYear(), 1, 15);
        const useStrictRoofRule = now < feb15ThisYear; // Until 2/15 only roofs 15 years or newer; 2/15 is first day to write 20-year-old roof
        if (tileOrLifetime) {
          // Tile/lifetime materials – no change by date
        } else if (useStrictRoofRule) {
          if (roofAge > 15) {
            eligible = false;
            ineligibleReason =
              ineligibleReason ||
              'Per Travelers: this period only roofs 15 years or newer are considered; 2/15 is the first day to write a 20-year-old roof.';
          }
        } else {
          if (roofAge > 20) {
            eligible = false;
            ineligibleReason =
              ineligibleReason ||
              'Per Travelers: roofs over 20 years require inspection or UW review – not eligible here; only roofs 20 years or newer (no inspection/review) are eligible.';
          }
        }
      }

      if (carrier.key === 'progressiveHome') {
        if (inputs.priorCarrierYears === '0' && inputs.firstTimeBuyer !== 'yes') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'No prior voluntary homeowners coverage – Progressive HO3 requires prior insurance except for first-time buyers.';
        }
        if (inputs.priorCarrierYears === '0' && inputs.firstTimeBuyer === 'yes') {
          reasons.push('First-time home buyer – Progressive HO3 allows no prior coverage for new home purchases.');
        }

        if (inputs.progressiveAuto !== 'yes') {
          eligible = false;
          ineligibleReason =
            ineligibleReason ||
            'Progressive HO3 program requires an in-force Progressive auto policy.';
        }
      }

      if (inputs.multiPolicy === 'yes') {
        if (carrier.key === 'erieHome') {
          weight += 0.3;
          reasons.push('Good package opportunity – Erie often strong on auto/home bundle.');
        }
        if (carrier.key === 'progressiveHome' && inputs.progressiveAuto === 'yes') {
          weight += 0.3;
          reasons.push('Progressive auto + HO3 package – stronger appetite for bundled business.');
        }
      }

      if (inputs.claimsHistory === 'multiple' && carrier.key === 'erieHome') {
        eligible = false;
        ineligibleReason = 'Erie home appetite is limited for multiple-claim property risks.';
      }

      if (inputs.claimsHistory === 'multiple' && carrier.key === 'progressiveHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Two or more property claims in recent years – outside Progressive HO3 prior loss guidelines.';
      }

      if (inputs.claimsHistory === 'multiple' && carrier.key === 'travellersHome') {
        eligible = false;
        ineligibleReason =
          ineligibleReason ||
          'Per Travelers guidelines: more than 3 losses in past 5 years or more than 2 in past 3 years (excluding closed without payment) is not eligible.';
      }

      if (carrier.key === 'libertyHome') {
        if (roofMat === 'wood_shake') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per Safeco Eligibility Guide: wood roofs of all ages are ineligible.';
        } else if (roofMat === 'metal_or_slate') {
          if (roofAge > 65) {
            eligible = false;
            ineligibleReason = ineligibleReason || 'Per Safeco Eligibility Guide: metal, slate or tile roofs older than 65 years are ineligible.';
          }
        } else {
          if (roofAge > 20) {
            eligible = false;
            ineligibleReason = ineligibleReason || 'Per Safeco Eligibility Guide: all other roofs older than 20 years are ineligible.';
          }
        }
        if (inputs.claimsHistory === 'multiple') {
          weight -= 0.2;
          reasons.push('Per Safeco Eligibility Guide: more than 1 loss in prior 5 years – refer to underwriting. All losses in prior 5 years are subject to underwriting review.');
        } else if (inputs.claimsHistory === 'one') {
          weight -= 0.05;
          reasons.push('Per Safeco Eligibility Guide: all losses in the prior 5 years are subject to underwriting review.');
        }
        if (inputs.multiPolicy === 'yes') {
          reasons.push('Safeco offers Multi-Policy Discount when customer holds Auto or Umbrella with Safeco.');
        }
        if (inputs.dwellingValueBand === '500-1000k' || inputs.dwellingValueBand === '1000-1500k' || inputs.dwellingValueBand === '>1500k') {
          reasons.push('Safeco Premier coverage level (dwelling $500K+) may be available. Cov A >$1M in Protection Class 10 or >$3M in PC 9 may have additional requirements.');
        }
      }

      if (carrier.key === 'wisconsinMutualHome') {
        if (inputs.claimsHistory === 'multiple') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: more than one wind/hail in 5 years or non-weather loss in 3 years is non-binding; multiple claims ineligible.';
        }
        if (inputs.priorCarrierYears === '0' && inputs.firstTimeBuyer !== 'yes') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: canceled/rejected/non-renewed within past 3 years is non-binding; no prior coverage requires UW review.';
        }
        if (inputs.dogRisk === 'restricted') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: Pit Bulls, Am Staff, Rottweilers, Dobermans, Chows, wolf hybrids, or dogs with bite/vicious act history are ineligible.';
        }
        if (inputs.hazardFlag) {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: swimming pool without fence or with diving board/slide, or other hazardous premises, is ineligible.';
        }
        if (roofMat === 'wood_shake' || roofMat === 'rolled_tar') {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: wood shake, clay tile, asbestos, or interlocking asphalt roofing materials are non-binding.';
        }
        if (roofAge > 20) {
          eligible = false;
          ineligibleReason = ineligibleReason || 'Per WIM guidelines: roofs over 20 years old are ineligible.';
        }
      }

      if (carrier.key === 'foremostHome' && eligible) {
        const highRiskHome =
          inputs.claimsHistory === 'multiple' ||
          (inputs.priorCarrierYears === '0' && inputs.firstTimeBuyer !== 'yes') ||
          inputs.hazardFlag ||
          inputs.oldSystemsFlag;
        if (highRiskHome) {
          weight += 0.5;
          reasons.push('High-risk home profile – Foremost is best for non-standard homeowners.');
        }
      }

      if (carrier.key === 'dairylandHome' && eligible) {
        const veryHighRiskHome =
          (inputs.claimsHistory === 'multiple' && inputs.priorCarrierYears === '0') ||
          (inputs.claimsHistory === 'multiple' && (inputs.hazardFlag || inputs.oldSystemsFlag));
        if (veryHighRiskHome) {
          weight += 0.6;
          reasons.push('Very high-risk home – Dairyland is best option when other markets decline or are uncompetitive.');
        }
      }
    }

    if (productKey === 'commercial') {
      if (carrier.key === 'travellersComm') {
        weight += 0.2;
        reasons.push('Travelers has strong small commercial/BOP presence.');
      }
      if (carrier.key === 'grinnellComm' || carrier.key === 'donegalComm') {
        reasons.push('Very competitive on commercial – strong option for BOP/small commercial at this agency.');
      }
      if (priorYears >= 3 && inputs.claimsHistory !== 'multiple') {
        weight += 0.1;
        reasons.push('Stable small commercial risk – most markets comfortable.');
      }

      if (priorYears === 0 && inputs.claimsHistory === 'multiple' && carrier.key === 'erieComm') {
        eligible = false;
        ineligibleReason =
          'Zero prior insurance with multiple claims – Erie commercial appetite likely limited.';
      }
    }

    explanations.push({ carrier: carrier.name, reasons, eligible, ineligibleReason });

    return { ...carrier, weight, eligible, ineligibleReason };
  });

  // Order by expected premium: rank 1 = lowest premium for the customer (eligible first, then by competitiveness/weight).
  scored.sort((a, b) => {
    if (a.eligible !== b.eligible) {
      return a.eligible ? -1 : 1;
    }
    return b.weight - a.weight;
  });

  return {
    productKey,
    carriers: scored,
    explanations,
  };
}
