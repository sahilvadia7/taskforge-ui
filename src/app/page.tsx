"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useTenantStore } from "@/store/use-tenant-store";
import { LandingPage } from "@/components/landing/landing-page";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const { currentTenant } = useTenantStore();

  useEffect(() => {
    if (status === "authenticated") {
      if (currentTenant) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [status, currentTenant, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
    </div>
  );
}
