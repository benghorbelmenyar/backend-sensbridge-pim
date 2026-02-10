from pydantic import BaseModel, Field
from typing import List

class TranslationRequest(BaseModel):
    text: str = Field(..., max_length=1000, description="Texte à traduire")
    target_lang: str = Field(default="LSF", description="Langue cible (LSF, ASL, etc.)")

class TranslationResponse(BaseModel):
    gloss: str
    signs: List[str]
    confidence: float
    animations: List[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "gloss": "BONJOUR COMMENT ALLER-VOUS",
                "signs": ["BONJOUR", "COMMENT", "ALLER-VOUS"],
                "confidence": 0.95,
                "animations": ["LSF_bonjour", "LSF_comment", "LSF_aller-vous"]
            }
        }