import { useState, useEffect, useCallback } from 'react'
import { READ_CONTENT } from '../../data/checklistReadContent'
import {
  PolicyBuilderSim,
  AccessReviewSim,
  LoginFlowSim,
  PolicyGapsSim,
  OnboardingSim,
  PasswordClassifySim,
  VulnTriageSim,
  IncidentDrillSim,
} from './simulations'

export function ReadModalContent({ readId, onCompleteReady }) {
  const content = READ_CONTENT[readId]
  const [scrollProgress, setScrollProgress] = useState(0)
  const [timeReady, setTimeReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimeReady(true), 8000)
    return () => clearTimeout(timer)
  }, [readId])

  const handleScroll = useCallback((e) => {
    const el = e.target
    const progress = el.scrollHeight <= el.clientHeight
      ? 100
      : (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
    setScrollProgress(Math.min(100, progress))
  }, [])

  useEffect(() => {
    const ready = scrollProgress >= 95 || timeReady
    onCompleteReady(ready)
  }, [scrollProgress, timeReady, onCompleteReady])

  if (!content) return <p>Content not found.</p>

  return (
    <div className="read-modal">
      <div className="read-modal__progress">
        <div className="read-modal__progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="read-modal__body" onScroll={handleScroll}>
        <div className="read-panel read-panel--intro">
          <h3>Why this matters</h3>
          <p>{content.why}</p>
        </div>
        <div className="read-panel">
          <h3>Key requirements</h3>
          <ul>
            {content.requirements.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
        <div className="read-panel read-panel--example">
          <h3>Real-world example</h3>
          <p>{content.example}</p>
        </div>
        <div className="read-panel read-panel--warning">
          <h3>Common mistakes</h3>
          <ul>
            {content.mistakes.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

const SIM_MAP = {
  'policy-builder': PolicyBuilderSim,
  'access-review': AccessReviewSim,
  'login-flow': LoginFlowSim,
  'policy-gaps': PolicyGapsSim,
  onboarding: OnboardingSim,
  'password-classify': PasswordClassifySim,
  'vuln-triage': VulnTriageSim,
  'incident-drill': IncidentDrillSim,
}

export function SimulationContent({ simulationId, onCompleteReady, onStepChange }) {
  const Sim = SIM_MAP[simulationId]
  if (!Sim) return <p>Simulation not found.</p>
  return <Sim onCompleteReady={onCompleteReady} onStepChange={onStepChange} />
}
