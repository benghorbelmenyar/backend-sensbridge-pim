from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.models.schemas import TranslationRequest, TranslationResponse
from app.services.text_to_gloss import TextToGlossService

# Charger les variables d'environnement
load_dotenv()

# Créer l'application FastAPI
app = FastAPI(
    title="SENSE API",
    description="API de traduction texte → langue des signes",
    version="1.0.0"
)

# Configurer CORS (pour permettre les appels depuis Flutter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le service
gloss_service = TextToGlossService()

@app.get("/")
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "Bienvenue sur SENSE API",
        "version": "1.0.0",
        "endpoints": {
            "translate": "/api/v1/translate",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Vérifier que l'API fonctionne"""
    return {"status": "healthy"}



@app.post("/api/v1/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Traduit du texte français en langue des signes (gloss + animations)
    
    - **text**: Texte à traduire (max 1000 caractères)
    - **target_lang**: Langue cible (LSF, ASL, BSL, etc.)
    """
    
    if len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Le texte ne peut pas être vide")
    
    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Texte trop long (max 1000 caractères)")
    
    try:
        result = await gloss_service.translate_to_gloss(
            request.text,
            request.target_lang
        )
        
        return TranslationResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de traduction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)