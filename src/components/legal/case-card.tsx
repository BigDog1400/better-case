import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, FileText } from "lucide-react"
import type { Case } from "@/lib/types"
import { legalAreaOptions } from "@/lib/mock-data"

interface CaseCardProps {
  case: Case
  onView: (caseId: string) => void
  onEdit: (caseId: string) => void
}

export function CaseCard({ case: caseData, onView, onEdit }: CaseCardProps) {
  const areaLabel = legalAreaOptions.find(option => option.value === caseData.areaOfLaw)?.label || caseData.areaOfLaw

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{caseData.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {caseData.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {areaLabel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {caseData.client && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {caseData.client}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Actualizado: {caseData.updatedAt.toLocaleDateString('es-VE')}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Estado: {caseData.status === 'active' ? 'Activo' : 'Archivado'}
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