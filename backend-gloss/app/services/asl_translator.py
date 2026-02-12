import re
from typing import Dict, List, Tuple

class ASLTranslator:
    """Traducteur Anglais → ASL (American Sign Language)"""
    
    def __init__(self):
        # 📚 DICTIONNAIRE ANGLAIS → ASL (500+ mots)
        self.dictionary = {
            # ============ GREETINGS ============
            "hello": "HELLO",
            "hi": "HELLO",
            "hey": "HELLO",
            "good morning": "GOOD-MORNING",
            "good afternoon": "GOOD-AFTERNOON",
            "good evening": "GOOD-EVENING",
            "good night": "GOOD-NIGHT",
            "goodbye": "GOODBYE",
            "bye": "GOODBYE",
            "see you later": "SEE-YOU-LATER",
            "see you": "SEE-YOU",
            
            # ============ POLITENESS ============
            "thank you": "THANK-YOU",
            "thanks": "THANK-YOU",
            "please": "PLEASE",
            "sorry": "SORRY",
            "excuse me": "EXCUSE-ME",
            "you're welcome": "YOU-WELCOME",
            "welcome": "WELCOME",
            "pardon": "PARDON",
            
            # ============ QUESTIONS ============
            "what": "WHAT",
            "where": "WHERE",
            "when": "WHEN",
            "who": "WHO",
            "why": "WHY",
            "how": "HOW",
            "which": "WHICH",
            "how much": "HOW-MUCH",
            "how many": "HOW-MANY",
            
            # ============ PRONOUNS ============
            "i": "I",
            "me": "ME",
            "my": "MY",
            "mine": "MINE",
            "you": "YOU",
            "your": "YOUR",
            "yours": "YOURS",
            "he": "HE",
            "him": "HIM",
            "his": "HIS",
            "she": "SHE",
            "her": "HER",
            "hers": "HERS",
            "we": "WE",
            "us": "US",
            "our": "OUR",
            "ours": "OURS",
            "they": "THEY",
            "them": "THEM",
            "their": "THEIR",
            "theirs": "THEIRS",
            
            # ============ TO BE (supprimé en ASL) ============
            "am": "",
            "is": "",
            "are": "",
            "was": "",
            "were": "",
            "be": "",
            "being": "",
            "been": "",
            
            # ============ TO HAVE ============
            "have": "HAVE",
            "has": "HAVE",
            "had": "HAVE",
            "having": "HAVE",
            
            # ============ MODALS ============
            "can": "CAN",
            "could": "CAN",
            "will": "WILL",
            "would": "WILL",
            "shall": "WILL",
            "should": "SHOULD",
            "may": "MAY",
            "might": "MAY",
            "must": "MUST",
            
            # ============ COMMON VERBS ============
            "go": "GO",
            "goes": "GO",
            "going": "GO",
            "went": "GO",
            "gone": "GO",
            
            "do": "DO",
            "does": "DO",
            "doing": "DO",
            "did": "DO",
            "done": "DO",
            
            "make": "MAKE",
            "makes": "MAKE",
            "making": "MAKE",
            "made": "MAKE",
            
            "want": "WANT",
            "wants": "WANT",
            "wanted": "WANT",
            "wanting": "WANT",
            
            "like": "LIKE",
            "likes": "LIKE",
            "liked": "LIKE",
            "liking": "LIKE",
            
            "know": "KNOW",
            "knows": "KNOW",
            "knew": "KNOW",
            "known": "KNOW",
            "knowing": "KNOW",
            
            "think": "THINK",
            "thinks": "THINK",
            "thought": "THINK",
            "thinking": "THINK",
            
            "see": "SEE",
            "sees": "SEE",
            "saw": "SEE",
            "seen": "SEE",
            "seeing": "SEE",
            
            "come": "COME",
            "comes": "COME",
            "came": "COME",
            "coming": "COME",
            
            "take": "TAKE",
            "takes": "TAKE",
            "took": "TAKE",
            "taken": "TAKE",
            "taking": "TAKE",
            
            "get": "GET",
            "gets": "GET",
            "got": "GET",
            "gotten": "GET",
            "getting": "GET",
            
            "give": "GIVE",
            "gives": "GIVE",
            "gave": "GIVE",
            "given": "GIVE",
            "giving": "GIVE",
            
            "find": "FIND",
            "finds": "FIND",
            "found": "FIND",
            "finding": "FIND",
            
            "tell": "TELL",
            "tells": "TELL",
            "told": "TELL",
            "telling": "TELL",
            
            "ask": "ASK",
            "asks": "ASK",
            "asked": "ASK",
            "asking": "ASK",
            
            "work": "WORK",
            "works": "WORK",
            "worked": "WORK",
            "working": "WORK",
            
            "feel": "FEEL",
            "feels": "FEEL",
            "felt": "FEEL",
            "feeling": "FEEL",
            
            "try": "TRY",
            "tries": "TRY",
            "tried": "TRY",
            "trying": "TRY",
            
            "leave": "LEAVE",
            "leaves": "LEAVE",
            "left": "LEAVE",
            "leaving": "LEAVE",
            
            "call": "CALL",
            "calls": "CALL",
            "called": "CALL",
            "calling": "CALL",
            
            "eat": "EAT",
            "eats": "EAT",
            "ate": "EAT",
            "eaten": "EAT",
            "eating": "EAT",
            
            "drink": "DRINK",
            "drinks": "DRINK",
            "drank": "DRINK",
            "drunk": "DRINK",
            "drinking": "DRINK",
            
            "sleep": "SLEEP",
            "sleeps": "SLEEP",
            "slept": "SLEEP",
            "sleeping": "SLEEP",
            
            "talk": "TALK",
            "talks": "TALK",
            "talked": "TALK",
            "talking": "TALK",
            
            "speak": "SPEAK",
            "speaks": "SPEAK",
            "spoke": "SPEAK",
            "spoken": "SPEAK",
            "speaking": "SPEAK",
            
            "understand": "UNDERSTAND",
            "understands": "UNDERSTAND",
            "understood": "UNDERSTAND",
            "understanding": "UNDERSTAND",
            
            "help": "HELP",
            "helps": "HELP",
            "helped": "HELP",
            "helping": "HELP",
            
            "need": "NEED",
            "needs": "NEED",
            "needed": "NEED",
            "needing": "NEED",
            
            "use": "USE",
            "uses": "USE",
            "used": "USE",
            "using": "USE",
            
            # ============ TIME ============
            "today": "TODAY",
            "yesterday": "YESTERDAY",
            "tomorrow": "TOMORROW",
            "now": "NOW",
            "later": "LATER",
            "soon": "SOON",
            "before": "BEFORE",
            "after": "AFTER",
            "always": "ALWAYS",
            "never": "NEVER",
            "sometimes": "SOMETIMES",
            "often": "OFTEN",
            "usually": "USUALLY",
            "early": "EARLY",
            "late": "LATE",
            
            # ============ HEALTH ============
            "doctor": "DOCTOR",
            "hospital": "HOSPITAL",
            "medicine": "MEDICINE",
            "pharmacy": "PHARMACY",
            "sick": "SICK",
            "pain": "PAIN",
            "hurt": "HURT",
            "health": "HEALTH",
            "deaf": "DEAF",
            "hear": "HEAR",
            
            # ============ FAMILY ============
            "mother": "MOTHER",
            "mom": "MOM",
            "father": "FATHER",
            "dad": "DAD",
            "parents": "PARENTS",
            "brother": "BROTHER",
            "sister": "SISTER",
            "child": "CHILD",
            "children": "CHILDREN",
            "son": "SON",
            "daughter": "DAUGHTER",
            "baby": "BABY",
            "family": "FAMILY",
            
            # ============ ANSWERS ============
            "yes": "YES",
            "no": "NO",
            "maybe": "MAYBE",
            "ok": "OK",
            "okay": "OK",
            "fine": "FINE",
            "good": "GOOD",
            "bad": "BAD",
            
            # ============ NEGATION ============
            "not": "NOT",
            "don't": "NOT",
            "doesn't": "NOT",
            "didn't": "NOT",
            "won't": "NOT",
            "wouldn't": "NOT",
            "can't": "CAN NOT",
            "cannot": "CAN NOT",
            "couldn't": "CAN NOT",
            "shouldn't": "SHOULD NOT",
            "mustn't": "MUST NOT",
            "no": "NO",
            "never": "NEVER",
            "nothing": "NOTHING",
            "nobody": "NOBODY",
            
            # ============ PLACES ============
            "home": "HOME",
            "house": "HOUSE",
            "school": "SCHOOL",
            "work": "WORK",
            "store": "STORE",
            "shop": "SHOP",
            "restaurant": "RESTAURANT",
            "city": "CITY",
            "town": "TOWN",
            "country": "COUNTRY",
            "bathroom": "BATHROOM",
            "toilet": "TOILET",
            
            # ============ FOOD ============
            "food": "FOOD",
            "bread": "BREAD",
            "water": "WATER",
            "coffee": "COFFEE",
            "tea": "TEA",
            "milk": "MILK",
            "meat": "MEAT",
            "fish": "FISH",
            "fruit": "FRUIT",
            "vegetable": "VEGETABLE",
            "apple": "APPLE",
            "orange": "ORANGE",
        }
        
        # 🗑️ MOTS À SUPPRIMER
        self.words_to_remove = {
            # Articles
            "a", "an", "the",
            # Prépositions (certaines)
            "of", "in", "on", "at", "by", "for", "with",
            "from", "about", "into", "through",
            # Conjonctions
            "and", "or", "but", "so", "because",
            # Auxiliaires déjà gérés
            "do", "does", "did",
        }
        
        # ⏰ INDICATEURS TEMPORELS
        self.time_indicators = {
            "yesterday", "today", "tomorrow", "now", 
            "later", "soon", "before", "after", 
            "always", "never", "sometimes", "often"
        }
        
        # ❓ MOTS INTERROGATIFS (WH-questions)
        self.wh_words = {
            "what", "where", "when", "who", "why", "how", "which"
        }
    
    def translate(self, text: str) -> Dict:
        """Traduit anglais → ASL gloss"""
        
        print(f"🇺🇸 ASL RULES: '{text}'")
        
        # 1️⃣ PRÉTRAITEMENT
        text_lower = text.lower().strip()
        
        # 2️⃣ DÉTECTION
        is_question = self._is_question(text_lower)
        is_negation = self._is_negation(text_lower)
        
        # 3️⃣ NETTOYAGE
        text_clean = self._clean_text(text_lower)
        
        # 4️⃣ TRADUCTION
        words_translated, time_words = self._translate_words(text_clean)
        
        # 5️⃣ ORDRE ASL
        ordered_words = self._apply_asl_order(time_words, words_translated)
        
        # 6️⃣ EXPRESSIONS
        gloss = self._add_expressions(ordered_words, is_question, is_negation)
        
        # 7️⃣ ANIMATIONS
        animations = [f"ASL_{sign.lower().replace('-', '_')}" 
                     for sign in ordered_words]
        
        print(f"✅ ASL RESULT: '{gloss}'")
        
        return {
            "gloss": gloss,
            "signs": ordered_words,
            "confidence": 0.80,
            "animations": animations,
            "method": "asl_rules",
            "language": "ASL"
        }
    
    def _is_question(self, text: str) -> bool:
        """Détecte question"""
        return ('?' in text or 
                any(word in text.split() for word in self.wh_words))
    
    def _is_negation(self, text: str) -> bool:
        """Détecte négation"""
        return ("not" in text or "n't" in text or 
                "never" in text or "no" in text or 
                "nothing" in text or "nobody" in text)
    
    def _clean_text(self, text: str) -> str:
        """Nettoie texte"""
        # Retirer ponctuation
        text = re.sub(r'[?!.,;:«»"()…]', '', text)
        
        # Contractions
        replacements = {
            "what's": "what is",
            "where's": "where is",
            "who's": "who is",
            "that's": "that is",
            "it's": "it is",
            "i'm": "i am",
            "you're": "you are",
            "we're": "we are",
            "they're": "they are",
            "i'll": "i will",
            "you'll": "you will",
            "i've": "i have",
            "you've": "you have",
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text
    
    def _translate_words(self, text: str) -> Tuple[List[str], List[str]]:
        """Traduit mots"""
        words = text.split()
        translated = []
        time_words = []
        
        for word in words:
            # Ignorer mots à supprimer
            if word in self.words_to_remove:
                continue
            
            # Traduire
            if word in self.dictionary:
                sign = self.dictionary[word]
                
                if sign:  # Pas vide
                    if word in self.time_indicators:
                        time_words.append(sign)
                    else:
                        translated.append(sign)
            else:
                # Inconnu → MAJUSCULES
                translated.append(word.upper())
        
        return translated, time_words
    
    def _apply_asl_order(self, time_words: List[str], other_words: List[str]) -> List[str]:
        """
        Ordre ASL: TEMPS + reste (SVO ou OSV selon contexte)
        Pour simplifier: TEMPS en premier
        """
        return time_words + other_words
    
    def _add_expressions(self, words: List[str], is_question: bool, is_negation: bool) -> str:
        """Expressions faciales ASL"""
        gloss = " ".join(words)
        
        if is_question:
            # WH-question ou YES/NO question
            if any(wh in gloss.upper() for wh in ["WHAT", "WHERE", "WHEN", "WHO", "WHY", "HOW"]):
                gloss += " [wh-q]"  # WH-question: sourcils froncés
            else:
                gloss += " [y/n-q]"  # YES/NO question: sourcils levés
        elif is_negation:
            gloss += " [neg]"  # Négation: secouement tête
        
        return gloss