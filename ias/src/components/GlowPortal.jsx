import PortalGlow from './PortalGlow'
import './GlowPortal.css'

export default function GlowPortal() {
  return (
    <div className="glow-portal" aria-hidden="true">
      <PortalGlow
        raysSpeed={0.55}
        noiseAmount={0.12}
        distortion={0.35}
        pulsating
        followMouse
        mouseInfluence={0.05}
      />
      <div className="glow-portal__source" />
      <div className="glow-portal__vignette" />
    </div>
  )
}
