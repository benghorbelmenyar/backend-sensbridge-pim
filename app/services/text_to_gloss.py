from openai import OpenAI
import os
from typing import Dict, List
import re

class TextToGlossService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY non trouvée dans .env")
        self.client = OpenAI(api_key=api_key)
    
    async def translate_to_gloss(self, text: str, target_lang: str = "LSF") -> Dict:
        """Traduit du français vers la notation gloss"""
        
        print(f"🔵 INPUT: '{text}'")
        
        # 🎯 PROMPT AVEC NOTATION IX (INDEX/POINTAGE)
        system_prompt = f"""Tu es un traducteur LSF expert. Traduis en notation GLOSS avec pointages INDEX.

RÈGLES STRICTES:

1. PRONOMS → POINTAGES INDEX:
   je/j' → IX-1 (pointage vers soi)
   tu → IX-2 (pointage vers interlocuteur)
   il/elle → IX-3 (pointage vers tierce personne)
   nous → IX-1pl
   vous → IX-2pl
   ils/elles → IX-3pl

2. STRUCTURE GRAMMATICALE:
   TEMPS + SUJET + OBJET + VERBE
   
3. SUPPRIMER:
   - Articles: le, la, les, un, une, des
   - Prépositions: de, du, à, au
   
4. VERBES à l'infinitif (MANGER, ALLER, ARRIVER, etc.)

5. MAJUSCULES uniquement

EXEMPLES STRICTS:
"Je vais bien" → IX-1 ALLER BIEN
"Tu manges" → IX-2 MANGER
"Il arrive demain" → DEMAIN IX-3 ARRIVER
"Elle lit un livre" → IX-3 LIVRE LIRE
"Le médecin arrive bientôt" → BIENTÔT MÉDECIN ARRIVER
"Je pars demain" → DEMAIN IX-1 PARTIR
"Nous travaillons" → IX-1pl TRAVAILLER
"Vous partez" → IX-2pl PARTIR
"Ils mangent" → IX-3pl MANGER

IX = INDEX (doigt pointeur)
IX-1 = pointage vers soi (je/moi)
IX-2 = pointage vers interlocuteur (tu/toi)
IX-3 = pointage vers tierce personne (il/elle/lui)

RÉPONDS UNIQUEMENT avec le GLOSS, rien d'autre."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.1,
                max_tokens=200
            )
            
            gloss_text = response.choices[0].message.content.strip()
            print(f"🤖 GPT BRUT: '{gloss_text}'")
            
            # 🛡️ NETTOYAGE ULTRA-AGRESSIF AVEC IX
            gloss_text = self._force_clean_gloss_IX(gloss_text)
            print(f"✅ APRÈS NETTOYAGE: '{gloss_text}'")
            
            # Extraire les signes
            signs = self._parse_gloss(gloss_text)
            print(f"📋 SIGNES: {signs}")
            
            # Générer les IDs d'animations
            animations = [f"{target_lang}_{sign.lower().replace(' ', '-')}" for sign in signs]
            
            return {
                "gloss": gloss_text,
                "signs": signs,
                "confidence": 0.95,
                "animations": animations
            }
            
        except Exception as e:
            print(f"❌ ERREUR: {e}")
            return self._emergency_fallback_IX(text, target_lang)
    
    def _force_clean_gloss_IX(self, gloss_text: str) -> str:
        """Nettoyage ultra-agressif avec notation IX"""
        
        # Prendre uniquement la première ligne
        gloss_text = gloss_text.split('\n')[0].strip()
        
        # Ajouter espaces avant/après pour faciliter remplacements
        gloss_text = f" {gloss_text} "
        
        # 🎯 REMPLACEMENTS FORCÉS DES PRONOMS → IX
        replacements = {
            # Pronoms avec espaces → IX
            ' JE ': ' IX-1 ',
            ' TU ': ' IX-2 ',
            ' IL ': ' IX-3 ',
            ' ELLE ': ' IX-3 ',
            ' NOUS ': ' IX-1pl ',
            ' VOUS ': ' IX-2pl ',
            ' ILS ': ' IX-3pl ',
            ' ELLES ': ' IX-3pl ',
            
            # J' apostrophe
            ' J\'': ' IX-1 ',
            
            # Au début de phrase (sans espace avant)
            'JE ': 'IX-1 ',
            'TU ': 'IX-2 ',
            'IL ': 'IX-3 ',
            'ELLE ': 'IX-3 ',
            
            # Au cas où GPT aurait mis MOI/TOI/LUI, on force IX
            ' MOI ': ' IX-1 ',
            ' TOI ': ' IX-2 ',
            ' LUI ': ' IX-3 ',
            ' EUX ': ' IX-3pl ',
            
            # Articles
            ' LE ': ' ',
            ' LA ': ' ',
            ' LES ': ' ',
            ' UN ': ' ',
            ' UNE ': ' ',
            ' DES ': ' ',
            ' L\'': ' ',
            
            # Prépositions
            ' DE ': ' ',
            ' DU ': ' ',
            ' À ': ' ',
            ' AU ': ' ',
            ' DANS ': ' ',
            ' POUR ': ' ',
            ' PAR ': ' ',
            ' AVEC ': ' ',
            
            # Verbes conjugués courants → infinitif
            ' VAIS ': ' ALLER ',
            ' VAS ': ' ALLER ',
            ' VA ': ' ALLER ',
            ' ALLONS ': ' ALLER ',
            ' ALLEZ ': ' ALLER ',
            ' VONT ': ' ALLER ',
            
            ' SUIS ': ' ÊTRE ',
            ' ES ': ' ÊTRE ',
            ' EST ': ' ÊTRE ',
            ' SOMMES ': ' ÊTRE ',
            ' ÊTES ': ' ÊTRE ',
            ' SONT ': ' ÊTRE ',
            
            ' AI ': ' AVOIR ',
            ' AS ': ' AVOIR ',
            ' A ': ' AVOIR ',
            ' AVONS ': ' AVOIR ',
            ' AVEZ ': ' AVOIR ',
            ' ONT ': ' AVOIR ',
            
            ' MANGE ': ' MANGER ',
            ' MANGES ': ' MANGER ',
            ' MANGEONS ': ' MANGER ',
            ' MANGEZ ': ' MANGER ',
            ' MANGENT ': ' MANGER ',
            
            ' ARRIVE ': ' ARRIVER ',
            ' ARRIVES ': ' ARRIVER ',
            ' ARRIVONS ': ' ARRIVER ',
            ' ARRIVEZ ': ' ARRIVER ',
            ' ARRIVENT ': ' ARRIVER ',
            
            ' PARS ': ' PARTIR ',
            ' PART ': ' PARTIR ',
            ' PARTONS ': ' PARTIR ',
            ' PARTEZ ': ' PARTIR ',
            ' PARTENT ': ' PARTIR ',
            
            ' LIS ': ' LIRE ',
            ' LIT ': ' LIRE ',
            ' LISONS ': ' LIRE ',
            ' LISEZ ': ' LIRE ',
            ' LISENT ': ' LIRE ',
            
            ' REGARDE ': ' REGARDER ',
            ' REGARDES ': ' REGARDER ',
            ' REGARDONS ': ' REGARDER ',
            ' REGARDEZ ': ' REGARDER ',
            ' REGARDENT ': ' REGARDER ',
            
            ' TRAVAILLE ': ' TRAVAILLER ',
            ' TRAVAILLES ': ' TRAVAILLER ',
            ' TRAVAILLONS ': ' TRAVAILLER ',
            ' TRAVAILLEZ ': ' TRAVAILLER ',
            ' TRAVAILLENT ': ' TRAVAILLER ',
        }
        
        # Appliquer tous les remplacements
        for old, new in replacements.items():
            gloss_text = gloss_text.replace(old, new)
        
        # Nettoyer les espaces multiples
        gloss_text = ' '.join(gloss_text.split())
        
        return gloss_text.strip()
    
    def _parse_gloss(self, gloss_text: str) -> List[str]:
        """Extrait les signes du texte gloss"""
        
        # Retirer les expressions faciales [...]
        clean = re.sub(r'\[.*?\]', '', gloss_text)
        
        # Séparer et filtrer
        signs = [s.strip() for s in clean.split() if s.strip()]
        
        return signs
    
    def _emergency_fallback_IX(self, text: str, target_lang: str) -> Dict:
        """Fallback d'urgence avec notation IX"""
        
        print(f"🆘 FALLBACK pour: '{text}'")
        
        # Prétraitement du texte
        text_clean = text.lower()
        
        # Remplacer pronoms par IX AVANT de passer en majuscules
        text_clean = text_clean.replace('je ', 'IX-1 ')
        text_clean = text_clean.replace('j\'', 'IX-1 ')
        text_clean = text_clean.replace('tu ', 'IX-2 ')
        text_clean = text_clean.replace('il ', 'IX-3 ')
        text_clean = text_clean.replace('elle ', 'IX-3 ')
        text_clean = text_clean.replace('nous ', 'IX-1pl ')
        text_clean = text_clean.replace('vous ', 'IX-2pl ')
        text_clean = text_clean.replace('ils ', 'IX-3pl ')
        text_clean = text_clean.replace('elles ', 'IX-3pl ')
        
        # Passer en majuscules
        words = text_clean.upper().split()
        
        # Supprimer articles
        words = [w for w in words if w not in ['LE', 'LA', 'LES', 'UN', 'UNE', 'DES', 'DE', 'DU', 'À', 'AU']]
        
        gloss = " ".join(words)
        
        return {
            "gloss": gloss,
            "signs": words,
            "confidence": 0.5,
            "animations": [f"{target_lang}_{w.lower()}" for w in words]
        }