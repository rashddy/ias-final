import './IsoInfoBox.css'

export default function IsoInfoBox({ title = 'ISO 27001 Connection', children }) {
  return (
    <div className="iso-info-box">
      <div className="iso-info-box__icon">
        <i className="fa-solid fa-shield-halved" aria-hidden="true" />
      </div>
      <div>
        <strong className="iso-info-box__title">{title}</strong>
        <p className="iso-info-box__text">{children}</p>
      </div>
    </div>
  )
}
