import Layout from '../components/Layout'
import IsoInfoBox from '../components/IsoInfoBox'
import { SECURITY_POLICIES } from '../data/isoChecklist'
import './SecurityPolicy.css'

const STATUS_LABELS = {
  compliant: 'Compliant',
  'review-needed': 'Review Needed',
  'not-implemented': 'Not Implemented',
}

export default function SecurityPolicy() {
  return (
    <Layout>
      <div className="tool-page policy-page">
        <div className="tool-page__header">
          <h1>Security Policy Overview</h1>
          <p>Key ISO 27001 policy areas and their implementation status</p>
        </div>

        <IsoInfoBox title="ISO 27001 A.5 — Organizational Controls">
          Documented policies are the foundation of an ISMS. ISO 27001 requires
          policies to be approved by management, published, and communicated to
          all relevant personnel.
        </IsoInfoBox>

        <div className="policy-grid">
          {SECURITY_POLICIES.map((policy) => (
            <article key={policy.id} className="policy-card">
              <div className="policy-card__top">
                <span className="policy-card__iso">{policy.isoRef}</span>
                <span className={`policy-card__status policy-card__status--${policy.status}`}>
                  {STATUS_LABELS[policy.status]}
                </span>
              </div>
              <h3 className="policy-card__title">{policy.title}</h3>
              <p className="policy-card__summary">{policy.description}</p>
              <div className="policy-card__detail">
                <p><strong>What it requires:</strong> {policy.requirement}</p>
                <p><strong>Why it matters:</strong> {policy.why}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  )
}
