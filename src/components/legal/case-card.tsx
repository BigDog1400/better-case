import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"
import { legalAreaOptions } from "@/lib/mock-data"
import { Case } from "@prisma/client"

interface CaseCardProps {
  case: Case
  onView: (caseId: string) => void
  onEdit: (caseId: string) => void
}

export function CaseCard({ case: caseData, onView, onEdit }: CaseCardProps) {
  const areaLabel = legalAreaOptions.find(option => option.value === caseData.areaOfLawId)?.label ?? caseData.areaOfLawId

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{caseData.caseName}</CardTitle>
            <CardDescription className="line-clamp-2">
              {caseData.caseDescriptionInput}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {areaLabel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {caseData.clientName && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {caseData.clientName}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Actualizado: {caseData.updatedAt.toLocaleDateString('es-VE')}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onView(caseData.id)}
            className="flex-1"
          >
            Ver Caso
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(caseData.id)}
          >
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}