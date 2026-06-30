import { ClientHealth, InvoiceStatus, MilestoneStatus, NotificationType, Priority, PrismaClient, ProjectStatus, ProposalStatus, Role, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed with rich mock dataset...');

  await prisma.planDetail.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.taskComment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.proposalVersion.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.projectAssignment.deleteMany({});
  await prisma.projectStageHistory.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.oAuthAccount.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  console.log('Cleaned existing database tables.');

  
  const passwordHash = await bcrypt.hash('password123', 12);
  
  
  const adminUser = await prisma.user.create({
    data: {
      email:         'admin@workledger.io',
      name:          'Master Admin',
      passwordHash:  passwordHash,
      emailVerified: true,
      isSuperAdmin:  true,
    },
  });

  const mainUser = await prisma.user.create({
    data: {
      email:         'test@workledger.io',
      name:          'Nova Developer',
      passwordHash:  passwordHash,
      emailVerified: true,
    },
  });

  const colleague = await prisma.user.create({
    data: {
      email:         'sarah@workledger.io',
      name:          'Sarah Jenkins',
      passwordHash:  passwordHash,
      emailVerified: true,
    },
  });

  console.log('Created seed users: admin@workledger.io (SuperAdmin), test@workledger.io, and sarah@workledger.io');

  
  const adminWorkspace = await prisma.workspace.create({
    data: {
      name:            'WorkLedger System Admin',
      slug:            'system-admin',
      brandColor:      '#EF4444',
      invoicePrefix:   'WL-ADM',
      defaultCurrency: 'USD',
      businessName:    'WorkLedger Inc.',
      businessEmail:   'admin@workledger.io',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name:            'Nova Studio',
      slug:            'nova-studio',
      brandColor:      '#4F46E5',
      invoicePrefix:   'NS-INV',
      defaultCurrency: 'USD',
      defaultTaxRate:  15.00,
      businessName:    'Nova Creative Studio LLC',
      businessEmail:   'billing@novastudio.io',
      address:         '123 Creative Blvd, Suite 400, San Francisco, CA 94107',
      timezone:        'America/Los_Angeles',
    },
  });

  console.log('Created workspaces: System Admin and Nova Studio');

  await prisma.planDetail.createMany({
    data: [
      {
        key: 'FREE',
        name: 'Free Starter',
        price: '$0',
        numericPrice: 0,
        frequency: 'forever',
        desc: 'Ideal for solo operators establishing unified workspaces.',
        features: [
          '1 Workspace',
          'Up to 3 active clients',
          'Standard sequential invoicing',
          'Direct portal share links',
          'Zipped GDPR data export'
        ],
        popular: false
      },
      {
        key: 'PRO',
        name: 'Professional',
        price: '$29',
        numericPrice: 29,
        frequency: 'per month',
        desc: 'Perfect for collaborative teams needing role-based permissions.',
        features: [
          '1 Workspace',
          'Unlimited clients & projects',
          'Custom invoice sequence numbering',
          'Priority proposals versioning',
          'Advanced operations metrics',
          'File versioning history logs'
        ],
        popular: true
      },
      {
        key: 'ENTERPRISE',
        name: 'Enterprise',
        price: '$299',
        numericPrice: 299,
        frequency: 'per month',
        desc: 'For large-scale consulting, agency teams and enterprise operations.',
        features: [
          'Unlimited Workspaces',
          'Multi-tenant team invite controls',
          'Custom SMTP email domain sending',
          'White-labeled client portal domains',
          'Dedicated staging environments',
          'SLA uptime commitments',
          'Custom integrations & API access'
        ],
        popular: false
      }
    ]
  });
  console.log('Seeded platform plan details.');

  
  const adminOwnerMember = await prisma.member.create({
    data: {
      workspaceId: adminWorkspace.id,
      userId:      adminUser.id,
      role:        Role.OWNER,
      joinedAt:    new Date(),
    },
  });

  const ownerMember = await prisma.member.create({
    data: {
      workspaceId: workspace.id,
      userId:      mainUser.id,
      role:        Role.OWNER,
      joinedAt:    new Date(),
    },
  });

  const colleagueMember = await prisma.member.create({
    data: {
      workspaceId: workspace.id,
      userId:      colleague.id,
      role:        Role.MEMBER,
      joinedAt:    new Date(),
    },
  });

  const adminMember = await prisma.member.create({
    data: {
      workspaceId: workspace.id,
      userId:      adminUser.id,
      role:        Role.VIEWER,
      joinedAt:    new Date(),
    },
  });

  console.log('🔑 Created workspace memberships');

  
  const clientAcme = await prisma.client.create({
    data: {
      workspaceId:  workspace.id,
      name:         'Acme Corporation',
      company:      'Acme Corp',
      email:        'billing@acme.com',
      phone:        '+1 (555) 019-2834',
      timezone:     'America/New_York',
      country:      'United States',
      address:      '100 Industrial Parkway, Newark, NJ 07102',
      currency:     'USD',
      tags:         ['Enterprise', 'Tech'],
      notes:        'Key client for SaaS integrations. Prefers net-30 payments.',
      healthStatus: ClientHealth.ACTIVE,
      totalRevenue: 45000.00,
    },
  });

  const clientStark = await prisma.client.create({
    data: {
      workspaceId:  workspace.id,
      name:         'Tony Stark',
      company:      'Stark Industries',
      email:        'tony@stark.com',
      phone:        '+1 (555) 300-3000',
      timezone:     'America/Los_Angeles',
      country:      'United States',
      address:      '10880 Wilshire Blvd, Los Angeles, CA 90024',
      currency:     'USD',
      tags:         ['Premium', 'Aerospace'],
      notes:        'Demanding client but very high budget.',
      healthStatus: ClientHealth.ACTIVE,
      totalRevenue: 150000.00,
    },
  });

  const clientGlobex = await prisma.client.create({
    data: {
      workspaceId:  workspace.id,
      name:         'Hank Scorpio',
      company:      'Globex Corporation',
      email:        'info@globex.io',
      phone:        '+1 (555) 777-8888',
      timezone:     'Europe/London',
      country:      'United Kingdom',
      address:      'Cypress Creek HQ, London, UK',
      currency:     'GBP',
      tags:         ['International', 'Consulting'],
      notes:        'Currently struggling to align on product roadmap deliverables.',
      healthStatus: ClientHealth.AT_RISK,
      totalRevenue: 28000.00,
    },
  });

  const clientWonka = await prisma.client.create({
    data: {
      workspaceId:  workspace.id,
      name:         'Willy Wonka',
      company:      'Wonka Chocolate Factory',
      email:        'willy@wonkachoc.com',
      phone:        '+1 (555) 123-4567',
      timezone:     'Europe/Zurich',
      country:      'Switzerland',
      address:      'Sweet Lane 1, Zurich, Switzerland',
      currency:     'EUR',
      tags:         ['Retail', 'Churned'],
      notes:        'Project canceled due to supply chain issues.',
      healthStatus: ClientHealth.CHURNED,
      totalRevenue: 0.00,
    },
  });

  const clientWayne = await prisma.client.create({
    data: {
      workspaceId:  workspace.id,
      name:         'Bruce Wayne',
      company:      'Wayne Enterprises',
      email:        'bruce@wayne.com',
      phone:        '+1 (555) 909-0909',
      timezone:     'America/New_York',
      country:      'United States',
      address:      'Wayne Tower, Gotham City, NJ',
      currency:     'USD',
      tags:         ['Enterprise', 'Defense'],
      notes:        'Needs customized hardware integration. Very private.',
      healthStatus: ClientHealth.ACTIVE,
      totalRevenue: 350000.00,
    },
  });

  console.log('Created 5 clients');

  
  const projWeb = await prisma.project.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientAcme.id,
      name:           'Acme Website Redesign',
      description:    'Redesigning corporate website to improve signup conversion rates and modernize branding.',
      status:         ProjectStatus.IN_PROGRESS,
      currentStage:   'Design phase',
      startDate:      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      deadline:       new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), 
      estimatedValue: 25000.00,
      priority:       Priority.HIGH,
      shareToken:     'acme-web-share-token-123',
      shareEnabled:   true,
      createdBy:      mainUser.id,
      tags:           ['NextJS', 'UX/UI', 'Vercel'],
    },
  });

  const projApp = await prisma.project.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientStark.id,
      name:           'Stark Dashboard App',
      description:    'Building a secure, custom reactor monitoring dashboard desktop application.',
      status:         ProjectStatus.IN_PROGRESS,
      currentStage:   'Backend integration',
      startDate:      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline:       new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      estimatedValue: 85000.00,
      priority:       Priority.URGENT,
      shareToken:     'stark-reactor-dashboard-456',
      shareEnabled:   true,
      createdBy:      mainUser.id,
      tags:           ['React', 'Electron', 'Rust'],
    },
  });

  const projAudit = await prisma.project.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientGlobex.id,
      name:           'Security Infrastructure Audit',
      description:    'Auditing firewall rules, IAM roles, and database cluster encryption settings.',
      status:         ProjectStatus.REVIEW,
      currentStage:   'Report review',
      startDate:      new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      deadline:       new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
      estimatedValue: 12000.00,
      priority:       Priority.MEDIUM,
      shareToken:     'globex-security-audit-789',
      shareEnabled:   false,
      createdBy:      mainUser.id,
      tags:           ['Security', 'AWS', 'Audit'],
    },
  });

  const projLead = await prisma.project.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientWonka.id,
      name:           'Wonka Candy E-commerce Shop',
      description:    'Proposed Shopify Custom storefront integration for seasonal candies sales.',
      status:         ProjectStatus.LEAD,
      currentStage:   'Proposal negotiation',
      estimatedValue: 18000.00,
      priority:       Priority.LOW,
      shareToken:     'wonka-shop-lead-abc',
      shareEnabled:   true,
      createdBy:      mainUser.id,
      tags:           ['Shopify', 'E-commerce'],
    },
  });

  const projWayne = await prisma.project.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientWayne.id,
      name:           'Batcomputer UI Interface v2',
      description:    'Upgrading cryptographic communication terminal layouts and visual metrics.',
      status:         ProjectStatus.IN_PROGRESS,
      currentStage:   'Beta testing layout',
      startDate:      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      deadline:       new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      estimatedValue: 120000.00,
      priority:       Priority.URGENT,
      shareToken:     'wayne-batcomputer-v2-xyz',
      shareEnabled:   true,
      createdBy:      mainUser.id,
      tags:           ['Cryptographic', 'GUI', 'Dark-Mode'],
    },
  });

  console.log('🚀 Created 5 projects');

  
  await prisma.projectStageHistory.createMany({
    data: [
      {
        projectId: projWeb.id,
        fromStage: 'Kickoff',
        toStage:   'Design phase',
        note:      'Wireframes signed off by client Acme Corp.',
        changedBy: mainUser.name,
      },
      {
        projectId: projApp.id,
        fromStage: 'Setup',
        toStage:   'Backend integration',
        note:      'Provisioned AWS staging cluster.',
        changedBy: colleague.name,
      },
      {
        projectId: projAudit.id,
        fromStage: 'Testing',
        toStage:   'Report review',
        note:      'Draft audit report submitted for final review.',
        changedBy: mainUser.name,
      },
      {
        projectId: projWayne.id,
        fromStage: 'Development',
        toStage:   'Beta testing layout',
        note:      'Delivered first beta cryptographic build.',
        changedBy: mainUser.name,
      },
    ],
  });

  
  await prisma.projectAssignment.createMany({
    data: [
      {
        projectId:  projWeb.id,
        memberId:   ownerMember.id,
        role:       'Lead Developer & Designer',
        assignedBy: mainUser.id,
      },
      {
        projectId:  projWeb.id,
        memberId:   colleagueMember.id,
        role:       'QA Engineer',
        assignedBy: mainUser.id,
      },
      {
        projectId:  projApp.id,
        memberId:   ownerMember.id,
        role:       'Lead Rust Engineer',
        assignedBy: mainUser.id,
      },
      {
        projectId:  projWayne.id,
        memberId:   ownerMember.id,
        role:       'Principal GUI Designer',
        assignedBy: mainUser.id,
      },
    ],
  });

  console.log('Assigned members and logged stage history');

  
  const m1 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      name:        'Milestone 1: Wireframes and Design Mockups',
      description: 'Completion of mobile and desktop UI designs in Figma.',
      dueDate:     new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.APPROVED,
      completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      approvedAt:  new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      approvedBy:  'Acme Billing Contact',
      order:       1,
      createdBy:   mainUser.id,
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      name:        'Milestone 2: Core Frontend Development',
      description: 'Developing responsive UI layout and landing page template with animations.',
      dueDate:     new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.IN_PROGRESS,
      order:       2,
      createdBy:   mainUser.id,
    },
  });

  const m3 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      name:        'Milestone 3: CMS & Integration Testing',
      description: 'Integrating CMS and performing final performance optimization checks.',
      dueDate:     new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.PENDING,
      order:       3,
      createdBy:   mainUser.id,
    },
  });

  const starkM1 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projApp.id,
      name:        'Phase 1: Security Architecture and Core API',
      description: 'Setting up client encryption modules and basic reactor telemetry listener.',
      dueDate:     new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.IN_PROGRESS,
      order:       1,
      createdBy:   mainUser.id,
    },
  });

  const wayneM1 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWayne.id,
      name:        'Phase 1: Crypto Terminal Layout',
      description: 'Design mockups and UI layout config.',
      dueDate:     new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.APPROVED,
      completedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      approvedAt:  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      approvedBy:  'Alfred Pennyworth',
      order:       1,
      createdBy:   mainUser.id,
    },
  });

  const wayneM2 = await prisma.milestone.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWayne.id,
      name:        'Phase 2: Signal Telemetry Dashboard',
      description: 'Display visual graphs for satellite frequencies.',
      dueDate:     new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status:      MilestoneStatus.REVISION_REQUESTED,
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      revisionNote: 'Dark mode contrast is slightly low on high-res monitors.',
      order:       2,
      createdBy:   mainUser.id,
    },
  });

  console.log('Created milestones');

  
  const task1 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      title:       'Design high-fidelity Figma mockups',
      description: 'Need mockups for landing page, pricing page, and contact form.',
      status:      TaskStatus.DONE,
      priority:    Priority.HIGH,
      assigneeId:  mainUser.id,
      dueDate:     new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      order:       1,
      isInternal:  false,
      createdBy:   mainUser.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      title:       'Initialize Next.js repository & configure Tailwind',
      description: 'Setup standard pnpm workspace config, ESLint, and PostCSS plugins.',
      status:      TaskStatus.DONE,
      priority:    Priority.MEDIUM,
      assigneeId:  mainUser.id,
      dueDate:     new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      order:       2,
      isInternal:  true,
      createdBy:   mainUser.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      title:       'Implement landing page layout hero section',
      description: 'Build hero section with complex GSAP scroll animations.',
      status:      TaskStatus.IN_PROGRESS,
      priority:    Priority.HIGH,
      assigneeId:  mainUser.id,
      dueDate:     new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      order:       3,
      isInternal:  false,
      createdBy:   mainUser.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      title:       'Verify mobile navigation responsiveness',
      description: 'Check navigation toggle menu breaks nicely at 768px screens.',
      status:      TaskStatus.TODO,
      priority:    Priority.LOW,
      assigneeId:  colleague.id,
      dueDate:     new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      order:       4,
      isInternal:  false,
      createdBy:   mainUser.id,
    },
  });

  
  await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId:   projWeb.id,
      parentId:    task3.id,
      title:       'Optimize hero layout images assets',
      description: 'Resize assets to WEBP format and run clean_comments cleaner script.',
      status:      TaskStatus.IN_PROGRESS,
      priority:    Priority.MEDIUM,
      assigneeId:  colleague.id,
      order:       1,
      isInternal:  true,
      createdBy:   mainUser.id,
    },
  });

  
  await prisma.task.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId:   projWayne.id,
        title:       'Audit satellite cryptographic keys',
        description: 'Verify 2048-bit RSA encryption on frequencies channels.',
        status:      TaskStatus.DONE,
        priority:    Priority.URGENT,
        assigneeId:  mainUser.id,
        dueDate:     new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        order:       1,
        isInternal:  true,
        createdBy:   mainUser.id,
      },
      {
        workspaceId: workspace.id,
        projectId:   projWayne.id,
        title:       'Improve GUI panel contrast triggers',
        description: 'Update visual borders matching Alfredo feedback.',
        status:      TaskStatus.IN_PROGRESS,
        priority:    Priority.HIGH,
        assigneeId:  mainUser.id,
        dueDate:     new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        order:       2,
        isInternal:  false,
        createdBy:   mainUser.id,
      },
    ],
  });

  console.log('Created tasks and subtasks');

  
  await prisma.taskComment.createMany({
    data: [
      {
        taskId:      task3.id,
        workspaceId: workspace.id,
        content:     'Added the GSAP layout, testing performance metrics on low-end devices.',
        authorId:    mainUser.id,
      },
      {
        taskId:      task3.id,
        workspaceId: workspace.id,
        content:     'Looks good, please make sure scroll triggers are properly disabled on touchscreens.',
        authorId:    colleague.id,
      },
    ],
  });

  
  const propDraft = await prisma.proposal.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientAcme.id,
      title:          'Proposal for Acme E-learning Platform Expansion',
      introduction:   'We propose building a fully customized learning management system tailored to Acme training standards.',
      currency:       'USD',
      discountAmount: 1500.00,
      subtotal:       35000.00,
      taxTotal:       5025.00, 
      total:          38525.00,
      status:         ProposalStatus.DRAFT,
      viewToken:      'proposal-acme-draft-xyz',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'LMS Platform Architecture Setup', quantity: 1, rate: 8000, taxRate: 15 },
        { description: 'Custom Video Player Integration', quantity: 1, rate: 12000, taxRate: 15 },
        { description: 'SSO & Multi-Tenant Database Architecture', quantity: 1, rate: 15000, taxRate: 15 },
      ] as any,
    },
  });

  const propSent = await prisma.proposal.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientGlobex.id,
      title:          'Consulting Proposal: Security Vulnerability Remediation',
      introduction:   'Comprehensive security remediation plan fixing infrastructure loop holes flagged during auditing.',
      currency:       'GBP',
      subtotal:       15000.00,
      taxTotal:       2250.00,
      total:          17250.00,
      status:         ProposalStatus.SENT,
      viewToken:      'proposal-globex-sent-abc',
      sentAt:         new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'IAM policies and AWS KMS keys rotation', quantity: 1, rate: 5000, taxRate: 15 },
        { description: 'Database cluster SSL enforcement and firewall', quantity: 1, rate: 10000, taxRate: 15 },
      ] as any,
    },
  });

  const propAccepted = await prisma.proposal.create({
    data: {
      workspaceId:          workspace.id,
      clientId:             clientStark.id,
      title:                'Arc Reactor Telemetry Dashboard Development Proposal',
      introduction:         'Custom reactor data visualizer and logging desktop program for Stark Industries HQ.',
      currency:             'USD',
      subtotal:             85000.00,
      taxTotal:             12750.00,
      total:                97750.00,
      status:               ProposalStatus.ACCEPTED,
      viewToken:            'proposal-stark-accepted-999',
      sentAt:               new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      viewedAt:             new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      acceptedAt:           new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      acceptedBy:           'Virginia Potts',
      acceptedIp:           '192.168.10.104',
      convertedToProjectId: projApp.id,
      createdBy:            mainUser.id,
      lineItems:            [
        { description: 'High-throughput Rust listener backend service', quantity: 1, rate: 45000, taxRate: 15 },
        { description: 'Electron UI with canvas real-time plots panels', quantity: 1, rate: 40000, taxRate: 15 },
      ] as any,
    },
  });

  const propWayne = await prisma.proposal.create({
    data: {
      workspaceId:          workspace.id,
      clientId:             clientWayne.id,
      title:                'Proposal for Batcomputer Interface Suite Upgrade',
      introduction:         'We present a dark-themed visual upgrades proposal for the Batcomputer core layout visual interfaces.',
      currency:             'USD',
      subtotal:             120000.00,
      taxTotal:             18000.00,
      total:                138000.00,
      status:               ProposalStatus.ACCEPTED,
      viewToken:            'proposal-wayne-accepted-777',
      sentAt:               new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      viewedAt:             new Date(Date.now() - 68 * 24 * 60 * 60 * 1000),
      acceptedAt:           new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      acceptedBy:           'Alfred Pennyworth',
      convertedToProjectId: projWayne.id,
      createdBy:            mainUser.id,
      lineItems:            [
        { description: 'Encryption tunnels monitoring visually', quantity: 1, rate: 50000, taxRate: 15 },
        { description: 'Satellite visual interface charts engine upgrade', quantity: 1, rate: 70000, taxRate: 15 },
      ] as any,
    },
  });

  console.log('Created proposals');

  
  await prisma.proposalVersion.createMany({
    data: [
      {
        proposalId: propAccepted.id,
        version:    1,
        snapshot:   { title: propAccepted.title, total: 97750 } as any,
        savedBy:    mainUser.name,
      },
      {
        proposalId: propWayne.id,
        version:    1,
        snapshot:   { title: propWayne.title, total: 138000 } as any,
        savedBy:    mainUser.name,
      },
    ],
  });

  
  const invPaid = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientAcme.id,
      projectId:      projWeb.id,
      milestoneId:    m1.id,
      invoiceNumber:  'INV-001',
      status:         InvoiceStatus.PAID,
      currency:       'USD',
      subtotal:       8000.00,
      taxTotal:       1200.00,
      total:          9200.00,
      amountPaid:     9200.00,
      amountDue:      0.00,
      dueDate:        new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      sentAt:         new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      viewedAt:       new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
      viewedCount:    3,
      paidAt:         new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-acme-paid-111',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Completed Wireframes & UI Figma Mockups Delivery', quantity: 1, rate: 8000, taxRate: 15 },
      ] as any,
    },
  });

  const invOverdue = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientGlobex.id,
      projectId:      projAudit.id,
      invoiceNumber:  'INV-002',
      status:         InvoiceStatus.OVERDUE,
      currency:       'GBP',
      subtotal:       12000.00,
      taxTotal:       1800.00,
      total:          13800.00,
      amountPaid:     0.00,
      amountDue:      13800.00,
      dueDate:        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
      sentAt:         new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      viewedAt:       new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      viewedCount:    2,
      remindersSent:  1,
      lastReminderAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-globex-overdue-222',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Security Audits deliverables and findings report', quantity: 1, rate: 12000, taxRate: 15 },
      ] as any,
    },
  });

  const invSent = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientStark.id,
      projectId:      projApp.id,
      invoiceNumber:  'INV-003',
      status:         InvoiceStatus.SENT,
      currency:       'USD',
      subtotal:       35000.00,
      taxTotal:       5250.00,
      total:          40250.00,
      amountPaid:     0.00,
      amountDue:      40250.00,
      dueDate:        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      sentAt:         new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-stark-sent-333',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Setup development cluster and telemetry interfaces spec', quantity: 1, rate: 35000, taxRate: 15 },
      ] as any,
    },
  });

  const invDraft = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientAcme.id,
      projectId:      projWeb.id,
      invoiceNumber:  'INV-004',
      status:         InvoiceStatus.DRAFT,
      currency:       'USD',
      subtotal:       15000.00,
      taxTotal:       2250.00,
      total:          17250.00,
      amountPaid:     0.00,
      amountDue:      17250.00,
      dueDate:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-acme-draft-444',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Completed Frontend templates code codebase deliverable', quantity: 1, rate: 15000, taxRate: 15 },
      ] as any,
    },
  });

  const invWaynePaid = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientWayne.id,
      projectId:      projWayne.id,
      milestoneId:    wayneM1.id,
      invoiceNumber:  'INV-005',
      status:         InvoiceStatus.PAID,
      currency:       'USD',
      subtotal:       50000.00,
      taxTotal:       7500.00,
      total:          57500.00,
      amountPaid:     57500.00,
      amountDue:      0.00,
      dueDate:        new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      sentAt:         new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      viewedAt:       new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
      viewedCount:    1,
      paidAt:         new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-wayne-paid-555',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Completion of Crypto Terminal layout design and specs', quantity: 1, rate: 50000, taxRate: 15 },
      ] as any,
    },
  });

  const invWayneSent = await prisma.invoice.create({
    data: {
      workspaceId:    workspace.id,
      clientId:       clientWayne.id,
      projectId:      projWayne.id,
      invoiceNumber:  'INV-006',
      status:         InvoiceStatus.SENT,
      currency:       'USD',
      subtotal:       70000.00,
      taxTotal:       10500.00,
      total:          80500.00,
      amountPaid:     0.00,
      amountDue:      80500.00,
      dueDate:        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      sentAt:         new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      viewToken:      'invoice-wayne-sent-666',
      createdBy:      mainUser.id,
      lineItems:      [
        { description: 'Core frequency Visual visual charts engine integration', quantity: 1, rate: 70000, taxRate: 15 },
      ] as any,
    },
  });

  console.log('Created 6 invoices');

  
  await prisma.payment.createMany({
    data: [
      {
        workspaceId: workspace.id,
        invoiceId:   invPaid.id,
        amount:      9200.00,
        currency:    'USD',
        method:      'Stripe Card',
        reference:   'ch_1N9eX2Lkd8d39f',
        note:        'Automatic online payment processed successfully.',
        paidAt:      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        recordedBy:  'Stripe integration',
      },
      {
        workspaceId: workspace.id,
        invoiceId:   invWaynePaid.id,
        amount:      57500.00,
        currency:    'USD',
        method:      'Wire Transfer',
        reference:   'tx_998188172901',
        note:        'Batman billing desk transfer complete.',
        paidAt:      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        recordedBy:  'Alfred Pennyworth',
      },
    ],
  });

  
  await prisma.expense.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId:   projWeb.id,
        description: 'Vercel Pro Subscription (3 months)',
        amount:      60.00,
        currency:    'USD',
        category:    'Hosting & Infrastructure',
        incurredAt:  new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        isBillable:  false,
        createdBy:   mainUser.id,
      },
      {
        workspaceId: workspace.id,
        projectId:   projWeb.id,
        description: 'Figma Professional Team seat license upgrade',
        amount:      45.00,
        currency:    'USD',
        category:    'Software Licenses',
        incurredAt:  new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        isBillable:  true,
        createdBy:   mainUser.id,
      },
      {
        workspaceId: workspace.id,
        projectId:   projApp.id,
        description: 'AWS GPU EC2 Testing Node Clusters',
        amount:      1250.00,
        currency:    'USD',
        category:    'Cloud Infrastructure',
        incurredAt:  new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isBillable:  true,
        createdBy:   mainUser.id,
      },
    ],
  });

  console.log('💰 Recorded payments & expenses');

  
  await prisma.file.createMany({
    data: [
      {
        id:            'figma-file-123',
        workspaceId:   workspace.id,
        projectId:     projWeb.id,
        milestoneId:   m1.id,
        name:          'Acme UI High-Fidelity Mockups.figma',
        key:           'uploads/nova-studio/acme/ui-mockups.figma',
        url:           'https://figma.com/file/1a2b3c4d5e6f',
        mimeType:      'application/figma',
        sizeBytes:     4580122,
        isDeliverable: true,
        uploadedBy:    mainUser.name,
      },
      {
        id:            'contract-file-456',
        workspaceId:   workspace.id,
        projectId:     projApp.id,
        name:          'Stark Dashboard Signoff Agreement.pdf',
        key:           'uploads/nova-studio/stark/signoff-agreement.pdf',
        url:           'https://s3.amazonaws.com/workledger-files/signoff.pdf',
        mimeType:      'application/pdf',
        sizeBytes:     1050228,
        isDeliverable: false,
        uploadedBy:    mainUser.name,
      },
    ],
  });

  
  await prisma.comment.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId:   projWeb.id,
        content:     'Cleaned all TS compilation warnings in landing layout templates. Please review!',
        authorName:  colleague.name,
        authorType:  'MEMBER',
        isInternal:  true,
      },
      {
        workspaceId: workspace.id,
        projectId:   projWeb.id,
        content:     'Looks wonderful. Staged to staging branch and tested animations. Smooth!',
        authorName:  mainUser.name,
        authorType:  'MEMBER',
        isInternal:  true,
      },
      {
        workspaceId: workspace.id,
        projectId:   projWeb.id,
        content:     'Could we change the secondary color to a slightly darker shade of indigo?',
        authorName:  'Acme Review Contact',
        authorType:  'CLIENT',
        isInternal:  false,
      },
    ],
  });

  console.log('📎 Created attachments and workspace comments');

  
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        type:        NotificationType.INVOICE_SENT,
        title:       'Invoice INV-003 sent',
        body:        'Invoice NS-INV-003 for $40,250.00 was successfully emailed to Stark Industries.',
        entityType:  'Invoice',
        entityId:    invSent.id,
        link:        `/invoices/${invSent.id}`,
        isRead:      false,
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        type:        NotificationType.INVOICE_VIEWED,
        title:       'Invoice INV-002 viewed',
        body:        'Globex Corporation viewed Invoice NS-INV-002 (Security Infrastructure Audit).',
        entityType:  'Invoice',
        entityId:    invOverdue.id,
        link:        `/invoices/${invOverdue.id}`,
        isRead:      false,
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        type:        NotificationType.PROPOSAL_ACCEPTED,
        title:       'Telemetry proposal accepted!',
        body:        'Tony Stark accepted proposal "Arc Reactor Telemetry Dashboard Development Proposal".',
        entityType:  'Proposal',
        entityId:    propAccepted.id,
        link:        `/proposals/${propAccepted.id}`,
        isRead:      true,
        readAt:      new Date(),
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        type:        NotificationType.NEW_COMMENT,
        title:       'New client feedback comment',
        body:        'Acme Review Contact added a feedback comment on Acme Website Redesign.',
        entityType:  'Comment',
        link:        `/projects/${projWeb.id}/comments`,
        isRead:      false,
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        type:        NotificationType.MILESTONE_REVISION,
        title:       'Milestone revision requested',
        body:        'Bruce Wayne requested revisions for Phase 2: Signal Telemetry Dashboard.',
        entityType:  'Milestone',
        link:        `/projects/${projWayne.id}/milestones`,
        isRead:      false,
      },
    ],
  });

  
  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        userEmail:   mainUser.email,
        action:      'USER_LOGIN',
        entityType:  'User',
        entityId:    mainUser.id,
        entityLabel: mainUser.name,
        ipAddress:   '127.0.0.1',
        meta:        { description: 'User test@workledger.io logged in successfully from Chrome.', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } as any,
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        userEmail:   mainUser.email,
        action:      'CREATED',
        entityType:  'Invoice',
        entityId:    invSent.id,
        entityLabel: invSent.invoiceNumber,
        ipAddress:   '127.0.0.1',
        meta:        { description: 'Created invoice NS-INV-003 linked to Stark Dashboard App.', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } as any,
      },
      {
        workspaceId: workspace.id,
        userId:      mainUser.id,
        userEmail:   mainUser.email,
        action:      'PROJECT_STAGE_CHANGED',
        entityType:  'Project',
        entityId:    projWayne.id,
        entityLabel: projWayne.name,
        ipAddress:   '127.0.0.1',
        meta:        { description: 'Moved Batcomputer UI Interface v2 to Beta testing stage.', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' } as any,
      },
    ],
  });

  console.log('Created notifications and audit logs');

  console.log('Seed database successfully populated with large realistic testing data!');
}

main()
  .catch((e) => {
    console.error('Error during seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
