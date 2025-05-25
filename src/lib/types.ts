export enum LegalArea {
    CIVIL = 'Civil',
    CRIMINAL = 'Criminal',
    COMMERCIAL = 'Commercial',
    LABOR = 'Labor',
    CONSTITUTIONAL = 'Constitutional',
    ADMINISTRATIVE = 'Administrative'
  }
  
  export interface Case {
    id: string
    name: string
    client?: string
    areaOfLaw: LegalArea
    description: string
    createdAt: Date
    updatedAt: Date
    status: 'active' | 'archived'
  }
  
  export interface LegalSuggestion {
    id: string
    caseId: string
    lawTitle: string
    articleNumber: string
    snippet: string
    relevanceScore: number
    fullText: string
  }
  
  export interface ChatMessage {
    id: string
    caseId: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
  
  export interface LegalArticle {
    id: string
    title: string
    articleNumber: string
    fullText: string
    lawCode: string
    category: LegalArea
  }