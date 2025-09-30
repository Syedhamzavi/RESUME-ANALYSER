import re

STOP_WORDS = ['and', 'of', 'in', 'the', '&']
STOP_WORD_PATTERN = re.compile(r'\b(' + '|'.join(STOP_WORDS) + r')\b', flags=re.IGNORECASE)
PUNCTUATION_PATTERN = re.compile(r'[^\w\s]')
WHITESPACE_PATTERN = re.compile(r'\s+')

def bulletproof_normalize_text(text: str) -> str:   
    if not text:
        return ""
 
    text = text.lower()
    
    text = PUNCTUATION_PATTERN.sub('', text)
  
    text = STOP_WORD_PATTERN.sub(' ', text)
    
    text = WHITESPACE_PATTERN.sub(' ', text)
    
    return text.strip()