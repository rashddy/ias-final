import { useState, useEffect } from 'react'

const POLICIES = [
  { name: 'Information Security Policy', category: 'Organizational', tip: 'Top-level ISMS policy approved by management (A.5.1).' },
  { name: 'Access Control Policy', category: 'Access Control', tip: 'Defines who gets access to what systems and data (A.9.1).' },
  { name: 'Incident Response Policy', category: 'Incident Management', tip: 'Procedures for detecting and responding to security incidents (A.16.1).' },
  { name: 'Business Continuity Policy', category: 'Continuity', tip: 'Plans to maintain operations during disruptions (A.17.1).' },
  { name: 'Asset Management Policy', category: 'Asset Management', tip: 'Inventory and ownership of information assets (A.5.9).' },
  { name: 'Data Classification Policy', category: 'Data Protection', tip: 'Labels and handling rules for data sensitivity (A.8.3).' },
]

export function PolicyBuilderSim({ onCompleteReady }) {
  const [assignments, setAssignments] = useState({})
  const [hovered, setHovered] = useState(null)

  const allAssigned = POLICIES.every((p) => assignments[p.name])
  const allCorrect = POLICIES.every((p) => assignments[p.name] === p.category)

  useEffect(() => {
    onCompleteReady(allAssigned && allCorrect)
  }, [allAssigned, allCorrect, onCompleteReady])

  return (
    <div className="sim-panel">
      <p className="sim-panel__intro">Match each policy to its correct ISO 27001 category. Hover a policy name for a tooltip.</p>
      <div className="policy-builder">
        {POLICIES.map((policy) => (
          <div key={policy.name} className="policy-builder__row">
            <span
              className="policy-builder__name"
              onMouseEnter={() => setHovered(policy.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {policy.name}
              {hovered === policy.name && <span className="policy-builder__tip">{policy.tip}</span>}
            </span>
            <select
              value={assignments[policy.name] || ''}
              onChange={(e) => setAssignments((a) => ({ ...a, [policy.name]: e.target.value }))}
              className={`sim-select ${assignments[policy.name] && assignments[policy.name] !== policy.category ? 'sim-select--wrong' : ''} ${assignments[policy.name] === policy.category ? 'sim-select--correct' : ''}`}
            >
              <option value="">Select category…</option>
              {['Organizational', 'Access Control', 'Incident Management', 'Continuity', 'Asset Management', 'Data Protection'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {allAssigned && !allCorrect && <p className="sim-feedback sim-feedback--error">Some matches are incorrect. Review and try again.</p>}
    </div>
  )
}

const USERS = [
  { name: 'Sarah Chen', role: 'Admin', correct: { read: true, write: true, delete: true, admin: true, db: true } },
  { name: 'James Park', role: 'Developer', correct: { read: true, write: true, delete: false, admin: false, db: false } },
  { name: 'Lisa Wong', role: 'HR', correct: { read: true, write: true, delete: false, admin: false, db: false } },
  { name: 'Tom Reed', role: 'Intern', correct: { read: true, write: false, delete: false, admin: false, db: false } },
  { name: 'Maria Santos', role: 'CEO', correct: { read: true, write: false, delete: false, admin: false, db: false } },
]

const PERMS = ['read', 'write', 'delete', 'admin', 'db']
const PERM_LABELS = { read: 'Read', write: 'Write', delete: 'Delete', admin: 'Admin Panel', db: 'Database Access' }

export function AccessReviewSim({ onCompleteReady }) {
  const [perms, setPerms] = useState(() =>
    Object.fromEntries(USERS.map((u) => [u.name, { read: false, write: false, delete: false, admin: false, db: false }]))
  )
  const [submitted, setSubmitted] = useState(false)

  const score = USERS.filter((u) => PERMS.every((p) => perms[u.name][p] === u.correct[p])).length

  useEffect(() => {
    onCompleteReady(submitted && score >= 3)
  }, [submitted, score, onCompleteReady])

  const toggle = (user, perm) => {
    setSubmitted(false)
    setPerms((prev) => ({
      ...prev,
      [user]: { ...prev[user], [perm]: !prev[user][perm] },
    }))
  }

  return (
    <div className="sim-panel">
      <div className="sim-ref-panel">
        <strong>Least-privilege reference:</strong> Admin = full access. Developer = read/write code only. HR = HR systems only. Intern = read-only. CEO = read dashboards, no system admin.
      </div>
      <table className="sim-table">
        <thead>
          <tr>
            <th>User</th><th>Role</th>
            {PERMS.map((p) => <th key={p}>{PERM_LABELS[p]}</th>)}
          </tr>
        </thead>
        <tbody>
          {USERS.map((u) => (
            <tr key={u.name}>
              <td>{u.name}</td><td>{u.role}</td>
              {PERMS.map((p) => (
                <td key={p}>
                  <input type="checkbox" checked={perms[u.name][p]} onChange={() => toggle(u.name, p)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="sim-btn" onClick={() => setSubmitted(true)}>Submit review</button>
      {submitted && (
        <p className={`sim-feedback ${score >= 3 ? 'sim-feedback--ok' : 'sim-feedback--error'}`}>
          {score}/5 roles correct. {score >= 3 ? 'Passed!' : 'Need 3+ correct. Adjust and resubmit.'}
          {score < 5 && submitted && (
            <span className="sim-feedback__detail">
              {USERS.filter((u) => !PERMS.every((p) => perms[u.name][p] === u.correct[p])).map((u) => u.name).join(', ')} need review.
            </span>
          )}
        </p>
      )}
    </div>
  )
}

export function LoginFlowSim({ onCompleteReady, onStepChange }) {
  const [step, setStep] = useState(1)
  const [username] = useState('admin@isoguard.com')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const DEMO_OTP = '483921'

  const rules = [
    { test: (p) => p.length >= 12, label: '≥12 characters' },
    { test: (p) => /[A-Z]/.test(p), label: 'Uppercase' },
    { test: (p) => /[a-z]/.test(p), label: 'Lowercase' },
    { test: (p) => /[0-9]/.test(p), label: 'Number' },
    { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'Symbol' },
  ]
  const passOk = rules.every((r) => r.test(password))
  const otpOk = otp === DEMO_OTP

  useEffect(() => {
    onStepChange?.(step, 3)
    onCompleteReady(step === 3 && otpOk)
  }, [step, otpOk, onCompleteReady, onStepChange])

  return (
    <div className="sim-panel">
      {step >= 1 && (
        <div className={`sim-step ${step === 1 ? 'sim-step--active' : 'sim-step--done'}`}>
          <span className="sim-step__num">{step > 1 ? '✓' : '1'}</span>
          <div>
            <strong>Enter username</strong>
            <input type="text" value={username} readOnly className="sim-input sim-input--readonly" />
            {step === 1 && <button type="button" className="sim-btn sim-btn--sm" onClick={() => setStep(2)}>Next</button>}
          </div>
        </div>
      )}
      {step >= 2 && (
        <div className={`sim-step ${step === 2 ? 'sim-step--active' : passOk ? 'sim-step--done' : ''}`}>
          <span className="sim-step__num">{passOk && step > 2 ? '✓' : '2'}</span>
          <div>
            <strong>Enter password — meet all policy rules</strong>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Type a strong password…" className="sim-input" disabled={step > 2} />
            <ul className="sim-rules">
              {rules.map((r) => (
                <li key={r.label} className={r.test(password) ? 'sim-rules__pass' : 'sim-rules__fail'}>
                  {r.test(password) ? '✓' : '✗'} {r.label}
                </li>
              ))}
            </ul>
            {step === 2 && passOk && <button type="button" className="sim-btn sim-btn--sm" onClick={() => setStep(3)}>Next</button>}
          </div>
        </div>
      )}
      {step >= 3 && (
        <div className={`sim-step sim-step--active`}>
          <span className="sim-step__num">3</span>
          <div>
            <strong>MFA verification</strong>
            <p className="sim-otp-hint">Your code: <strong>{DEMO_OTP}</strong></p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="sim-input sim-input--otp" maxLength={6} />
          </div>
        </div>
      )}
    </div>
  )
}

const GAP_IDS = ['gap1', 'gap2', 'gap3', 'gap4']
const POLICY_TEXT = [
  { id: 'ok1', text: 'All employees are assigned unique user accounts for system access.' },
  { id: 'gap1', text: 'Access permissions are granted based on job role and reviewed annually.', gapLabel: 'No review cycle defined — ISO 27001 A.9.2.5 requires periodic access reviews.' },
  { id: 'ok2', text: 'Passwords must be at least 8 characters in length.' },
  { id: 'gap2', text: 'Remote workers may access systems using their corporate credentials.', gapLabel: 'No MFA requirement — ISO 27001 A.8.5 requires strong authentication including MFA for remote access.' },
  { id: 'gap3', text: 'Users may access any system their manager approves.', gapLabel: 'No least-privilege rule — violates ISO 27001 A.8.2 principle of least privilege.' },
  { id: 'ok3', text: 'All access requests must be submitted via the IT portal.' },
  { id: 'gap4', text: 'Former employees retain email access for 30 days after departure.', gapLabel: 'No offboarding clause — ISO 27001 A.9.2.6 requires prompt access revocation upon termination.' },
]

export function PolicyGapsSim({ onCompleteReady }) {
  const [found, setFound] = useState([])

  useEffect(() => {
    onCompleteReady(GAP_IDS.every((g) => found.includes(g)))
  }, [found, onCompleteReady])

  const toggle = (id, isGap) => {
    if (!isGap) return
    setFound((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id])
  }

  return (
    <div className="sim-panel">
      <p className="sim-panel__intro">Click on the sentences that contain policy gaps (4 gaps to find).</p>
      <div className="policy-gaps">
        {POLICY_TEXT.map((p) => (
          <p
            key={p.id}
            className={`policy-gaps__line ${GAP_IDS.includes(p.id) ? 'policy-gaps__line--gap' : ''} ${found.includes(p.id) ? 'policy-gaps__line--found' : ''}`}
            onClick={() => toggle(p.id, GAP_IDS.includes(p.id))}
          >
            {p.text}
            {found.includes(p.id) && p.gapLabel && <span className="policy-gaps__explain">{p.gapLabel}</span>}
          </p>
        ))}
      </div>
      <p className="sim-hint">{found.length}/4 gaps identified</p>
    </div>
  )
}

const ONBOARD = [
  'Create AD account', 'Assign role-based permissions', 'Issue MFA device',
  'Sign security policy', 'Add to asset register', 'Set password expiry',
  'Brief on acceptable use', 'Log in asset register',
]
const OFFBOARD = [
  'Revoke AD account', 'Remove MFA device', 'Revoke VPN access',
  'Archive user data', 'Notify IT within 24hrs', 'Update asset register',
]

export function OnboardingSim({ onCompleteReady, onStepChange }) {
  const [phase, setPhase] = useState(1)
  const [onChecked, setOnChecked] = useState({})
  const [offChecked, setOffChecked] = useState({})

  const onDone = ONBOARD.every((i) => onChecked[i])
  const offDone = OFFBOARD.every((i) => offChecked[i])

  useEffect(() => {
    onStepChange?.(phase, 2)
    onCompleteReady(onDone && offDone)
  }, [onDone, offDone, phase, onCompleteReady, onStepChange])

  return (
    <div className="sim-panel">
      {phase === 1 && (
        <>
          <p className="sim-panel__intro"><strong>Scenario:</strong> Alex has just joined as a developer. Complete onboarding.</p>
          <div className="sim-checklist">
            {ONBOARD.map((item) => (
              <label key={item} className="sim-check">
                <input type="checkbox" checked={!!onChecked[item]} onChange={() => setOnChecked((c) => ({ ...c, [item]: !c[item] }))} />
                {item}
              </label>
            ))}
          </div>
          {onDone && <button type="button" className="sim-btn" onClick={() => setPhase(2)}>Proceed to offboarding →</button>}
        </>
      )}
      {phase === 2 && (
        <>
          <p className="sim-panel__intro"><strong>Scenario:</strong> Alex is leaving. Complete offboarding.</p>
          <div className="sim-checklist">
            {OFFBOARD.map((item) => (
              <label key={item} className="sim-check">
                <input type="checkbox" checked={!!offChecked[item]} onChange={() => setOffChecked((c) => ({ ...c, [item]: !c[item] }))} />
                {item}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const PASSWORDS = [
  { pwd: 'Tr@vel2024!Secure', compliant: true, rule: 'Meets length, complexity, and no dictionary words.' },
  { pwd: 'password123', compliant: false, rule: 'Common dictionary word, no uppercase or symbol.' },
  { pwd: 'Admin@2024!', compliant: false, rule: 'Contains common word "Admin".' },
  { pwd: 'Xk9#mP2$vLq7', compliant: true, rule: 'Strong random password meeting all A.9.4 requirements.' },
  { pwd: 'Summer2024', compliant: false, rule: 'No special character, common word pattern.' },
  { pwd: 'C0rp!SecurePass99', compliant: true, rule: 'Meets all complexity requirements.' },
]

export function PasswordClassifySim({ onCompleteReady }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = PASSWORDS.filter((p) => answers[p.pwd] === (p.compliant ? 'yes' : 'no')).length

  useEffect(() => {
    onCompleteReady(submitted && score >= 5)
  }, [submitted, score, onCompleteReady])

  return (
    <div className="sim-panel">
      <p className="sim-panel__intro">Classify each password as Compliant or Non-Compliant per ISO 27001 A.9.4.</p>
      {PASSWORDS.map((p) => (
        <div key={p.pwd} className="pwd-classify">
          <code>{p.pwd}</code>
          <div className="pwd-classify__btns">
            <button type="button" className={`sim-btn sim-btn--sm ${answers[p.pwd] === 'yes' ? 'sim-btn--selected' : ''}`} onClick={() => { setSubmitted(false); setAnswers((a) => ({ ...a, [p.pwd]: 'yes' })) }}>Compliant</button>
            <button type="button" className={`sim-btn sim-btn--sm ${answers[p.pwd] === 'no' ? 'sim-btn--selected' : ''}`} onClick={() => { setSubmitted(false); setAnswers((a) => ({ ...a, [p.pwd]: 'no' })) }}>Non-Compliant</button>
          </div>
          {submitted && answers[p.pwd] !== (p.compliant ? 'yes' : 'no') && (
            <p className="sim-feedback sim-feedback--error sim-feedback--inline">{p.rule}</p>
          )}
        </div>
      ))}
      <button type="button" className="sim-btn" onClick={() => setSubmitted(true)} disabled={PASSWORDS.some((p) => !answers[p.pwd])}>Submit classifications</button>
      {submitted && <p className={`sim-feedback ${score >= 5 ? 'sim-feedback--ok' : 'sim-feedback--error'}`}>{score}/6 correct. Need 5/6 to pass.</p>}
    </div>
  )
}

const CVES = [
  { id: 'CVE-2024-1001', desc: 'Remote code execution in web server', cvss: 9.8, answer: 'immediate' },
  { id: 'CVE-2024-1002', desc: 'SQL injection in admin panel', cvss: 8.1, answer: 'immediate' },
  { id: 'CVE-2024-1003', desc: 'Cross-site scripting in login form', cvss: 6.5, answer: '30days' },
  { id: 'CVE-2024-1004', desc: 'Information disclosure in error messages', cvss: 4.3, answer: '90days' },
  { id: 'CVE-2024-1005', desc: 'Deprecated TLS 1.0 support', cvss: 3.1, answer: 'accept' },
]

const PRIORITIES = [
  { value: 'immediate', label: 'Immediate (CVSS 9.0+)' },
  { value: '30days', label: '30 days (CVSS 7.0–8.9)' },
  { value: '90days', label: '90 days (CVSS 4.0–6.9)' },
  { value: 'accept', label: 'Accept risk (CVSS <4.0)' },
]

export function VulnTriageSim({ onCompleteReady }) {
  const [assignments, setAssignments] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const score = CVES.filter((c) => assignments[c.id] === c.answer).length

  useEffect(() => {
    onCompleteReady(submitted && score >= 4)
  }, [submitted, score, onCompleteReady])

  return (
    <div className="sim-panel">
      <div className="sim-ref-panel">
        <strong>CVSS guidelines:</strong> 9.0+ = Immediate | 7.0–8.9 = 30 days | 4.0–6.9 = 90 days | &lt;4.0 = Accept risk
      </div>
      {CVES.map((cve) => (
        <div key={cve.id} className="vuln-row">
          <div>
            <strong>{cve.id}</strong> (CVSS {cve.cvss})<br />
            <span className="sim-muted">{cve.desc}</span>
          </div>
          <select
            value={assignments[cve.id] || ''}
            onChange={(e) => { setSubmitted(false); setAssignments((a) => ({ ...a, [cve.id]: e.target.value })) }}
            className="sim-select"
          >
            <option value="">Priority…</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      ))}
      <button type="button" className="sim-btn" onClick={() => setSubmitted(true)} disabled={CVES.some((c) => !assignments[c.id])}>Submit triage</button>
      {submitted && <p className={`sim-feedback ${score >= 4 ? 'sim-feedback--ok' : 'sim-feedback--error'}`}>{score}/5 correct. Need 4/5 to pass.</p>}
    </div>
  )
}

const DRILL = [
  {
    q: 'First action?',
    options: ['Ignore until morning', 'Isolate affected system', 'Delete all logs', 'Email all staff'],
    correct: 1,
  },
  {
    q: 'Who do you notify?',
    options: ['No one yet', 'ISO/CISO + team lead within 1 hour', 'Social media team', 'All customers immediately'],
    correct: 1,
  },
  {
    q: 'What log do you check first?',
    options: ['Printer logs', 'Authentication logs / SIEM', 'Email outbox', 'Calendar events'],
    correct: 1,
  },
  {
    q: 'What form do you fill?',
    options: ['Holiday request', 'Incident Report Form', 'Expense claim', 'Leave application'],
    correct: 1,
  },
  {
    q: 'After containment?',
    options: ['Forget about it', 'Conduct post-incident review within 72 hours', 'Publish details publicly', 'Reset all passwords globally'],
    correct: 1,
  },
]

export function IncidentDrillSim({ onCompleteReady, onStepChange }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [wrong, setWrong] = useState(false)

  const current = DRILL[step]
  const done = step >= DRILL.length

  useEffect(() => {
    onStepChange?.(Math.min(step + 1, DRILL.length), DRILL.length)
    onCompleteReady(done)
  }, [step, done, onCompleteReady, onStepChange])

  const submit = () => {
    if (selected === current.correct) {
      setWrong(false)
      setSelected(null)
      setStep((s) => s + 1)
    } else {
      setWrong(true)
    }
  }

  if (done) return <p className="sim-feedback sim-feedback--ok">All 5 decision points answered correctly. Incident handled!</p>

  return (
    <div className="sim-panel">
      <p className="sim-panel__intro"><strong>Alert:</strong> At 2:14 AM — unauthorized login from IP 185.220.xx.xx</p>
      <p className="sim-drill-q">Decision {step + 1}: {current.q}</p>
      <div className="sim-drill-options">
        {current.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            className={`sim-drill-opt ${selected === i ? 'sim-drill-opt--selected' : ''}`}
            onClick={() => { setSelected(i); setWrong(false) }}
          >
            {opt}
          </button>
        ))}
      </div>
      {wrong && <p className="sim-feedback sim-feedback--error">Incorrect — try again.</p>}
      <button type="button" className="sim-btn" onClick={submit} disabled={selected === null}>Confirm decision</button>
    </div>
  )
}
