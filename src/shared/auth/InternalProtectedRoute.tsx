"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useInternalAuth } from "./InternalAuthProvider";
import { LoadingScreen } from "@/src/shared/ui/LoadingScreen";
import type { InternalRole } from "@/src/shared/types/internal";

export function InternalProtectedRoute({
  children,
  allowedRoles = ["owner_staff", "technician"],
}: {
  children: React.ReactNode;
  allowedRoles?: InternalRole[];
}) {
  const router = useRouter();
  const { user, isLoading } = useInternalAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/staff/login");
    else if (!allowedRoles.includes(user.role)) router.replace("/dashboard");
  }, [allowedRoles, isLoading, router, user]);

  if (isLoading) return <LoadingScreen />;
  if (!user || !allowedRoles.includes(user.role)) return <LoadingScreen label="Redirecting..." />;
  return <>{children}</>;
}
