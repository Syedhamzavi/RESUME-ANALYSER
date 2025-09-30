from typing import Dict, List, Set
import re
from .utils import bulletproof_normalize_text
from thefuzz import fuzz

SKILL_WEIGHT = 0.45
EXPERIENCE_WEIGHT = 0.30
EDUCATION_WEIGHT = 0.20
KEYWORD_WEIGHT = 0.05

EDUCATION_PENALTY_THRESHOLD = 50.0
OVERALL_SCORE_CAP = 65.0

FIELD_ALIASES = {
    "ai": "artificial intelligence",
    "ml": "machine learning",
    "cs": "computer science",
    "it": "information technology",
    "ece": "electronics and communication engineering",
    "eee": "electrical and electronics engineering",
}

SKILL_ALIASES = {
    "js": "javascript", "py": "python", "c#": "csharp", "c++": "cpp", "reactjs": "react",
    "nodejs": "node", "aws": "amazon web services", "gcp": "google cloud platform",
    "sql server": "microsoft sql server", "html5": "html", "css3": "css", "tensorflow": "tf",
    "pytorch": "torch", "k8s": "kubernetes", "visual studio code": "vs code", "mssql": "sql server",
    "ci/cd": "continuous integration and continuous deployment", "devops": "development and operations",
    "db": "database", "dbms": "database management system", "oop": "object oriented programming",
    "mvc": "model view controller", "rest": "representational state transfer",
    "api": "application programming interface", "oauth": "open authorization"
}

DEGREE_MAP = {
    "b.e": "bachelor",
    "b.e.": "bachelor",
    "btech": "bachelor",
    "b.tech": "bachelor",
    "b.tech.": "bachelor",
    "b.sc": "bachelor",
    "b.sc.": "bachelor",
    "m.e": "master",
    "m.e.": "master",
    "mtech": "master",
    "m.tech": "master",
    "m.tech.": "master",
    "m.sc": "master",
    "m.sc.": "master",
    "mba": "master",
    "ph.d": "phd"
}

def expand_field_aliases(text: str) -> str:
    for alias, expansion in FIELD_ALIASES.items():
        text = re.sub(r'\b' + re.escape(alias) + r'\b', expansion, text, flags=re.IGNORECASE)
    return text

def normalize_skills(skills: List[str]) -> Set[str]:
    normalized_set = set()
    reverse_aliases = {v: k for k, v in SKILL_ALIASES.items()}
    for skill in skills:
        s_lower = skill.lower()
        normalized_set.add(s_lower)
        if s_lower in SKILL_ALIASES:
            normalized_set.add(SKILL_ALIASES[s_lower])
        if s_lower in reverse_aliases:
            normalized_set.add(reverse_aliases[s_lower])
    return normalized_set

def flatten_skills(skills_dict: Dict[str, List[str]]) -> List[str]:
    if not skills_dict: return []
    flat_set = set()
    for skill_list in skills_dict.values():
        if isinstance(skill_list, list):
            flat_set.update(s for s in skill_list if s)
    return list(flat_set)

def get_degree_match_score(resume_degree: str, jd_degree: str) -> float:
    if not jd_degree: return 1.0
    if not resume_degree: return 0.0
    
    resume_base = DEGREE_MAP.get(resume_degree.lower(), resume_degree.lower())
    jd_base = DEGREE_MAP.get(jd_degree.lower(), jd_degree.lower())
    
    degree_hierarchy = {"phd": 5, "master": 4, "bachelor": 3}
    resume_rank = degree_hierarchy.get(resume_base, 0)
    jd_rank = degree_hierarchy.get(jd_base, 0)
    
    if resume_rank == 0 or jd_rank == 0:
        return 0.75 if resume_base == jd_base else 0.0
    
    if resume_rank >= jd_rank:
        return 1.0
    
    return 0.5 if (jd_rank - resume_rank) == 1 else 0.1

def get_field_match_score(resume_field: str, jd_field: str) -> float:
    if not jd_field: return 1.0
    if not resume_field: return 0.0
    
    resume_field_norm = bulletproof_normalize_text(expand_field_aliases(resume_field))
    jd_fields_possible = [
        bulletproof_normalize_text(expand_field_aliases(f.strip())) 
        for f in jd_field.split(' or ')
    ]

    if resume_field_norm in jd_fields_possible:
        return 1.0
    
    best_fuzzy_score = max(fuzz.partial_ratio(resume_field_norm, f) for f in jd_fields_possible if f)
    
    if best_fuzzy_score > 85:
        return best_fuzzy_score / 115
        
    return 0.0

