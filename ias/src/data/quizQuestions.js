/** One question per checklist control — shown only after that control is completed. */
export const CONTROL_QUIZ = {
  'A.5.1': {
    controlId: 'A.5.1',
    question: 'What is the purpose of an Information Security Policy under ISO 27001?',
    options: [
      'To replace all technical security controls',
      'To establish top-level direction for the ISMS approved by management',
      'To list every employee\'s password',
      'To define marketing campaign schedules',
    ],
    correct: 1,
    explanation: 'A.5.1 requires a documented information security policy as the foundation of the ISMS.',
  },
  'A.5.2': {
    controlId: 'A.5.2',
    question: 'Which practice supports segregation of duties under A.5.2?',
    options: [
      'One person requests, approves, and executes access changes',
      'The CISO also serves as sole developer and auditor',
      'Different people handle requesting vs approving access changes',
      'All security tasks are assigned to the helpdesk only',
    ],
    correct: 2,
    explanation: 'Segregation of duties prevents one person from controlling an entire sensitive process.',
  },
  'A.5.9': {
    controlId: 'A.5.9',
    question: 'What must every asset in the register have according to A.5.9?',
    options: [
      'A public URL',
      'An assigned owner accountable for its protection',
      'The same classification as all other assets',
      'Unlimited access for all staff',
    ],
    correct: 1,
    explanation: 'Asset inventory requires identified owners responsible for protecting each asset.',
  },
  'A.6.3': {
    controlId: 'A.6.3',
    question: 'What should an ISO 27001 security awareness program include?',
    options: [
      'Training once at hire with no follow-up',
      'Annual training, phishing simulations, and signed policy acknowledgments',
      'Only technical staff training',
      'Optional training with no records kept',
    ],
    correct: 1,
    explanation: 'A.6.3 requires ongoing awareness, education, training, and documented completion records.',
  },
  'A.7.4': {
    controlId: 'A.7.4',
    question: 'Which is a physical security monitoring control under A.7.4?',
    options: [
      'Disabling CCTV to save costs',
      'Visitor logs with escort requirements for sensitive areas',
      'Sharing building access PINs via email',
      'Propping open server room doors for convenience',
    ],
    correct: 1,
    explanation: 'Physical monitoring includes CCTV, visitor management, and controlled access to secure areas.',
  },
  'A.8.1': {
    controlId: 'A.8.1',
    question: 'What is required for user endpoint devices under A.8.1?',
    options: [
      'No patching to avoid downtime',
      'MDM enrollment, encryption, and remote wipe capability',
      'Unlimited personal app installs on corporate devices',
      'Shared device logins for all team members',
    ],
    correct: 1,
    explanation: 'Endpoints must be managed (MDM), encrypted, patched, and support remote wipe if lost.',
  },
  'A.8.2': {
    controlId: 'A.8.2',
    question: 'An intern account should have which access level per least-privilege (A.8.2)?',
    options: [
      'Full admin and database access',
      'Read-only access appropriate to their role',
      'Same access as the CEO',
      'Write and delete access to all production systems',
    ],
    correct: 1,
    explanation: 'Least privilege means granting only the minimum access needed for the role.',
  },
  'A.8.3': {
    controlId: 'A.8.3',
    question: 'What principle does A.8.3 information access restriction enforce?',
    options: [
      'Everyone gets access to all data',
      'Need-to-know and role-based access aligned to classification',
      'Access based on seniority only',
      'Shared accounts for efficiency',
    ],
    correct: 1,
    explanation: 'Access must be restricted based on role and data classification labels.',
  },
  'A.8.5': {
    controlId: 'A.8.5',
    question: 'Which meets ISO 27001 secure authentication requirements (A.8.5)?',
    options: [
      'Password-only login with 6-character minimum',
      'MFA plus strong password policy (length, complexity, symbols)',
      'Shared team credentials with monthly rotation',
      'Authentication via security questions only',
    ],
    correct: 1,
    explanation: 'Secure authentication requires strong passwords and MFA, especially for remote access.',
  },
  'A.9.1': {
    controlId: 'A.9.1',
    question: 'Which is a gap in a weak access control policy (A.9.1)?',
    options: [
      'Requiring unique user accounts',
      'No defined access review cycle or MFA for remote workers',
      'Using an IT portal for access requests',
      'Documenting approved access procedures',
    ],
    correct: 1,
    explanation: 'Policies must include review cycles, MFA, least privilege, and offboarding procedures.',
  },
  'A.9.2': {
    controlId: 'A.9.2',
    question: 'When an employee leaves, what must happen first under A.9.2?',
    options: [
      'Keep their account active for 30 days',
      'Promptly revoke access (AD account, MFA, VPN)',
      'Transfer their credentials to their manager',
      'Archive nothing until annual review',
    ],
    correct: 1,
    explanation: 'Offboarding requires immediate access revocation across all systems.',
  },
  'A.9.4': {
    controlId: 'A.9.4',
    question: 'Which password is NON-COMPLIANT under A.9.4?',
    options: [
      'C0rp!SecurePass99',
      'Xk9#mP2$vLq7',
      'password123',
      'Tr@vel2024!Secure',
    ],
    correct: 2,
    explanation: '"password123" is a common dictionary word lacking uppercase and special characters.',
  },
  'A.12.1': {
    controlId: 'A.12.1',
    question: 'What does A.12.1 require for operational procedures?',
    options: [
      'Undocumented tribal knowledge is acceptable',
      'Documented runbooks and formal change management',
      'Developers deploy directly to production without approval',
      'No separation between dev and production environments',
    ],
    correct: 1,
    explanation: 'Operations require documented procedures, change control, and environment separation.',
  },
  'A.12.4': {
    controlId: 'A.12.4',
    question: 'How long should security logs typically be retained under A.12.4?',
    options: [
      '24 hours',
      'Until disk is full',
      'At least 12 months with central SIEM collection',
      'Logs are optional for compliance',
    ],
    correct: 2,
    explanation: 'Logs must capture key events, be centrally collected, and retained for audit purposes.',
  },
  'A.12.6': {
    controlId: 'A.12.6',
    question: 'A CVE with CVSS 9.8 should be prioritized as:',
    options: [
      'Accept risk — patch next year',
      'Immediate remediation',
      '90-day window',
      'No action needed',
    ],
    correct: 1,
    explanation: 'Critical vulnerabilities (CVSS 9.0+) require immediate priority per triage guidelines.',
  },
  'A.13.1': {
    controlId: 'A.13.1',
    question: 'What is a core network security practice under A.13.1?',
    options: [
      'Flat network with guest WiFi on internal VLAN',
      'Network segmentation with VPN + MFA for remote access',
      'Open RDP port-forwarding without VPN',
      'Never reviewing firewall rules',
    ],
    correct: 1,
    explanation: 'Networks should be segmented, firewalled, and remote access secured via VPN with MFA.',
  },
  'A.14.2': {
    controlId: 'A.14.2',
    question: 'Which belongs in a secure SDLC under A.14.2?',
    options: [
      'Security testing only after customer complaints',
      'SAST, dependency scanning, and code review in CI/CD',
      'Skipping reviews to meet deadlines',
      'No vulnerability scanning of third-party libraries',
    ],
    correct: 1,
    explanation: 'Secure development includes SAST, dependency scans, code review, and pre-release testing.',
  },
  'A.16.1': {
    controlId: 'A.16.1',
    question: 'What is the FIRST action when detecting unauthorized login (A.16.1)?',
    options: [
      'Delete all logs immediately',
      'Isolate the affected system',
      'Email all customers before investigating',
      'Wait until business hours',
    ],
    correct: 1,
    explanation: 'Incident response starts with containment — isolate affected systems to limit damage.',
  },
  'A.17.1': {
    controlId: 'A.17.1',
    question: 'What must be defined in a business continuity plan under A.17.1?',
    options: [
      'Only the company holiday schedule',
      'RTO, RPO, backup testing, and DR drill procedures',
      'Marketing campaign timelines',
      'Office snack preferences',
    ],
    correct: 1,
    explanation: 'Continuity planning requires RTO/RPO targets, tested backups, and regular DR exercises.',
  },
  'A.18.1': {
    controlId: 'A.18.1',
    question: 'What does A.18.1 legal compliance require for EU customer data?',
    options: [
      'No contracts needed for data processors',
      'Data Processing Agreements (DPAs) with all processors',
      'Store data anywhere without review',
      'Ignore software licensing terms',
    ],
    correct: 1,
    explanation: 'Organizations must identify legal requirements including GDPR DPAs with data processors.',
  },
}

export function getQuizQuestionsForProgress(completedIds) {
  return completedIds
    .map((id) => CONTROL_QUIZ[id])
    .filter(Boolean)
}
