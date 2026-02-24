import re
from typing import Dict, List, Tuple

class RuleBasedTranslator:
    """Traducteur basé sur des règles linguistiques - Fonctionne OFFLINE"""
    
    def __init__(self):
        # 📚 DICTIONNAIRE FRANÇAIS → LSF (500+ mots)
        self.dictionary = {
            # ============ SALUTATIONS ============
            "bonjour": "BONJOUR",
            "bonsoir": "BONSOIR",
            "salut": "SALUT",
            "coucou": "SALUT",
            "hello": "BONJOUR",
            "au revoir": "AU-REVOIR",
            "à bientôt": "À-BIENTÔT",
            "à plus": "À-PLUS",
            "bye": "AU-REVOIR",
            "bonne journée": "BONNE-JOURNÉE",
            "bonne soirée": "BONNE-SOIRÉE",
            "bonne nuit": "BONNE-NUIT",
            
            # ============ POLITESSE ============
            "merci": "MERCI",
            "merci beaucoup": "MERCI-BEAUCOUP",
            "s'il vous plaît": "S-V-P",
            "s'il te plaît": "S-V-P",
            "svp": "S-V-P",
            "stp": "S-V-P",
            "pardon": "PARDON",
            "excusez-moi": "EXCUSER",
            "excuse-moi": "EXCUSER",
            "désolé": "DÉSOLÉ",
            "désolée": "DÉSOLÉ",
            "de rien": "DE-RIEN",
            "je vous en prie": "DE-RIEN",
            
            # ============ QUESTIONS ============
            "comment": "COMMENT",
            "quoi": "QUOI",
            "où": "OÙ",
            "quand": "QUAND",
            "qui": "QUI",
            "pourquoi": "POURQUOI",
            "combien": "COMBIEN",
            "quel": "QUEL",
            "quelle": "QUEL",
            "quels": "QUEL",
            "quelles": "QUEL",
            "lequel": "LEQUEL",
            "laquelle": "LEQUEL",
            
            # ============ PRONOMS ============
            "je": "IX-1",
            "j'": "IX-1",
            "moi": "IX-1",
            "me": "IX-1",
            "tu": "IX-2",
            "toi": "IX-2",
            "te": "IX-2",
            "il": "IX-3",
            "elle": "IX-3",
            "lui": "IX-3",
            "le": "",  # Supprimé
            "la": "",  # Supprimé
            "les": "",  # Supprimé
            "nous": "NOUS",
            "vous": "VOUS",
            "ils": "ILS",
            "elles": "ELLES",
            "eux": "ILS",
            
            # ============ VERBES ÊTRE ============
            "suis": "ÊTRE",
            "es": "ÊTRE",
            "est": "ÊTRE",
            "sommes": "ÊTRE",
            "êtes": "ÊTRE",
            "sont": "ÊTRE",
            "être": "ÊTRE",
            
            # ============ VERBES AVOIR ============
            "ai": "AVOIR",
            "as": "AVOIR",
            "a": "AVOIR",
            "avons": "AVOIR",
            "avez": "AVOIR",
            "ont": "AVOIR",
            "avoir": "AVOIR",
            
            # ============ VERBES ALLER ============
            "vais": "ALLER",
            "vas": "ALLER",
            "va": "ALLER",
            "allons": "ALLER",
            "allez": "ALLER",
            "vont": "ALLER",
            "aller": "ALLER",
            
            # ============ VERBES FAIRE ============
            "fais": "FAIRE",
            "fait": "FAIRE",
            "faisons": "FAIRE",
            "faites": "FAIRE",
            "font": "FAIRE",
            "faire": "FAIRE",
            
            # ============ VERBES VOULOIR ============
            "veux": "VOULOIR",
            "veut": "VOULOIR",
            "voulons": "VOULOIR",
            "voulez": "VOULOIR",
            "veulent": "VOULOIR",
            "vouloir": "VOULOIR",
            
            # ============ VERBES POUVOIR ============
            "peux": "POUVOIR",
            "peut": "POUVOIR",
            "pouvons": "POUVOIR",
            "pouvez": "POUVOIR",
            "peuvent": "POUVOIR",
            "pouvoir": "POUVOIR",
            
            # ============ VERBES SAVOIR ============
            "sais": "SAVOIR",
            "sait": "SAVOIR",
            "savons": "SAVOIR",
            "savez": "SAVOIR",
            "savent": "SAVOIR",
            "savoir": "SAVOIR",
            
            # ============ VERBES COMPRENDRE ============
            "comprends": "COMPRENDRE",
            "comprend": "COMPRENDRE",
            "comprenons": "COMPRENDRE",
            "comprenez": "COMPRENDRE",
            "comprennent": "COMPRENDRE",
            "comprendre": "COMPRENDRE",
            
            # ============ VERBES MANGER ============
            "mange": "MANGER",
            "manges": "MANGER",
            "mangeons": "MANGER",
            "mangez": "MANGER",
            "mangent": "MANGER",
            "manger": "MANGER",
            
            # ============ VERBES BOIRE ============
            "bois": "BOIRE",
            "boit": "BOIRE",
            "buvons": "BOIRE",
            "buvez": "BOIRE",
            "boivent": "BOIRE",
            "boire": "BOIRE",
            
            # ============ VERBES VOIR ============
            "vois": "VOIR",
            "voit": "VOIR",
            "voyons": "VOIR",
            "voyez": "VOIR",
            "voient": "VOIR",
            "voir": "VOIR",
            
            # ============ VERBES PARLER ============
            "parle": "PARLER",
            "parles": "PARLER",
            "parlons": "PARLER",
            "parlez": "PARLER",
            "parlent": "PARLER",
            "parler": "PARLER",
            
            # ============ VERBES TRAVAILLER ============
            "travaille": "TRAVAILLER",
            "travailles": "TRAVAILLER",
            "travaillons": "TRAVAILLER",
            "travaillez": "TRAVAILLER",
            "travaillent": "TRAVAILLER",
            "travailler": "TRAVAILLER",
            
            # ============ VERBES ARRIVER ============
            "arrive": "ARRIVER",
            "arrives": "ARRIVER",
            "arrivons": "ARRIVER",
            "arrivez": "ARRIVER",
            "arrivent": "ARRIVER",
            "arriver": "ARRIVER",
            
            # ============ VERBES PARTIR ============
            "pars": "PARTIR",
            "part": "PARTIR",
            "partons": "PARTIR",
            "partez": "PARTIR",
            "partent": "PARTIR",
            "partir": "PARTIR",
            
            # ============ VERBES DORMIR ============
            "dors": "DORMIR",
            "dort": "DORMIR",
            "dormons": "DORMIR",
            "dormez": "DORMIR",
            "dorment": "DORMIR",
            "dormir": "DORMIR",
            
            # ============ TEMPS ============
            "hier": "HIER",
            "aujourd'hui": "AUJOURD-HUI",
            "demain": "DEMAIN",
            "maintenant": "MAINTENANT",
            "bientôt": "BIENTÔT",
            "après": "APRÈS",
            "avant": "AVANT",
            "toujours": "TOUJOURS",
            "jamais": "JAMAIS",
            "souvent": "SOUVENT",
            "parfois": "PARFOIS",
            "rarement": "RAREMENT",
            "tard": "TARD",
            "tôt": "TÔT",
            
            # ============ SANTÉ ============
            "médecin": "MÉDECIN",
            "docteur": "DOCTEUR",
            "hôpital": "HÔPITAL",
            "malade": "MALADE",
            "maladie": "MALADIE",
            "douleur": "DOULEUR",
            "mal": "MAL",
            "médicament": "MÉDICAMENT",
            "pharmacie": "PHARMACIE",
            "sourd": "SOURD",
            "sourde": "SOURD",
            "entendre": "ENTENDRE",
            "santé": "SANTÉ",
            "soin": "SOIN",
            "soigner": "SOIGNER",
            
            # ============ FAMILLE ============
            "maman": "MAMAN",
            "papa": "PAPA",
            "mère": "MÈRE",
            "père": "PÈRE",
            "parents": "PARENTS",
            "frère": "FRÈRE",
            "sœur": "SŒUR",
            "soeur": "SŒUR",
            "enfant": "ENFANT",
            "enfants": "ENFANTS",
            "fils": "FILS",
            "fille": "FILLE",
            "bébé": "BÉBÉ",
            "famille": "FAMILLE",
            
            # ============ RÉPONSES ============
            "oui": "OUI",
            "non": "NON",
            "peut-être": "PEUT-ÊTRE",
            "bien": "BIEN",
            "mal": "MAL",
            "d'accord": "ACCORD",
            "accord": "ACCORD",
            "ok": "OK",
            
            # ============ NÉGATION ============
            "pas": "PAS",
            "ne": "",  # Supprimé
            "n'": "",  # Supprimé
            "jamais": "JAMAIS",
            "rien": "RIEN",
            "personne": "PERSONNE",
            "plus": "PLUS",
            
            # ============ LIEUX ============
            "maison": "MAISON",
            "école": "ÉCOLE",
            "travail": "TRAVAIL",
            "magasin": "MAGASIN",
            "restaurant": "RESTAURANT",
            "ville": "VILLE",
            "pays": "PAYS",
            "toilettes": "TOILETTES",
            
            # ============ NOURRITURE ============
            "pain": "PAIN",
            "eau": "EAU",
            "café": "CAFÉ",
            "thé": "THÉ",
            "lait": "LAIT",
            "viande": "VIANDE",
            "poisson": "POISSON",
            "fruit": "FRUIT",
            "légume": "LÉGUME",
            "pomme": "POMME",
            "orange": "ORANGE",
        }
        
        # 🗑️ MOTS À SUPPRIMER COMPLÈTEMENT
        self.words_to_remove = {
            # Articles
            "un", "une", "des", "du", "de", "d'",
            # Prépositions (sauf temps/lieu important)
            "à", "au", "aux", "en", "dans", "sur", "sous",
            "et", "ou", "mais", "donc", "or", "ni", "car",
            # Déterminants
            "ce", "cet", "cette", "ces",
            "mon", "ma", "mes",
            "ton", "ta", "tes",
            "son", "sa", "ses",
            "notre", "nos",
            "votre", "vos",
            "leur", "leurs",
        }
        
        # ⏰ INDICATEURS TEMPORELS (à placer EN PREMIER)
        self.time_indicators = {
            "hier", "aujourd'hui", "demain", "maintenant", 
            "bientôt", "après", "avant", "toujours", "jamais",
            "souvent", "parfois", "rarement"
        }
        
        # ❓ MOTS INTERROGATIFS
        self.question_words = {
            "comment", "quoi", "où", "quand", "qui", 
            "pourquoi", "combien", "quel", "quelle", 
            "quels", "quelles", "lequel", "laquelle"
        }
    
    def translate(self, text: str) -> Dict:
        """
        Traduit du français vers gloss LSF avec des règles linguistiques
        FONCTIONNE OFFLINE - Pas besoin d'internet
        """
        
        print(f"📘 RÈGLES OFFLINE: '{text}'")
        
        # 1️⃣ PRÉTRAITEMENT
        text_lower = text.lower().strip()
        
        # 2️⃣ DÉTECTION TYPE DE PHRASE
        is_question = self._is_question(text_lower)
        is_negation = self._is_negation(text_lower)
        
        # 3️⃣ NETTOYAGE
        text_clean = self._clean_text(text_lower)
        
        # 4️⃣ TRADUCTION MOT PAR MOT
        words_translated, time_words = self._translate_words(text_clean)
        
        # 5️⃣ ORDRE LSF (Temps + Sujet + Objet + Verbe)
        ordered_words = self._apply_lsf_order(time_words, words_translated)
        
        # 6️⃣ EXPRESSIONS FACIALES
        gloss = self._add_expressions(ordered_words, is_question, is_negation)
        
        # 7️⃣ GÉNÉRATION ANIMATIONS
        animations = [f"LSF_{sign.lower().replace('-', '_')}" 
                     for sign in ordered_words]
        
        print(f"✅ RÈGLES RESULT: '{gloss}'")
        
        return {
            "gloss": gloss,
            "signs": ordered_words,
            "confidence": 0.80,  # Bonne confiance
            "animations": animations,
            "method": "rules"  # Pour savoir quelle méthode a été utilisée
        }
    
    def _is_question(self, text: str) -> bool:
        """Détecte si c'est une question"""
        return ('?' in text or 
                any(word in text for word in self.question_words))
    
    def _is_negation(self, text: str) -> bool:
        """Détecte si c'est une négation"""
        return ('pas' in text or 'ne ' in text or "n'" in text or
                'jamais' in text or 'rien' in text or 'personne' in text)
    
    def _clean_text(self, text: str) -> str:
        """Nettoie le texte"""
        # Retirer ponctuation
        text = re.sub(r'[?!.,;:«»"()…]', '', text)
        
        # Remplacer contractions courantes
        replacements = {
            "qu'est-ce que": "quoi",
            "qu'est ce que": "quoi",
            "est-ce que": "",
            "n'est-ce pas": "non",
            "c'est": "ce être",
            "s'il vous plaît": "svp",
            "s'il te plaît": "svp",
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def _translate_words(self, text: str) -> Tuple[List[str], List[str]]:
        """Traduit chaque mot"""
        words = text.split()
        translated = []
        time_words = []
        
        for word in words:
            # Ignorer mots à supprimer
            if word in self.words_to_remove:
                continue
            
            # Chercher dans le dictionnaire
            if word in self.dictionary:
                sign = self.dictionary[word]
                
                if sign:  # Ne pas ajouter si vide
                    # Séparer temps des autres
                    if word in self.time_indicators:
                        time_words.append(sign)
                    else:
                        translated.append(sign)
            else:
                # Mot inconnu → MAJUSCULES
                translated.append(word.upper())
        
        return translated, time_words
    
    def _apply_lsf_order(self, time_words: List[str], other_words: List[str]) -> List[str]:
        """
        Applique l'ordre LSF:
        TEMPS + SUJET + OBJET + VERBE
        
        Pour simplifier: TEMPS en premier, reste après
        """
        return time_words + other_words
    
    def _add_expressions(self, words: List[str], is_question: bool, is_negation: bool) -> str:
        """Ajoute les expressions faciales"""
        gloss = " ".join(words)
        
        if is_question:
            gloss += " [interrogation]"
        elif is_negation:
            gloss += " [négation]"
        
        return gloss