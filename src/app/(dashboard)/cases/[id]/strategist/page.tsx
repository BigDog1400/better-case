"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ChatInterface } from "@/components/legal/chat-interface";
import { mockCases } from "@/lib/mock-data";
import type { Case } from "@/lib/types";

export default function StrategistPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const { data: session, isPending } = authClient.useSession();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
      return;
    }

    // Load case data
    const loadCaseData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find case in mock data or create a new one for demo
      const foundCase = mockCases.find(c => c.id === caseId) || {
        ...mockCases[0],
        id: caseId
      };
      
      setCaseData(foundCase);
      setIsLoading(false);
    };

    if (session) {
      loadCaseData();
    }
  }, [session, isPending, router, caseId]);

  if (isPending || isLoading) {
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