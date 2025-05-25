import type { Case, LegalSuggestion, ChatMessage, LegalArticle } from './types'
import { LegalArea } from './types'

export const mockCases: Case[] = [
  {
    id: '1',
    name: 'López vs. Méndez - Divorcio',
    client: 'María López',
    areaOfLaw: LegalArea.CIVIL,
    description: 'Caso de divorcio por mutuo consentimiento. Los cónyuges han acordado la separación de bienes y la custodia compartida de los hijos menores. Se requiere análisis de los aspectos patrimoniales y procedimentales según el Código Civil venezolano.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Empresa XYZ - Despido Injustificado',
    client: 'Carlos Rodríguez',
    areaOfLaw: LegalArea.LABOR,
    description: 'Trabajador despedido sin causa justificada después de 8 años de servicio. La empresa no pagó las prestaciones sociales correspondientes. Se busca reinstalación o indemnización según la Ley Orgánica del Trabajo.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Contrato Comercial - Incumplimiento',
    client: 'Inversiones ABC C.A.',
    areaOfLaw: LegalArea.COMMERCIAL,
    description: 'Incumplimiento de contrato de suministro por parte del proveedor. Retraso en entregas y productos defectuosos han causado pérdidas significativas. Se evalúa demanda por daños y perjuicios.',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-10'),
    status: 'active'
  },
  {
    id: '4',
    name: 'Empresa XYZ - Despido Injustificado',
    client: 'Carlos Rodríguez',
    areaOfLaw: LegalArea.LABOR,
    description: 'Trabajador despedido sin causa justificada después de 8 años de servicio. La empresa no pagó las prestaciones sociales correspondientes. Se busca reinstalación o indemnización según la Ley Orgánica del Trabajo.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    status: 'active'
  },
  {
    id: '5',
    name: 'Empresa XYZ - Despido Injustificado',
    client: 'Carlos Rodríguez',
    areaOfLaw: LegalArea.LABOR,
    description: 'Trabajador despedido sin causa justificada después de 8 años de servicio. La empresa no pagó las prestaciones sociales correspondientes. Se busca reinstalación o indemnización según la Ley Orgánica del Trabajo.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    status: 'active'
  },
  
   
]

export const mockLegalSuggestions: LegalSuggestion[] = [
  {
    id: '1',
    caseId: '1',
    lawTitle: 'Código Civil de Venezuela',
    articleNumber: 'Artículo 185',
    snippet: 'El divorcio por mutuo consentimiento podrá decretarse por el Juez cuando ambos cónyuges, de común acuerdo, lo soliciten ante el Tribunal competente...',
    relevanceScore: 95,
    fullText: 'Artículo 185. El divorcio por mutuo consentimiento podrá decretarse por el Juez cuando ambos cónyuges, de común acuerdo, lo soliciten ante el Tribunal competente, siempre que hayan transcurrido más de dos años desde la celebración del matrimonio. La solicitud deberá contener: 1) La manifestación expresa de la voluntad de divorciarse; 2) El convenio sobre la separación de bienes, si los hubiere; 3) El convenio sobre la guarda y manutención de los hijos comunes menores de edad, si los hubiere.'
  },
  {
    id: '2',
    caseId: '1',
    lawTitle: 'Código Civil de Venezuela',
    articleNumber: 'Artículo 191',
    snippet: 'Los efectos del divorcio se producen desde la fecha en que quede firme la sentencia que lo declare...',
    relevanceScore: 88,
    fullText: 'Artículo 191. Los efectos del divorcio se producen desde la fecha en que quede firme la sentencia que lo declare. El divorcio disuelve el vínculo matrimonial y deja a los cónyuges en libertad para contraer nuevo matrimonio. Los bienes adquiridos durante el matrimonio se dividirán conforme al régimen patrimonial establecido o, en su defecto, según las disposiciones legales aplicables.'
  },
  {
    id: '3',
    caseId: '2',
    lawTitle: 'Ley Orgánica del Trabajo',
    articleNumber: 'Artículo 79',
    snippet: 'El despido de un trabajador sin causa justificada da derecho a una indemnización equivalente a treinta días de salario por cada año de servicio...',
    relevanceScore: 92,
    fullText: 'Artículo 79. El despido de un trabajador sin causa justificada da derecho a una indemnización equivalente a treinta días de salario por cada año de servicio o fracción superior a seis meses, calculada con base al último salario devengado. Esta indemnización no podrá ser menor a sesenta días de salario. El trabajador tendrá derecho además al pago de las prestaciones sociales que le correspondan.'
  }
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    caseId: '1',
    role: 'user',
    content: '¿Cuáles son los requisitos principales para un divorcio por mutuo consentimiento en Venezuela?',
    timestamp: new Date('2024-02-10T10:00:00')
  },
  {
    id: '2',
    caseId: '1',
    role: 'assistant',
    content: 'Para un divorcio por mutuo consentimiento en Venezuela, según el Código Civil, se requiere:\n\n1. **Tiempo mínimo**: Deben haber transcurrido más de 2 años desde la celebración del matrimonio\n2. **Acuerdo mutuo**: Ambos cónyuges deben estar de acuerdo\n3. **Convenios obligatorios**:\n   - Separación de bienes (si los hubiere)\n   - Guarda y manutención de hijos menores (si los hubiere)\n\n¿Hay algún aspecto específico del caso López vs. Méndez que te gustaría analizar más a fondo?',
    timestamp: new Date('2024-02-10T10:01:30')
  }
]

