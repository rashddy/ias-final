import { useState, useCallback, useEffect } from 'react'
import { ReadModalContent, SimulationContent } from './ModalContent'
import './ChecklistModal.css'

const RISK_LABELS = { high: 'HIGH', medium: 'MED', low: 'LOW' }

export default function ChecklistModal({ control, onClose, onComplete }) {
  const [canComplete, setCanComplete] = useState(false)
  const [success, setSuccess] = useState(false)
  const [simStep, setSimStep] = useState({ current: 1, total: 1 })

  const isSimulation = control.modalType === 'simulation'

  const handleCompleteReady = useCallback((ready) => {
    setCanComplete(ready)
  }, [])

  const handleStepChange = useCallback((current, total) => {
    setSimStep({ current, total })
  }, [])

  const handleComplete = () => {
    if (!canComplete) return
    setSuccess(true)
    setTimeout(() => {
      onComplete(control)
    }, 1500)
  }

  useEffect(() => {
    setCanComplete(false)
    setSuccess(false)
    setSimStep({ current: 1, total: 1 })
  }, [control.id])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="cl-modal-overlay" onClick={onClose}>
      <div className="cl-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {success ? (
          <div className="cl-modal__success">
            <div className="cl-modal__success-icon">✓</div>
            <h2>Control completed!</h2>
            <p>+1 to your compliance score</p>
          </div>
        ) : (
          <>
            <div className="cl-modal__header">
              <div className="cl-modal__header-left">
                <span className="cl-modal__badge">{control.id}</span>
                <h2 className="cl-modal__title">{control.title}</h2>
                <span className={`cl-modal__risk cl-modal__risk--${control.risk}`}>
                  {RISK_LABELS[control.risk]}
                </span>
              </div>
              <div className="cl-modal__header-right">
                {isSimulation && (
                  <span className="cl-modal__step">Step {simStep.current} of {simStep.total}</span>
                )}
                <button type="button" className="cl-modal__close" onClick={onClose} aria-label="Close">✕</button>
              </div>
            </div>

            <div className="cl-modal__body">
              {isSimulation ? (
                <SimulationContent
                  simulationId={control.simulationId}
                  onCompleteReady={handleCompleteReady}
                  onStepChange={handleStepChange}
                />
              ) : (
                <ReadModalContent
                  readId={control.readId}
                  onCompleteReady={handleCompleteReady}
                />
              )}
            </div>

            <div className="cl-modal__footer">
              <span className="cl-modal__hint">
                {isSimulation ? 'Complete all steps to finish' : 'Read to bottom or wait 8 seconds'}
              </span>
              <button
                type="button"
                className={`cl-modal__action ${canComplete ? 'cl-modal__action--ready' : ''}`}
                disabled={!canComplete}
                onClick={handleComplete}
              >
                {isSimulation ? 'Complete Simulation' : 'Mark as Read'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
