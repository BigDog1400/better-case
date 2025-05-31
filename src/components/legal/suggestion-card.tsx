import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star } from "lucide-react"
import { type RouterOutputs } from "@/trpc/react";

type UserLinkedLaw = RouterOutputs["case"]["getById"]['userLinkedLaws'][number];

interface SuggestionCardProps { 
  suggestion: UserLinkedLaw;
  onViewFullText: (suggestionId: string) => void;
}

export function SuggestionCard({ suggestion, onViewFullText }: SuggestionCardProps) {

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{suggestion.lawTitleCache}</CardTitle>
            <CardDescription className="font-medium text-primary">
              {suggestion.articleNumberCache}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {suggestion.userNotesOnLink ?? "No hay notas de usuario para este enlace."}
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
