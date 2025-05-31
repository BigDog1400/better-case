"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Case, AreaOfLaw } from "@prisma/client"
import { getTranslatedAreaOfLawName } from "@/lib/getTranslatedAreaOfLawName";

// Define the type for legal area options
export interface LegalAreaOption {
  value: string;
  code: string; // Changed from label to code
}

interface CaseFormProps {
  case?: Case & { areaOfLaw?: AreaOfLaw | null };
  onSubmit: (caseData: Partial<Case>) => void;
  isLoading?: boolean;
  legalAreaOptions: LegalAreaOption[]; // Add new prop
}

export function CaseForm({ case: existingCase, onSubmit, isLoading = false, legalAreaOptions }: CaseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    caseName: existingCase?.caseName ?? "",
    clientName: existingCase?.clientName ?? "",
    areaOfLawId: existingCase?.areaOfLawId ?? "",
    caseDescriptionInput: existingCase?.caseDescriptionInput ?? ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.caseName.trim()) {
      newErrors.caseName = "El nombre del caso es obligatorio"
    }

    if (!formData.areaOfLawId) {
      newErrors.areaOfLawId = "Debe seleccionar un área legal"
    }

    if (!formData.caseDescriptionInput.trim()) {
      newErrors.caseDescriptionInput = "La descripción del caso es obligatoria"
    } else if (formData.caseDescriptionInput.trim().length < 50) {
      newErrors.caseDescriptionInput = "La descripción debe tener al menos 50 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario")
      return
    }

    const caseData: Partial<Case> = {
      caseName: formData.caseName,
      clientName: formData.clientName.trim() || null, // clientName can be null in Prisma
      areaOfLawId: formData.areaOfLawId,
      caseDescriptionInput: formData.caseDescriptionInput,
    }

    onSubmit(caseData)
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {existingCase ? "Editar Caso" : "Crear Nuevo Caso"}
        </CardTitle>
        <CardDescription>
          {existingCase 
            ? "Modifica los detalles del caso existente"
            : "Ingresa los detalles del nuevo caso para obtener sugerencias legales automáticas"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caseName">Nombre del Caso *</Label>
            <Input
              id="caseName"
              placeholder="ej. López vs. Méndez - Divorcio"
              value={formData.caseName}
              onChange={(e) => setFormData(prev => ({ ...prev, caseName: e.target.value }))}
              className={errors.caseName ? "border-red-500" : ""}
            />
            {errors.caseName && (
              <p className="text-sm text-red-500">{errors.caseName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Cliente</Label>
            <Input
              id="clientName"
              placeholder="Nombre del cliente (opcional)"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaOfLawId">Área Legal *</Label>
            <Select 
              value={formData.areaOfLawId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, areaOfLawId: value }))}
            >
              <SelectTrigger className={errors.areaOfLawId ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona el área legal" />
              </SelectTrigger>
              <SelectContent>
                {legalAreaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {getTranslatedAreaOfLawName(option.code, 'es')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.areaOfLawId && (
              <p className="text-sm text-red-500">{errors.areaOfLawId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseDescriptionInput">Descripción del Caso *</Label>
            <Textarea
              id="caseDescriptionInput"
              placeholder="Describe los hechos principales, partes involucradas y preguntas legales clave..."
              value={formData.caseDescriptionInput}
              onChange={(e) => setFormData(prev => ({ ...prev, caseDescriptionInput: e.target.value }))}
              className={`min-h-32 ${errors.caseDescriptionInput ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              {formData.caseDescriptionInput.length}/500 caracteres (mínimo 50)
            </p>
            {errors.caseDescriptionInput && (
              <p className="text-sm text-red-500">{errors.caseDescriptionInput}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Guardando..." : existingCase ? "Actualizar y Re-analizar" : "Guardar y Analizar"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
