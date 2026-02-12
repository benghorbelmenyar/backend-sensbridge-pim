from openai import OpenAI
import os
from typing import Dict
from .rule_based_translator import RuleBasedTranslator
from .asl_translator import ASLTranslator

class TextToGlossService:
    def __init__(self):
        # GPT
        api_key = os.getenv("OPENAI_API_KEY")
        
        if api_key:
            try:
                self.client = OpenAI(api_key=api_key)
                self.gpt_available = True
                print("✅ GPT-4o-mini disponible")
            except Exception as e:
                self.client = None
                self.gpt_available = False
        else:
            self.client = None
            self.gpt_available = False
        
        # Traducteurs offline
        self.lsf_translator = RuleBasedTranslator()
        self.asl_translator = ASLTranslator()
        print("✅ LSF et ASL offline disponibles")
    
    async def translate_to_gloss(self, text: str, target_lang: str = "LSF") -> Dict:
        """
        Traduit vers LSF ou ASL
        
        Args:
            text: Texte à traduire
            target_lang: "LSF" (français) ou "ASL" (anglais)
        """
        
        print(f"\n{'='*60}")
        print(f"🔵 INPUT: '{text}'")
        print(f"🎯 TARGET: {target_lang}")
        print(f"{'='*60}")
        
        # ===== ESSAYER GPT =====
        if self.gpt_available:
            try:
                print(f"🤖 Tentative GPT pour {target_lang}...")
                result = await self._translate_with_gpt(text, target_lang)
                print("✅ GPT réussi !")
                result["method"] = "gpt"
                result["language"] = target_lang
                return result
            except Exception as e:
                print(f"❌ GPT échoué: {e}")
                print("🔄 Fallback vers règles...")
        
        # ===== RÈGLES OFFLINE =====
        try:
            if target_lang == "ASL":
                print("🇺🇸 Utilisation règles ASL...")
                return self.asl_translator.translate(text)
            else:
                print("🇫🇷 Utilisation règles LSF...")
                return self.lsf_translator.translate(text)
        except Exception as e:
            print(f"❌ Règles échouées: {e}")
            return self._emergency_fallback(text, target_lang)
    
    async def _translate_with_gpt(self, text: str, target_lang: str) -> Dict:
        """GPT pour LSF ou ASL"""
        
        if target_lang == "ASL":
            system_prompt = """You are an ASL (American Sign Language) expert translator. Translate to ASL GLOSS notation.

RULES:
- Keep pronouns: I, YOU, HE, SHE, WE, THEY
- Remove: a, an, the (articles)
- Remove: am, is, are, was, were (to be)
- Use base form of verbs
- UPPERCASE only
- Add facial expressions: [wh-q] for WH-questions, [y/n-q] for YES/NO questions, [neg] for negation

RESPOND ONLY with GLOSS."""
        else:
            system_prompt = """Tu es un traducteur LSF expert. Traduis en notation GLOSS LSF.

RÈGLES:
- Remplacer JE→IX-1, TU→IX-2, IL/ELLE→IX-3
- Supprimer articles: le, la, les, un, une, des
- Verbes à l'infinitif
- MAJUSCULES uniquement
- Expressions: [interrogation], [négation]

RÉPONDS UNIQUEMENT avec le GLOSS."""

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.1,
            max_tokens=200,
            timeout=5.0
        )
        
        gloss_text = response.choices[0].message.content.strip()
        gloss_text = gloss_text.split('\n')[0].strip()
        
        # Extraire signes
        signs = [s.strip() for s in gloss_text.split() 
                if s.strip() and not s.startswith('[')]
        
        # Générer animations
        animations = [f"{target_lang}_{sign.lower().replace('-', '_')}" 
                     for sign in signs]
        
        return {
            "gloss": gloss_text,
            "signs": signs,
            "confidence": 0.95,
            "animations": animations
        }
    
    def _emergency_fallback(self, text: str, target_lang: str) -> Dict:
        """Fallback basique"""
        words = text.upper().split()
        
        if target_lang == "ASL":
            # Basique ASL
            words = [w for w in words if w not in ["A", "AN", "THE", "IS", "ARE", "AM"]]
        else:
            # Basique LSF
            basic = {"JE": "IX-1", "TU": "IX-2", "IL": "IX-3", "ELLE": "IX-3"}
            words = [basic.get(w, w) for w in words]
            words = [w for w in words if w not in ["LE", "LA", "LES"]]
        
        gloss = " ".join(words)
        
        return {
            "gloss": gloss,
            "signs": words,
            "confidence": 0.50,
            "animations": [f"{target_lang}_{w.lower()}" for w in words],
            "method": "fallback",
            "language": target_lang
        }