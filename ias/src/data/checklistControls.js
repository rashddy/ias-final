export const CHECKLIST_CONTROLS = [
  { id: 'A.5.1', title: 'Policies for information security', description: 'Documented and approved information security policies.', risk: 'high', modalType: 'simulation', simulationId: 'policy-builder' },
  { id: 'A.5.2', title: 'Information security roles and responsibilities', description: 'Roles and responsibilities clearly defined and assigned.', risk: 'high', modalType: 'read', readId: 'A.5.2' },
  { id: 'A.5.9', title: 'Inventory of information and assets', description: 'Assets identified and an inventory maintained.', risk: 'medium', modalType: 'read', readId: 'A.5.9' },
  { id: 'A.6.3', title: 'Information security awareness, education and training', description: 'Security awareness program for all personnel.', risk: 'medium', modalType: 'read', readId: 'A.6.3' },
  { id: 'A.7.4', title: 'Physical security monitoring', description: 'Premises monitored for unauthorized access.', risk: 'low', modalType: 'read', readId: 'A.7.4' },
  { id: 'A.8.1', title: 'User endpoint devices', description: 'Devices secured and managed per policy.', risk: 'medium', modalType: 'read', readId: 'A.8.1' },
  { id: 'A.8.2', title: 'Privileged access rights', description: 'Privileged access restricted and monitored.', risk: 'high', modalType: 'simulation', simulationId: 'access-review' },
  { id: 'A.8.3', title: 'Information access restriction', description: 'Access restricted based on classification.', risk: 'high', modalType: 'read', readId: 'A.8.3' },
  { id: 'A.8.5', title: 'Secure authentication', description: 'Strong authentication mechanisms enforced.', risk: 'high', modalType: 'simulation', simulationId: 'login-flow' },
  { id: 'A.9.1', title: 'Access control policy', description: 'Access control policy established and reviewed.', risk: 'high', modalType: 'simulation', simulationId: 'policy-gaps' },
  { id: 'A.9.2', title: 'User access management', description: 'User registration and de-registration process.', risk: 'high', modalType: 'simulation', simulationId: 'onboarding' },
  { id: 'A.9.4', title: 'Use of secret authentication information', description: 'Password and credential management enforced.', risk: 'high', modalType: 'simulation', simulationId: 'password-classify' },
  { id: 'A.12.1', title: 'Operational procedures and responsibilities', description: 'Documented operating procedures for IT systems.', risk: 'medium', modalType: 'read', readId: 'A.12.1' },
  { id: 'A.12.4', title: 'Logging and monitoring', description: 'Event logs captured and reviewed regularly.', risk: 'medium', modalType: 'read', readId: 'A.12.4' },
  { id: 'A.12.6', title: 'Management of technical vulnerabilities', description: 'Vulnerability scanning and patch management.', risk: 'high', modalType: 'simulation', simulationId: 'vuln-triage' },
  { id: 'A.13.1', title: 'Network security management', description: 'Networks secured and segregated appropriately.', risk: 'medium', modalType: 'read', readId: 'A.13.1' },
  { id: 'A.14.2', title: 'Security in development and support processes', description: 'Secure development lifecycle practices.', risk: 'medium', modalType: 'read', readId: 'A.14.2' },
  { id: 'A.16.1', title: 'Incident management', description: 'Incident response plan documented and tested.', risk: 'high', modalType: 'simulation', simulationId: 'incident-drill' },
  { id: 'A.17.1', title: 'Information security continuity', description: 'Business continuity plans for security events.', risk: 'medium', modalType: 'read', readId: 'A.17.1' },
  { id: 'A.18.1', title: 'Compliance with legal and contractual requirements', description: 'Legal and regulatory requirements identified.', risk: 'low', modalType: 'read', readId: 'A.18.1' },
]

export const STORAGE_KEY = 'iso27001_progress'

export function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { completed: [], details: {} }
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) return { completed: parsed, details: {} }
    return parsed
  } catch {
    return { completed: [], details: {} }
  }
}

export function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUnlockedIndex(completed) {
  return completed.length
}

export function getControlStatus(control, index, completed, activeId) {
  if (completed.includes(control.id)) return 'done'
  const unlockedIndex = completed.length
  if (index === unlockedIndex) {
    if (activeId === control.id) return 'active'
    return 'unlocked'
  }
  return 'locked'
}
