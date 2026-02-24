from pydantic import BaseModel, Field
from typing import List, Literal

class TranslationRequest(BaseModel):
    """Requête de traduction"""
    text: str = Field(..., description="Texte à traduire", example="Bonjour, comment allez-vous ?")
    target_lang: Literal["LSF", "ASL"] = Field(
        default="LSF",
        description="Langue des signes cible (LSF=Français, ASL=Anglais)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Bonjour, comment allez-vous ?",
                "target_lang": "LSF"
            }
        }

class TranslationResponse(BaseModel):
    """Réponse de traduction"""
    gloss: str = Field(..., description="Notation gloss de la langue des signes")
    signs: List[str] = Field(..., description="Liste des signes individuels")
    confidence: float = Field(..., description="Niveau de confiance de la traduction (0-1)")
    animations: List[str] = Field(..., description="IDs des animations pour Unity")
    method: str = Field(default="gpt", description="Méthode utilisée (gpt, rules, fallback)")
    language: str = Field(default="LSF", description="Langue des signes (LSF ou ASL)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "gloss": "BONJOUR COMMENT ALLER-VOUS [interrogation]",
                "signs": ["BONJOUR", "COMMENT", "ALLER-VOUS"],
                "confidence": 0.95,
                "animations": ["LSF_bonjour", "LSF_comment", "LSF_aller-vous"],
                "method": "gpt",
                "language": "LSF"
            }
        }