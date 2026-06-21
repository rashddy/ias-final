export const READ_CONTENT = {
  'A.5.2': {
    why: 'Without clearly defined security roles, accountability breaks down and critical tasks fall through the cracks. ISO 27001 requires that information security responsibilities are assigned at all levels of the organization.',
    requirements: [
      'Appoint a CISO or equivalent with authority to implement the ISMS',
      'Define security champions in each business unit',
      'Maintain a RACI matrix mapping roles to security activities',
      'Enforce segregation of duties — no single person controls an entire process',
      'Document responsibilities in job descriptions and employment contracts',
    ],
    example: 'Acme Corp assigns a CISO reporting to the CEO, security champions in HR/Finance/Engineering, and a quarterly RACI review. Developers cannot approve their own production deployments.',
    mistakes: [
      'Making the IT helpdesk solely responsible for all security decisions',
      'No documented RACI — everyone assumes someone else handles it',
      'Allowing one person to both request and approve access changes',
    ],
  },
  'A.5.9': {
    why: 'You cannot protect assets you do not know exist. An asset inventory is the foundation for risk assessment, access control, and incident response.',
    requirements: [
      'Maintain a register of all information assets (hardware, software, data, services)',
      'Assign an owner to every asset who is accountable for its protection',
      'Apply classification labels (Public, Internal, Confidential, Restricted)',
      'Review and update the inventory at least annually',
      'Include cloud services and SaaS applications in scope',
    ],
    example: 'TechFlow maintains a CMDB with 2,400 assets. Each entry includes owner, classification, location, and last review date. New SaaS tools require asset registration before procurement approval.',
    mistakes: [
      'Inventory only covers servers — ignoring laptops, USB drives, and cloud data',
      'Assets listed without owners or with outdated ownership',
      'No classification applied — treating all data as equally sensitive',
    ],
  },
  'A.6.3': {
    why: 'Human error causes the majority of security breaches. Regular awareness training ensures employees recognize threats and follow security policies.',
    requirements: [
      'Deliver annual security awareness training to all personnel',
      'Run simulated phishing campaigns and track click rates',
      'Require signed acknowledgment of the Acceptable Use Policy',
      'Maintain training records with completion dates for audit evidence',
      'Provide role-specific training for privileged users and developers',
    ],
    example: 'GlobalBank runs quarterly phishing simulations. Employees who click are enrolled in remedial training. 98% completion rate is required before annual bonus eligibility.',
    mistakes: [
      'One-time training at onboarding with no refresher courses',
      'No phishing simulations — staff never practice spotting real attacks',
      'Training records stored informally with no audit trail',
    ],
  },
  'A.7.4': {
    why: 'Physical access controls prevent unauthorized individuals from reaching systems, data, and sensitive areas. Monitoring provides evidence and deterrence.',
    requirements: [
      'Deploy CCTV covering entry points and server rooms',
      'Maintain visitor logs with escort requirements',
      'Use badge access systems with role-based zone permissions',
      'Enforce clean desk and clear screen policies',
      'Restrict server room access to authorized personnel only',
    ],
    example: 'SecureData Ltd uses RFID badges with 3 security zones. Server room requires dual authentication. CCTV footage retained for 90 days. Visitors sign in and wear visible badges.',
    mistakes: [
      'Tailgating allowed — doors propped open for convenience',
      'No visitor log or escort policy for contractors',
      'Server room accessible with a shared PIN code on the door',
    ],
  },
  'A.8.1': {
    why: 'Endpoints are the most common attack vector. Unmanaged devices can introduce malware, leak data, and bypass network controls.',
    requirements: [
      'Deploy MDM/EMM on all corporate and BYOD devices',
      'Require full-disk encryption on laptops and mobile devices',
      'Define and enforce a BYOD policy with minimum security standards',
      'Enable remote wipe capability for lost or stolen devices',
      'Patch operating systems and applications within defined SLAs',
    ],
    example: 'CloudNine uses Intune MDM. All laptops must have BitLocker enabled. BYOD devices get a corporate container. Devices not patched within 14 days are blocked from VPN.',
    mistakes: [
      'Allowing personal devices on the network without MDM enrollment',
      'No encryption requirement for laptops containing customer data',
      'Patching deferred indefinitely due to "business urgency"',
    ],
  },
  'A.8.3': {
    why: 'Not everyone needs access to everything. Restricting access based on role and data classification limits the blast radius of breaches and insider threats.',
    requirements: [
      'Apply need-to-know and least-privilege principles',
      'Implement Role-Based Access Control (RBAC) aligned to job functions',
      'Label data by classification and enforce access accordingly',
      'Conduct access reviews at least quarterly for privileged accounts',
      'Log and monitor access to confidential and restricted data',
    ],
    example: 'Finance team members access only Finance systems. HR data is restricted to HR roles. Quarterly access reviews flag orphaned accounts. Confidential files require MFA to open.',
    mistakes: [
      'Shared departmental login accounts instead of individual credentials',
      'Access granted based on requests without role validation',
      'No periodic review — ex-employees retain access for months',
    ],
  },
  'A.12.1': {
    why: 'Consistent operational procedures reduce errors, enable auditability, and ensure changes do not introduce security vulnerabilities.',
    requirements: [
      'Document runbooks for all critical IT operations',
      'Implement formal change management with approval workflows',
      'Separate development, testing, and production environments',
      'Plan capacity to prevent outages that could affect security controls',
      'Define backup and recovery procedures with tested restore processes',
    ],
    example: 'DevOps Inc requires CAB approval for all production changes. Developers cannot deploy directly to prod. Runbooks cover 40 critical services. DR tested twice yearly.',
    mistakes: [
      'Production changes made directly without change tickets',
      'Developers have admin access to production databases',
      'No documented procedures — knowledge held by one senior engineer',
    ],
  },
  'A.12.4': {
    why: 'Logs provide the evidence needed to detect breaches, investigate incidents, and demonstrate compliance during audits.',
    requirements: [
      'Log authentication events, admin actions, and system errors',
      'Retain logs for a minimum of 12 months (longer for regulated data)',
      'Centralize logs in a SIEM for correlation and alerting',
      'Protect log integrity — prevent tampering or unauthorized deletion',
      'Review logs regularly and investigate anomalies',
    ],
    example: 'LogSafe aggregates logs from 200 servers into Splunk. Login failures trigger alerts after 5 attempts. Logs are write-once stored for 18 months. SOC reviews dashboards daily.',
    mistakes: [
      'Logging disabled on systems to save disk space',
      'Logs stored locally on each server with no central collection',
      'No one reviews logs until after a major breach occurs',
    ],
  },
  'A.13.1': {
    why: 'Network segmentation limits lateral movement during attacks. Proper network design is a fundamental layer of defense.',
    requirements: [
      'Segment networks by trust level (DMZ, internal, management)',
      'Deploy firewalls with deny-by-default rules between segments',
      'Require VPN with MFA for all remote access',
      'Secure wireless with WPA3 and separate guest networks',
      'Review firewall rules quarterly and remove unused rules',
    ],
    example: 'NetCorp uses a 3-tier architecture: DMZ for web servers, internal VLANs per department, isolated management network. All remote staff connect via VPN with certificate + MFA.',
    mistakes: [
      'Flat network — all devices on one VLAN including guest WiFi',
      'Firewall rules accumulated over years with no review',
      'Remote access via RDP port-forwarding without VPN',
    ],
  },
  'A.14.2': {
    why: 'Security built into the development lifecycle is far cheaper than fixing vulnerabilities after release. ISO 27001 expects secure SDLC practices.',
    requirements: [
      'Define security gates at design, development, and release phases',
      'Require peer code review for all changes to production code',
      'Run Static Application Security Testing (SAST) in CI/CD pipelines',
      'Scan third-party dependencies for known vulnerabilities',
      'Perform security testing (pen test or DAST) before major releases',
    ],
    example: 'AppWorks integrates SonarQube SAST and Dependabot into GitHub Actions. No merge to main without passing security scan. Annual pen test before major product launches.',
    mistakes: [
      'Security testing only happens after a customer reports a bug',
      'No dependency scanning — running libraries with known CVEs',
      'Developers skip code review under deadline pressure',
    ],
  },
  'A.17.1': {
    why: 'Disruptions happen — ransomware, natural disasters, power failures. Continuity planning ensures critical security functions survive and recover.',
    requirements: [
      'Define BCP scope covering critical information security processes',
      'Set Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)',
      'Test backup restoration procedures at least annually',
      'Conduct disaster recovery drills with documented results',
      'Assign continuity roles and maintain emergency contact lists',
    ],
    example: 'ResilientIT defines RTO of 4 hours for authentication systems. Backups tested monthly. Full DR drill every 6 months. Failover to secondary datacenter validated in Q2 2025.',
    mistakes: [
      'Backups exist but have never been tested for restore',
      'No defined RTO/RPO — recovery timelines are unknown',
      'BCP document written once and never updated or exercised',
    ],
  },
  'A.18.1': {
    why: 'Organizations must comply with laws (GDPR, HIPAA), contracts (customer SLAs, DPAs), and licensing terms. Non-compliance carries legal and financial penalties.',
    requirements: [
      'Maintain a register of applicable legal and regulatory requirements',
      'Execute Data Processing Agreements (DPAs) with all processors',
      'Track software licenses and ensure compliance with vendor terms',
      'Assess export control requirements for cross-border data transfers',
      'Include audit rights in contracts with critical suppliers',
    ],
    example: 'LegalTech maintains a compliance register updated quarterly. All EU customer data processing covered by signed DPAs. Software asset management tracks 450 license entitlements.',
    mistakes: [
      'Using personal Gmail for business customer data without a DPA',
      'No awareness of GDPR obligations when serving EU customers',
      'Software installed beyond licensed seat count with no tracking',
    ],
  },
}
