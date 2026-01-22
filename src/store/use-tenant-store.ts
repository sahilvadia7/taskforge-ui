import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    role: string;
}

interface TenantStore {
    currentTenant: Tenant | null;
    setTenant: (tenant: Tenant | null) => void;
    clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>()(
    persist(
        (set) => ({
            currentTenant: null,
            setTenant: (tenant) => set({ currentTenant: tenant }),
            clearTenant: () => set({ currentTenant: null }),
        }),
        {
            name: "taskforge-tenant-storage",
        }
    )
);
