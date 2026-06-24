import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  workspaceId: string;
  userId:      string;
  role:        string;
  plan:        string;
}

// Single instance — lives for the lifetime of the process
export const tenantContext = new AsyncLocalStorage<TenantStore>();
