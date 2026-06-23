import './SecurityLearningPanel.css'

export default function SecurityLearningPanel({ title, icon, points, variant = 'default' }) {
  if (!points?.length) return null

  return (
    <aside className={`security-learning-panel security-learning-panel--${variant}`}>
      <div className="security-learning-panel__header">
        <i className={`fa-solid ${icon || 'fa-graduation-cap'}`} aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      <ul className="security-learning-panel__list">
        {points.map((point) => (
          <li key={point} className="security-learning-panel__item">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
