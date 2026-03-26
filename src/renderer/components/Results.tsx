import React from 'react'
import { SuggestionResult } from '../lib/suggestions'
import { FormValues } from './RatingForm'

interface Props {
  inputs: FormValues | null
  result: SuggestionResult | null
}

export const Results: React.FC<Props> = ({ inputs, result }) => {
  if (!inputs || !result) {
    return (
      <>
        <div id="resultSummary" className="result-summary">
          Fill in the form and click &ldquo;Suggest Carriers&rdquo;.
        </div>
        <div id="resultDetails" className="result-details" />
      </>
    )
  }

  const namePart = inputs.clientName ? `${inputs.clientName} \u2013 ` : ''

  const productLabel =
    inputs.productType === 'home'
      ? 'Homeowners'
      : inputs.productType === 'commercial'
        ? 'Small Commercial'
        : 'Personal Auto'

  return (
    <>
      <div id="resultSummary" className="result-summary">
        <div>
          <div style={{ marginBottom: 4 }}>
            {namePart}
            <span>{productLabel} quote – suggested markets</span>
          </div>
        </div>
      </div>
      <div id="resultDetails" className="result-details">
        <div>
          Ranked by expected premium (1 = lowest premium for customer). Eligibility &amp; ranking
          are guidance only – does not rate or bind.
        </div>
        <ul>
          {result.carriers.map((c, index) => (
            <li key={c.key}>
              <strong>
                {index + 1}. {c.name}
              </strong>{' '}
              <span style={{ color: '#6b7280', fontSize: 11 }}>
                {c.eligible
                  ? `(eligible • weight ${c.weight.toFixed(2)})`
                  : `(NOT eligible – ${c.ineligibleReason})`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
