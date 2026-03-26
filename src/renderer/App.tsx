import React, { useState } from 'react'
import { RatingForm, FormValues, createEmptyInputs } from './components/RatingForm'
import { Results } from './components/Results'
import { calculateCarrierSuggestions, SuggestionResult } from './lib/suggestions'

interface Profile {
  id: string
  inputs: FormValues
  lastSuggestions: SuggestionResult | null
}

function makeProfile(id: string): Profile {
  return { id, inputs: createEmptyInputs(), lastSuggestions: null }
}

function getTabLabel(profile: Profile, index: number): string {
  const namePart = profile.inputs.clientName?.trim() || ''
  let typePart = ''
  if (profile.inputs.productType === 'home') typePart = 'Home'
  else if (profile.inputs.productType === 'commercial') typePart = 'Commercial'
  else typePart = 'Auto'

  if (namePart || typePart) {
    return [namePart || 'Unnamed', typePart].filter(Boolean).join(' \u2013 ')
  }
  return `Quote ${index + 1}`
}

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([makeProfile('profile-1')])
  const [activeId, setActiveId] = useState<string>('profile-1')

  const active = profiles.find((p) => p.id === activeId) || profiles[0]

  function updateActiveInputs(values: FormValues) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeId ? { ...p, inputs: values } : p))
    )
  }

  function handleSubmit(values: FormValues) {
    const suggestions = calculateCarrierSuggestions(values)
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, inputs: values, lastSuggestions: suggestions } : p
      )
    )
  }

  function handleReset() {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, inputs: createEmptyInputs(), lastSuggestions: null } : p
      )
    )
  }

  function addTab() {
    const newId = `profile-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    const newProfile = makeProfile(newId)
    setProfiles((prev) => [...prev, newProfile])
    setActiveId(newId)
  }

  function closeTab(id: string) {
    if (profiles.length <= 1) return
    const idx = profiles.findIndex((p) => p.id === id)
    if (idx === -1) return
    const next = profiles[Math.max(0, idx - 1)]
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (activeId === id) {
      setActiveId(next.id)
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <img
            className="logo-image"
            src="assets/prairie-land-logo.png"
            alt="Prairie Land Insurance logo"
          />
          <div className="brand-text">
            <h1>Prairie Land Insurance</h1>
            <p className="subtitle">Carrier's Appetite Guide</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <div className="tab-header">
            <h2>Quote &amp; Carrier Appetite Details</h2>
            <div className="tabs-row">
              <div id="tabsContainer" className="tabs-container">
                {profiles.map((profile, index) => (
                  <div
                    key={profile.id}
                    className={`tab-pill${profile.id === activeId ? ' active' : ''}`}
                    data-profile-id={profile.id}
                    onClick={() => setActiveId(profile.id)}
                  >
                    <span>{getTabLabel(profile, index)}</span>
                    {profiles.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(profile.id)
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" id="addTabBtn" className="tab-add-button" onClick={addTab}>
                + New Tab
              </button>
            </div>
          </div>

          <RatingForm
            key={activeId}
            values={active.inputs}
            onChange={updateActiveInputs}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </section>

        <section className="card result-card">
          <h2>Recommended Markets</h2>
          <Results inputs={active.lastSuggestions ? active.inputs : null} result={active.lastSuggestions} />
        </section>
      </main>

      <footer className="app-footer">
        <span className="footer-note">Prairie Land Insurance Agency Inc.™ 2026</span>
      </footer>
    </>
  )
}

export default App
