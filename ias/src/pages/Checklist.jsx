import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
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
  const [activeControl, setActiveControl] = useState(null)

  const { completed, details } = progress
  const total = CHECKLIST_CONTROLS.length
  const doneCount = completed.length
  const progressPercent = Math.round((doneCount / total) * 100)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const handleOpen = (control, status) => {
    if (status === 'locked' || status === 'done') return
    setActiveControl(control)
  }

  const handleComplete = (control) => {
    const subtitle = control.modalType === 'simulation'
      ? 'Simulation completed ✓'
      : 'Article fully read ✓'

    setProgress((prev) => ({
      completed: [...prev.completed, control.id],
      details: { ...prev.details, [control.id]: { subtitle, type: control.modalType } },
    }))
    setActiveControl(null)
  }

  const handleReset = () => {
    if (!window.confirm('Reset all checklist progress? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    setProgress({ completed: [], details: {} })
    setActiveControl(null)
  }

  const getPrevControlId = (index) => (index > 0 ? CHECKLIST_CONTROLS[index - 1].id : null)

  return (
    <Layout>
      <div className="tool-page checklist-page">
        <div className="tool-page__header">
          <h1>Compliance Checklist</h1>
          <p>ISO/IEC 27001:2022 Annex A — Interactive Learning Path</p>
        </div>

        <IsoInfoBox title="ISO 27001 Annex A — Control Implementation">
          Complete each control in order. Click an unlocked item to open an interactive
          simulation or reading module. Progress is saved automatically.
        </IsoInfoBox>

        <div className="checklist-progress">
          <div className="checklist-progress__text">
            <strong>{doneCount} of {total}</strong> controls completed
          </div>
          <div className="checklist-progress__bar">
            <div className="checklist-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="checklist-progress__percent">{progressPercent}%</span>
        </div>

        <div className="checklist-items">
          {CHECKLIST_CONTROLS.map((control, index) => {
            const status = getControlStatus(control, index, completed, activeControl?.id)
            const risk = RISK_CONFIG[control.risk]
            const detail = details[control.id]

            return (
              <div
                key={control.id}
                className={`checklist-item checklist-item--${status}`}
                onClick={() => handleOpen(control, status)}
                role={status === 'unlocked' || status === 'active' ? 'button' : undefined}
                tabIndex={status === 'unlocked' || status === 'active' ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleOpen(control, status)
                }}
              >
                <div className={`checklist-item__indicator checklist-item__indicator--${status}`}>
                  {status === 'done' && '✓'}
                  {status === 'locked' && '🔒'}
                </div>

                <div className="checklist-item__content">
                  <div className="checklist-item__top">
                    <span className="checklist-item__id">{control.id}</span>
                    <h3 className="checklist-item__title">{control.title}</h3>
                  </div>
                  <p className="checklist-item__desc">{control.description}</p>
                  {status === 'done' && detail?.subtitle && (
                    <p className="checklist-item__subtitle">{detail.subtitle}</p>
                  )}
                  {status === 'active' && (
                    <p className="checklist-item__subtitle checklist-item__subtitle--active">
                      ▶ Currently open — {control.modalType === 'simulation' ? 'interactive simulation' : 'reading module'}
                    </p>
                  )}
                  {status === 'locked' && (
                    <p className="checklist-item__subtitle checklist-item__subtitle--locked">
                      Locked — finish {getPrevControlId(index)} first
                    </p>
                  )}
                </div>

                <div className="checklist-item__badges">
                  <span className={`checklist-item__risk ${risk.className}`}>{risk.label}</span>
                  <span className={`checklist-item__status checklist-item__status--${status}`}>
                    {status === 'done' && 'Done ✓'}
                    {status === 'unlocked' && 'Unlocked — click to start'}
                    {status === 'active' && 'In progress'}
                    {status === 'locked' && '🔒 Locked'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <button type="button" className="checklist-reset" onClick={handleReset}>
          Reset Progress
        </button>

        {activeControl && (
          <ChecklistModal
            control={activeControl}
            onClose={() => setActiveControl(null)}
            onComplete={handleComplete}
          />
        )}
      </div>
    </Layout>
  )
}
