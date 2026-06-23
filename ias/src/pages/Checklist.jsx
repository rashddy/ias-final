import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import ChecklistModal from '../components/checklist/ChecklistModal'
import {
  CHECKLIST_CONTROLS,
  STORAGE_KEY,
  loadProgress,
  saveProgress,
  getControlStatus,
} from '../data/checklistControls'
import './Checklist.css'

const RISK_CONFIG = {
  high: { label: 'HIGH', className: 'risk--high' },
  medium: { label: 'MED', className: 'risk--medium' },
  low: { label: 'LOW', className: 'risk--low' },
}

export default function Checklist() {
  const [progress, setProgress] = useState(loadProgress)
  const [selectedId, setSelectedId] = useState(null)
  const [modalControl, setModalControl] = useState(null)

  const { completed, details } = progress
  const total = CHECKLIST_CONTROLS.length
  const doneCount = completed.length
  const progressPercent = Math.round((doneCount / total) * 100)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const handleToggle = (controlId) => {
    setProgress((prev) => {
      if (prev.completed.includes(controlId)) {
        const { [controlId]: _, ...restDetails } = prev.details
        return {
          completed: prev.completed.filter((id) => id !== controlId),
          details: restDetails,
        }
      }
      const control = CHECKLIST_CONTROLS.find((c) => c.id === controlId)
      return {
        completed: [...prev.completed, controlId],
        details: {
          ...prev.details,
          [controlId]: { subtitle: 'Marked complete ✓', type: control?.modalType },
        },
      }
    })
  }

  const handleSelect = (control) => {
    setSelectedId(control.id)
  }

  const handleOpenModule = (control, e) => {
    e.stopPropagation()
    setModalControl(control)
    setSelectedId(control.id)
  }

  const handleModalComplete = (control) => {
    setProgress((prev) => {
      if (prev.completed.includes(control.id)) return prev
      const subtitle = control.modalType === 'simulation'
        ? 'Simulation completed ✓'
        : 'Article fully read ✓'
      return {
        completed: [...prev.completed, control.id],
        details: { ...prev.details, [control.id]: { subtitle, type: control.modalType } },
      }
    })
    setModalControl(null)
  }

  const handleReset = () => {
    if (!window.confirm('Reset all checklist progress? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    setProgress({ completed: [], details: {} })
    setSelectedId(null)
    setModalControl(null)
  }

  const selectedControl = CHECKLIST_CONTROLS.find((c) => c.id === selectedId)

  return (
    <Layout>
      <div className="tool-page checklist-page">
        <div className="tool-page__header">
          <h1>Security Awareness Checklist</h1>
          <p>Pick any control in any order — click to explore, check to mark progress</p>
        </div>

        <IsoInfoBox title="Free Exploration — No Required Order">
          All checklist items are available immediately. Click any row to view details,
          open its module, or use the checkbox to mark it complete or incomplete.
        </IsoInfoBox>

        <div className="checklist-progress">
          <div className="checklist-progress__text">
            <strong>Progress: {doneCount} / {total}</strong> controls completed
          </div>
          <div className="checklist-progress__bar">
            <div className="checklist-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="checklist-progress__percent">{progressPercent}%</span>
        </div>

        <div className="checklist-layout">
          <div className="checklist-items">
            {CHECKLIST_CONTROLS.map((control) => {
              const status = getControlStatus(control, completed, selectedId)
              const risk = RISK_CONFIG[control.risk]
              const detail = details[control.id]
              const isChecked = completed.includes(control.id)

              return (
                <div
                  key={control.id}
                  className={`checklist-item checklist-item--${status}`}
                  onClick={() => handleSelect(control)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(control) }}
                >
                  <label className="checklist-item__checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(control.id)}
                      aria-label={`Mark ${control.title} as ${isChecked ? 'incomplete' : 'complete'}`}
                    />
                    <span className="checklist-item__checkmark" aria-hidden="true" />
                  </label>

                  <div className="checklist-item__content">
                    <div className="checklist-item__top">
                      <span className="checklist-item__id">{control.id}</span>
                      <h3 className="checklist-item__title">{control.title}</h3>
                    </div>
                    <p className="checklist-item__desc">{control.description}</p>
                    {isChecked && detail?.subtitle && (
                      <p className="checklist-item__subtitle">{detail.subtitle}</p>
                    )}
                  </div>

                  <div className="checklist-item__badges">
                    <span className={`checklist-item__risk ${risk.className}`}>{risk.label}</span>
                    <button
                      type="button"
                      className="checklist-item__module-btn"
                      onClick={(e) => handleOpenModule(control, e)}
                    >
                      {control.modalType === 'simulation' ? 'Open simulation' : 'Read module'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedControl ? (
            <aside className="checklist-explanation">
              <div className="checklist-explanation__header">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                <h2>{selectedControl.title}</h2>
              </div>
              <p className="checklist-explanation__text">{selectedControl.description}</p>
              <div className="checklist-explanation__actions">
                <Button variant="outline" size="sm" onClick={() => setModalControl(selectedControl)}>
                  {selectedControl.modalType === 'simulation' ? 'Launch simulation' : 'Open reading module'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleToggle(selectedControl.id)}
                >
                  {completed.includes(selectedControl.id) ? 'Mark incomplete' : 'Mark complete'}
                </Button>
              </div>
            </aside>
          ) : (
            <aside className="checklist-explanation checklist-explanation--placeholder">
              <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
              <h2>Select any control</h2>
              <p>Click any checklist item on the left to view its details. Use the checkbox to mark progress — no order required.</p>
            </aside>
          )}
        </div>

        {doneCount === total && (
          <div className="checklist-completion">
            <i className="fa-solid fa-trophy" aria-hidden="true" />
            <h2>Congratulations! All controls completed.</h2>
          </div>
        )}

        <button type="button" className="checklist-reset" onClick={handleReset}>
          Reset Progress
        </button>

        {modalControl && (
          <ChecklistModal
            control={modalControl}
            onClose={() => setModalControl(null)}
            onComplete={handleModalComplete}
          />
        )}
      </div>
    </Layout>
  )
}