export const mockLegalArticles: LegalArticle[] = [
  {
    id: '1',
    title: 'Divorcio por Mutuo Consentimiento',
    articleNumber: 'Artículo 185',
    fullText: 'Artículo 185. El divorcio por mutuo consentimiento podrá decretarse por el Juez cuando ambos cónyuges, de común acuerdo, lo soliciten ante el Tribunal competente, siempre que hayan transcurrido más de dos años desde la celebración del matrimonio.\n\nLa solicitud deberá contener:\n\n1) La manifestación expresa de la voluntad de divorciarse;\n\n2) El convenio sobre la separación de bienes, si los hubiere;\n\n3) El convenio sobre la guarda y manutención de los hijos comunes menores de edad, si los hubiere.\n\nEl Juez, previa verificación de los requisitos legales y la autenticidad del consentimiento, procederá a decretar el divorcio mediante sentencia definitiva.',
    lawCode: 'Código Civil de Venezuela',
    category: LegalArea.CIVIL
  },
  {
    id: '2',
    title: 'Indemnización por Despido Injustificado',
    articleNumber: 'Artículo 79',
    fullText: 'Artículo 79. El despido de un trabajador sin causa justificada da derecho a una indemnización equivalente a treinta días de salario por cada año de servicio o fracción superior a seis meses, calculada con base al último salario devengado.\n\nEsta indemnización no podrá ser menor a sesenta días de salario.\n\nEl trabajador tendrá derecho además al pago de las prestaciones sociales que le correspondan conforme a esta Ley.\n\nLa indemnización por despido injustificado es independiente y adicional a cualquier otra prestación o beneficio que corresponda al trabajador.',
    lawCode: 'Ley Orgánica del Trabajo',
    category: LegalArea.LABOR
  }
]

export const legalAreaOptions = [
  { value: LegalArea.CIVIL, label: 'Derecho Civil' },
  { value: LegalArea.CRIMINAL, label: 'Derecho Penal' },
  { value: LegalArea.COMMERCIAL, label: 'Derecho Mercantil' },
  { value: LegalArea.LABOR, label: 'Derecho Laboral' },
  { value: LegalArea.CONSTITUTIONAL, label: 'Derecho Constitucional' },
  { value: LegalArea.ADMINISTRATIVE, label: 'Derecho Administrativo' }
]