
export enum Plan {
  FREE       = 'FREE',
  PRO        = 'PRO',
  AGENCY     = 'AGENCY',
  ENTERPRISE = 'ENTERPRISE',
}

export enum Role {
  OWNER   = 'OWNER',
  MANAGER = 'MANAGER',
  MEMBER  = 'MEMBER',
  VIEWER  = 'VIEWER',
}

export enum ProjectStatus {
  LEAD        = 'LEAD',
  KICKOFF     = 'KICKOFF',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW      = 'REVIEW',
  REVISION    = 'REVISION',
  DELIVERED   = 'DELIVERED',
  CLOSED      = 'CLOSED',
}

export enum InvoiceStatus {
  DRAFT           = 'DRAFT',
  SENT            = 'SENT',
  VIEWED          = 'VIEWED',
  PARTIALLY_PAID  = 'PARTIALLY_PAID',
  PAID            = 'PAID',
  OVERDUE         = 'OVERDUE',
  CANCELLED       = 'CANCELLED',
}

export enum Priority {
  LOW    = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH   = 'HIGH',
  URGENT = 'URGENT',
}

export enum ProposalStatus {
  DRAFT    = 'DRAFT',
  SENT     = 'SENT',
  VIEWED   = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED  = 'EXPIRED',
}

export enum MilestoneStatus {
  PENDING            = 'PENDING',
  IN_PROGRESS        = 'IN_PROGRESS',
  COMPLETE           = 'COMPLETE',
  APPROVED           = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum TaskStatus {
  TODO        = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW   = 'IN_REVIEW',
  DONE        = 'DONE',
  CANCELLED   = 'CANCELLED',
}


export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiResponse<T[]>['meta'] & {
    total:   number;
    page:    number;
    limit:   number;
    hasNext: boolean;
  };
}
