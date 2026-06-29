import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  workspaceId: string;
  userId:      string;
  role:        string;
  plan:        string;
}


export const tenantContext = new AsyncLocalStorage<TenantStore>();
