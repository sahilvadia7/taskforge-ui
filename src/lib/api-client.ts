import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { useTenantStore } from "@/store/use-tenant-store";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Session cache to prevent multiple getSession() calls
let cachedSession: Awaited<ReturnType<typeof getSession>> | null = null;
let sessionCacheTime = 0;
let pendingSessionPromise: Promise<Awaited<ReturnType<typeof getSession>>> | null = null;
const SESSION_CACHE_TTL = 30000; // 30 seconds

async function getCachedSession() {
    const now = Date.now();

    // Return cached session if still valid
    if (cachedSession && (now - sessionCacheTime) < SESSION_CACHE_TTL) {
        return cachedSession;
    }

    // If there's already a pending request, wait for it (deduplication)
    if (pendingSessionPromise) {
        return pendingSessionPromise;
    }

    // Create new session request
    pendingSessionPromise = getSession().then(session => {
        cachedSession = session;
        sessionCacheTime = Date.now();
        pendingSessionPromise = null;
        return session;
    }).catch(error => {
        pendingSessionPromise = null;
        throw error;
    });

    return pendingSessionPromise;
}

// Clear session cache on logout or when session changes
export function clearSessionCache() {
    cachedSession = null;
    sessionCacheTime = 0;
    pendingSessionPromise = null;
}

apiClient.interceptors.request.use(
    async (config) => {
        const session = await getCachedSession();

        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        const currentTenant = useTenantStore.getState().currentTenant;
        if (currentTenant?.id) {
            config.headers["X-Tenant-Id"] = currentTenant.id;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            clearSessionCache(); // Clear cache on auth error

            console.error("Session expired or invalid. Logging out...");
            if (typeof window !== "undefined") {
                await signOut({ callbackUrl: "/auth/login" });
            }
        }

        if (error.response?.status === 403) {
            console.error("You do not have permission to perform this action.");
        }

        return Promise.reject(error);
    }
);

export default apiClient;
