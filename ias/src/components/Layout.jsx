import GlowPortal from './GlowPortal'
import Navbar from './Navbar'
import './Layout.css'

export default function Layout({ children, showGlow = true, navVariant = 'app' }) {
  return (
    <div className="layout">
      {showGlow && <GlowPortal />}
      <Navbar variant={navVariant} />
      <main className="layout__main">{children}</main>
    </div>
  )
}
