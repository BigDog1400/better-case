import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Star } from "lucide-react"
import type { LegalSuggestion } from "@/lib/types"

interface SuggestionCardProps {
  suggestion: LegalSuggestion
  onViewFullText: (suggestionId: string) => void
}

export function SuggestionCard({ suggestion, onViewFullText }: SuggestionCardProps) {
  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 90) return "Muy Relevante"
    if (score >= 75) return "Relevante"
    return "Moderadamente Relevante"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{suggestion.lawTitle}</CardTitle>
            <CardDescription className="font-medium text-primary">
              {suggestion.articleNumber}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div className="flex items-center gap-1">
              <div 
                className={`h-2 w-2 rounded-full ${getRelevanceColor(suggestion.relevanceScore)}`}
              />
              <span className="text-xs text-muted-foreground">
                {suggestion.relevanceScore}%
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getRelevanceLabel(suggestion.relevanceScore)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {suggestion.snippet}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onViewFullText(suggestion.id)}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Ver Texto Completo
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Vincular al Caso
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}