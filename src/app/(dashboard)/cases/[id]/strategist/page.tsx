"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { ChatInterface } from "@/components/legal/chat-interface";
import type { Case } from "@prisma/client"; // Import Case from Prisma client

export default function StrategistPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  
  const { data: caseData, isLoading: isCaseLoading } = api.case.getById.useQuery(
    { id: caseId },
    { enabled: !!session } // Only fetch if session exists
  );

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isCaseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !caseData) {
    return null;
  }

  const handleBack = () => {
    router.push(`/cases/${caseId}`);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <ChatInterface 
        caseData={caseData}
        onBack={handleBack}
      />
    </div>
  );
}
