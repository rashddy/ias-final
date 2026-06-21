import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import './Landing.css'

const FEATURE_CARDS = [
  {
    icon: 'fa-file-shield',
    title: 'Security Policy Overview',
    desc: 'Review key ISO 27001 policy areas and their compliance status.',
    path: '/security-policy',
  },
  {
    icon: 'fa-list-check',
    title: 'Compliance Checklist',
    desc: 'Track Annex A controls with interactive checkboxes and risk levels.',
    path: '/checklist',
  },
  {
    icon: 'fa-right-to-bracket',
    title: 'Login & MFA Demo',
    desc: 'Experience secure authentication with multi-factor verification.',
    path: '/login',
  },
  {
    icon: 'fa-key',
    title: 'Password Policy Checker',
    desc: 'Validate passwords against ISO 27001 A.9.4 requirements.',
    path: '/password-checker',
  },
  {
    icon: 'fa-brain',
    title: 'Security Awareness Quiz',
    desc: 'Test your knowledge of information security best practices.',
    path: '/quiz',
  },
  {
    icon: 'fa-clock',
    title: 'Session Simulation',
    desc: 'See how session timeout controls protect against unauthorized access.',
    path: '/session',
  },
]

export default function Landing() {
  return (
    <Layout navVariant="landing">
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <i className="fa-solid fa-certificate" aria-hidden="true" />
            ISO/IEC 27001:2022 Educational Demo
          </div>

          <h1 className="hero__title">
            ISO 27001<br />Compliance Portal
          </h1>

          <p className="hero__tagline">
            Know what your system needs to pass the standard
          </p>

          <p className="hero__subtitle">
            ISO 27001 is the international standard for Information Security Management
            Systems (ISMS). It helps organizations protect sensitive data through
            documented policies, risk assessments, and security controls.
          </p>

          <div className="hero__cta">
            <Link to="/login">
              <Button variant="primary" size="lg">Login</Button>
            </Link>
            <Link to="/checklist" className="hero__demo-link">
              Explore checklist
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2 className="features__heading">Explore the Portal</h2>
        <div className="features__grid">
          {FEATURE_CARDS.map((f) => (
            <Link key={f.title} to={f.path} className="feature-card">
              <span className="feature-card__icon">
                <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
              </span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="compliance-banner" id="overview">
        <div className="compliance-banner__inner">
          <h2>Why ISO 27001 Matters</h2>
          <p>
            Certification demonstrates that your organization has identified risks,
            implemented appropriate controls, and maintains a culture of security
            awareness. This demo shows the policies, tools, and processes auditors
            expect to see.
          </p>
        </div>
      </section>
    </Layout>
  )
}
