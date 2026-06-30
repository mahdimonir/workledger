export interface PlanDetail {
  id: 'FREE' | 'PRO' | 'AGENCY' | 'ENTERPRISE';
  name: string;
  price: string;
  numericPrice: number;
  frequency: string;
  desc: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanDetail[] = [
  {
    id: 'FREE',
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
    ]
  },
  {
    id: 'PRO',
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
    id: 'AGENCY',
    name: 'Agency Pro',
    price: '$79',
    numericPrice: 79,
    frequency: 'per month',
    desc: 'Perfect for growing agencies with complex multi-workspace needs.',
    features: [
      'Unlimited Workspaces',
      'Multi-tenant team invite controls',
      'Custom SMTP email domain sending',
      'White-labeled client portal domains',
      'Dedicated support channels'
    ]
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$299',
    numericPrice: 299,
    frequency: 'per month',
    desc: 'For large-scale consulting and operation teams.',
    features: [
      'Everything in Agency Pro',
      'Dedicated staging environments',
      'SLA uptime commitments',
      'Custom integrations & API access'
    ]
  }
];
