import { areaOfLawTranslationsEN } from "@/translations/en";
import { areaOfLawTranslationsES } from "@/translations/es";

export function getTranslatedAreaOfLawName(areaCode: string, language: 'es' | 'en'): string {
    if (language === 'en') {
      return areaOfLawTranslationsEN[areaCode as keyof typeof areaOfLawTranslationsEN] || areaCode;     
    }
    
    return areaOfLawTranslationsES[areaCode as keyof typeof areaOfLawTranslationsES] || areaCode; 
}