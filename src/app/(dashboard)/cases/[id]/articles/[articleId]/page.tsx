"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LegalArticleViewer } from "@/components/legal/legal-article-viewer";
import { mockLegalSuggestions, mockLegalArticles } from "@/lib/mock-data";
import type { LegalArticle } from "@/lib/types";

export default function ArticleViewerPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const articleId = params.articleId as string;
  const { data: session, isPending } = authClient.useSession();
  
  const [article, setArticle] = useState<LegalArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
      return;
    }

    // Load article data
    const loadArticleData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find suggestion first to get the article info
      const suggestion = mockLegalSuggestions.find(s => s.id === articleId);
      
      if (suggestion) {
        // Create article from suggestion data
        const articleData: LegalArticle = {
          id: suggestion.id,
          title: `${suggestion.lawTitle} - ${suggestion.articleNumber}`,
          articleNumber: suggestion.articleNumber,
          fullText: suggestion.fullText,
          lawCode: suggestion.lawTitle,
          category: mockLegalArticles[0].category // Default category
        };
        setArticle(articleData);
      } else {
        // Fallback to mock articles
        const foundArticle = mockLegalArticles.find(a => a.id === articleId) || mockLegalArticles[0];
        setArticle(foundArticle);
      }
      
      setIsLoading(false);
    };

    if (session) {
      loadArticleData();
    }
  }, [session, isPending, router, articleId]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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