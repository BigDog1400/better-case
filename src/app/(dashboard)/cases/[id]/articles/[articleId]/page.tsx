"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { LegalArticleViewer } from "@/components/legal/legal-article-viewer";
import type { UserLinkedLaw } from "@prisma/client";

// Define a type for the article data to be passed to LegalArticleViewer
interface LegalArticle {
  id: string;
  title: string;
  articleNumber: string;
  fullText: string; // This will be a placeholder for now
  lawCode: string;
  category: string; // Placeholder or derived from lawCode
}

export default function ArticleViewerPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const articleId = params.articleId as string; // This is actually userLinkedLawId
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  
  const { data: userLinkedLaw, isLoading: isUserLinkedLawLoading } = api.userLinkedLaw.getById.useQuery(
    { id: articleId },
    { enabled: !!session }
  );

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending || isUserLinkedLawLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !userLinkedLaw) {
    return null;
  }

  // Construct LegalArticle from userLinkedLaw data
  const article: LegalArticle = {
    id: userLinkedLaw.id,
    title: `${userLinkedLaw.lawTitleCache || 'Artículo'} - ${userLinkedLaw.articleNumberCache || 'N/A'}`,
    articleNumber: userLinkedLaw.articleNumberCache || 'N/A',
    fullText: userLinkedLaw.userNotesOnLink || "Contenido del artículo no disponible. Este es un placeholder.", // Placeholder
    lawCode: userLinkedLaw.lawTitleCache || 'N/A',
    category: "Legal", // Default category, can be refined later
  };

  if (!session || !article) {
    return null;
  }

  const handleBack = () => {
    router.push(`/cases/${caseId}`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <LegalArticleViewer 
        article={article}
        onBack={handleBack}
        highlightTerms={['divorcio', 'mutuo consentimiento', 'matrimonio']} // Example highlight terms
      />
    </div>
  );
}
