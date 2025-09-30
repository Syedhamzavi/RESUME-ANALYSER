import re
from typing import Dict, List
from collections import defaultdict

SKILLS_DATABASE = {
    "programming": ["python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript", "html", "css", "sql", "r", "matlab", "scala", "perl", "bash", "shell", "powershell", "dart", "objective-c", "assembly", "fortran", "cobol", "lua"],
    "frameworks": ["django", "flask", "spring", "angular", "vue", "express", "laravel", "rails", "asp.net", "tensorflow", "pytorch", "keras", "node.js", "react", "react native", "flutter", "jquery", "bootstrap", "ember", "backbone", "meteor", "svelte", "next.js", "nuxt.js", "nestjs", "fastapi", "graphql", "hibernate", "mybatis", "jpa"],
    "databases": ["mysql", "postgresql", "mongodb", "redis", "oracle", "sql server", "cassandra", "elasticsearch", "dynamodb", "firebase", "cosmosdb", "sqlite", "mariadb", "couchdb", "neo4j", "arangodb", "rethinkdb", "couchbase", "memcached", "hbase", "bigtable"],
    "cloud": ["aws", "azure", "google cloud", "docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd", "serverless", "lambda", "ec2", "s3", "azure functions", "google functions", "cloud formation", "cloudwatch", "azure devops", "github actions", "circleci", "gitlab ci", "travis ci", "heroku", "digital ocean", "linode", "vultr"],
    "tools": ["git", "github", "gitlab", "jira", "confluence", "slack", "trello", "jenkins", "circleci", "github actions", "docker", "kubernetes", "postman", "swagger", "visual studio", "intellij", "eclipse", "vs code", "android studio", "xcode", "webstorm", "pycharm", "phpstorm", "rubymine", "sublime", "atom", "notepad++"],
    "methodologies": ["agile", "scrum", "kanban", "waterfall", "devops", "ci/cd", "tdd", "bdd", "pair programming", "code review", "version control", "microservices", "monolith", "rest", "soap", "graphql", "grpc", "oauth", "jwt", "openid", "saml"],
    "soft_skills": ["leadership", "communication", "teamwork", "problem solving", "critical thinking", "adaptability", "time management", "creativity", "collaboration", "presentation", "mentoring", "coaching", "negotiation", "conflict resolution", "decision making", "strategic thinking", "analytical skills", "attention to detail", "multitasking"]
}

all_skills = [skill for category_skills in SKILLS_DATABASE.values() for skill in category_skills]
skill_to_category_map = {skill: cat for cat, skills in SKILLS_DATABASE.items() for skill in skills}
sorted_skills = sorted(all_skills, key=len, reverse=True)
skills_pattern = r'\b(' + '|'.join(re.escape(skill) for skill in sorted_skills) + r')\b'
COMPILED_SKILLS_REGEX = re.compile(skills_pattern, re.IGNORECASE)


def extract_skills(text: str) -> Dict[str, List[str]]:
    if not text or not isinstance(text, str): return {}
    found_skills = defaultdict(set)
    try:
        matches = COMPILED_SKILLS_REGEX.finditer(text)
        for match in matches:
            skill = match.group(0).lower()
            category = skill_to_category_map.get(skill)
            if category:
                found_skills[category].add(skill)
        return {cat: sorted(list(skills)) for cat, skills in found_skills.items()}
    except Exception:
        return {}


def extract_experience(text: str) -> int:
    if not text or not isinstance(text, str): return 0
    
    try:
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of)?\s*experience',
            r'experience\s*:\s*(\d+)\+?\s*years?',
            r'(\d+)\s*years?\s*(?:in|of)',
            r'(\d+)\s*-\s*(\d+)\s*years?\s*experience',
            r'minimum\s*of\s*(\d+)\s*years',
            r'at least\s*(\d+)\s*years'
        ]
        max_experience = 0
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    if isinstance(match, tuple):
                        exp = max(int(m) for m in match if m.isdigit())
                    else:
                        exp = int(match)
                    max_experience = max(max_experience, exp)
                except ValueError:
                    continue
        return max_experience
    except Exception:
        return 0


def extract_education_from_text(text: str) -> List[Dict]:

    education_patterns = [
        (r'\b(bachelor\s+of\s+engineering|b\.?e\.?)\b', 'bachelor'),
        (r'\b(bachelor\s+of\s+technology|b\.?tech)\b', 'bachelor'),
        (r'\b(bachelor\s+of\s+science|b\.?sc\.?)\b', 'bachelor'),
        (r'\b(bachelor[\'s]?)\b', 'bachelor'),
        (r'\b(master\s+of\s+engineering|m\.?e\.?)\b', 'master'),
        (r'\b(master\s+of\s+technology|m\.?tech)\b', 'master'),
        (r'\b(master\s+of\s+science|m\.?sc\.?)\b', 'master'),
        (r'\b(master\s+of\s+business\s+administration|mba)\b', 'master'),
        (r'\b(master[\'s]?)\b', 'master'),
        (r'\b(doctorate|phd|ph\.d)\b', 'phd'),
    ]
    
    found_education = []

    seen_education = set()
    
    sentences = re.split(r'[.\n]', text)
    for sentence in sentences:
        if not sentence.strip(): continue
        
        for pattern, degree_type in education_patterns:
            match = re.search(pattern, sentence, re.IGNORECASE)
            if match:

                remaining_sentence = sentence[match.end():]
                field_match = re.search(r'^\s*(?:in|of)?\s+([\w\s]+(?:(?:and|&)\s*[\w\s]+)*)', remaining_sentence, re.IGNORECASE)
                field = field_match.group(1).strip() if field_match else ""
                
                edu_key = (degree_type, field.lower())
                if edu_key not in seen_education:
                    found_education.append({"degree": degree_type, "field": field})
                    seen_education.add(edu_key)

                break
                
    return found_education


def extract_job_title(text: str) -> str:


    lines = [line.strip() for line in text.split('\n') if line.strip()][:3]
    

    title_keywords = ['engineer', 'developer', 'analyst', 'manager', 'scientist', 'specialist', 'architect']
    
    for line in lines:

        if len(line.split()) < 10 and any(keyword in line.lower() for keyword in title_keywords):
            return line
            

    return lines[0] if lines else "Not specified"


def parse_job_description(jd_text: str) -> Dict:

    if not jd_text or not isinstance(jd_text, str):
        return {"job_title": "Not specified", "required_skills": {}, "experience_required": 0, "education_required": [], "raw_text": ""}
    
    return {
        "job_title": extract_job_title(jd_text),
        "required_skills": extract_skills(jd_text),
        "experience_required": extract_experience(jd_text),
        "education_required": extract_education_from_text(jd_text),
        "raw_text": jd_text
    }
