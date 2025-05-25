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
import type { Case } from "@/lib/types"
import { LegalArea } from "@/lib/types"
import { legalAreaOptions } from "@/lib/mock-data"

interface CaseFormProps {
  case?: Case
  onSubmit: (caseData: Partial<Case>) => void
  isLoading?: boolean
}

export function CaseForm({ case: existingCase, onSubmit, isLoading = false }: CaseFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: existingCase?.name || "",
    client: existingCase?.client || "",
    areaOfLaw: existingCase?.areaOfLaw || "",
    description: existingCase?.description || ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del caso es obligatorio"
    }

    if (!formData.areaOfLaw) {
      newErrors.areaOfLaw = "Debe seleccionar un área legal"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción del caso es obligatoria"
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "La descripción debe tener al menos 50 caracteres"
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
      ...formData,
      areaOfLaw: formData.areaOfLaw as LegalArea,
      client: formData.client.trim() || undefined
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
            <Label htmlFor="name">Nombre del Caso *</Label>
            <Input
              id="name"
              placeholder="ej. López vs. Méndez - Divorcio"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              placeholder="Nombre del cliente (opcional)"
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaOfLaw">Área Legal *</Label>
            <Select 
              value={formData.areaOfLaw} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, areaOfLaw: value }))}
            >
              <SelectTrigger className={errors.areaOfLaw ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona el área legal" />
              </SelectTrigger>
              <SelectContent>
                {legalAreaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.areaOfLaw && (
              <p className="text-sm text-red-500">{errors.areaOfLaw}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Caso *</Label>
            <Textarea
              id="description"
              placeholder="Describe los hechos principales, partes involucradas y preguntas legales clave..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 caracteres (mínimo 50)
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
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