def _calculate_education_matches(resume_edu: List[Dict], jd_edu: List[Dict]) -> dict:
    details = {
        "resume_education": resume_edu, "jd_requirements": jd_edu, 
        "matches": [], "best_match_score": 0.0
    }
    if not jd_edu or not resume_edu: return details

    best_overall_score = 0.0
    for jd_req in jd_edu:
        for resume_item in resume_edu:
            degree_score = get_degree_match_score(resume_item.get("degree", ""), jd_req.get("degree", ""))
            field_score = get_field_match_score(resume_item.get("field", ""), jd_req.get("field", ""))
            combined_score = degree_score * field_score
            best_overall_score = max(best_overall_score, combined_score)
            
            match_details = {
                "resume_degree": resume_item.get("degree"), "jd_degree": jd_req.get("degree"),
                "degree_score": round(degree_score, 2), "resume_field": resume_item.get("field"),
                "jd_field": jd_req.get("field"), "field_score": round(field_score, 2),
                "combined_score": round(combined_score, 2)
            }
            details["matches"].append(match_details)
            
    details["best_match_score"] = round(best_overall_score, 2)
    return details

def education_similarity(resume_edu: List[Dict], jd_edu: List[Dict]) -> float:
    if not jd_edu or not any(jd_edu): return 1.0
    if not resume_edu or not any(resume_edu): return 0.0
    return _calculate_education_matches(resume_edu, jd_edu)["best_match_score"]

def get_education_matching_details(resume_edu: List[Dict], jd_edu: List[Dict]) -> Dict:
    return _calculate_education_matches(resume_edu, jd_edu)

def skill_similarity(r_skills: List[str], j_skills: List[str]) -> float:
    if not j_skills: return 1.0
    j_set = normalize_skills(j_skills)
    if not j_set: return 1.0
    r_set = normalize_skills(r_skills)
    return len(r_set.intersection(j_set)) / len(j_set)

def find_missing_skills(r_skills: List[str], j_skills: List[str]) -> List[str]:
    if not j_skills: return []
    j_set = normalize_skills(j_skills)
    r_set = normalize_skills(r_skills)
    original_j_skills_map = {s.lower(): s for s in j_skills}
    missing_lower = j_set - r_set
    return sorted([original_j_skills_map.get(s, s) for s in missing_lower])

def find_matching_skills(r_skills: List[str], j_skills: List[str]) -> List[str]:
    if not j_skills or not r_skills: return []
    j_set = normalize_skills(j_skills)
    r_set = normalize_skills(r_skills)
    original_j_skills_map = {s.lower(): s for s in j_skills}
    matching_lower = r_set.intersection(j_set)
    return sorted([original_j_skills_map.get(s, s) for s in matching_lower])
    
def experience_similarity(r_exp: int, j_exp: int) -> float:
    if j_exp <= 0: return 1.0
    return 1.0 if r_exp >= j_exp else r_exp / j_exp

def simple_text_similarity(r_text: str, j_text: str) -> float:
    if not r_text or not j_text: return 0.0
    stop_words = {'the', 'a', 'an', 'in', 'on', 'at', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'}
    r_words = {w for w in re.findall(r'\b[a-z]{3,}\b', r_text.lower()) if w not in stop_words}
    j_words = {w for w in re.findall(r'\b[a-z]{3,}\b', j_text.lower()) if w not in stop_words}
    if not j_words: return 0.0
    intersection = r_words.intersection(j_words)
    union = r_words.union(j_words)
    return len(intersection) / len(union) if union else 0.0

def calculate_match_score(resume_data: Dict, jd_data: Dict) -> Dict:
    resume_skills = flatten_skills(resume_data.get("skills", {}))
    jd_skills = flatten_skills(jd_data.get("required_skills", {}))
    resume_experience = int(resume_data.get("experience", 0))
    jd_experience = int(jd_data.get("experience_required", 0))
    resume_education = resume_data.get("education", [])
    jd_education = jd_data.get("education_required", [])
    
    skill_match_percent = skill_similarity(resume_skills, jd_skills) * 100
    exp_match_percent = experience_similarity(resume_experience, jd_experience) * 100
    edu_match_percent = education_similarity(resume_education, jd_education) * 100
    keyword_match_percent = simple_text_similarity(
        resume_data.get("full_text", ""), jd_data.get("raw_text", "")
    ) * 100

    weights = {
        "skills": SKILL_WEIGHT, "experience": EXPERIENCE_WEIGHT, 
        "education": EDUCATION_WEIGHT, "keywords": KEYWORD_WEIGHT
    }
    scores = {
        "skills": skill_match_percent, "experience": exp_match_percent,
        "education": edu_match_percent, "keywords": keyword_match_percent
    }
    overall_score = sum(scores[key] * weights[key] for key in scores)

    if edu_match_percent < EDUCATION_PENALTY_THRESHOLD and jd_data.get("education_required"):
        overall_score = min(overall_score, OVERALL_SCORE_CAP)
        
    overall_score = max(0, min(100, overall_score))

    return {
        "overall_score": round(overall_score, 1),
        "skill_match": round(skill_match_percent, 1),
        "experience_match": round(exp_match_percent, 1),
        "education_match": round(edu_match_percent, 1),
        "keyword_match": round(keyword_match_percent, 1),
        "matching_skills": find_matching_skills(resume_skills, jd_skills),
        "missing_skills": find_missing_skills(resume_skills, jd_skills),
        "education_details": get_education_matching_details(resume_education, jd_education)
    }