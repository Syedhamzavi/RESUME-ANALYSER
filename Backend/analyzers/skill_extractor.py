import re
import spacy
from typing import List, Dict, Set, Any
from collections import defaultdict


SKILLS_DATABASE = {
    "programming": [
        "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go",
        "rust", "typescript", "html", "css", "sql", "r", "matlab", "scala", "perl", "bash",
        "shell", "powershell", "dart", "objective-c", "assembly", "fortran", "cobol", "lua"
    ],
    "frameworks": [
        "django", "flask", "spring", "angular", "vue", "express", "laravel", "rails",
        "asp.net", "tensorflow", "pytorch", "keras", "node.js", "react", "react native",
        "flutter", "jquery", "bootstrap", "ember", "backbone", "meteor", "svelte", "next.js",
        "nuxt.js", "nestjs", "fastapi", "graphql", "hibernate", "mybatis", "jpa"
    ],
    "databases": [
        "mysql", "postgresql", "mongodb", "redis", "oracle", "sql server", "cassandra",
        "elasticsearch", "dynamodb", "firebase", "cosmosdb", "sqlite", "mariadb", "couchdb",
        "neo4j", "arangodb", "rethinkdb", "couchbase", "memcached", "hbase", "bigtable"
    ],
    "cloud": [
        "aws", "azure", "google cloud", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "ci/cd", "serverless", "lambda", "ec2", "s3", "azure functions",
        "google functions", "cloud formation", "cloudwatch", "azure devops", "github actions",
        "circleci", "gitlab ci", "travis ci", "heroku", "digital ocean", "linode", "vultr"
    ],
    "tools": [
        "git", "github", "gitlab", "jira", "confluence", "slack", "trello", "jenkins",
        "circleci", "github actions", "docker", "kubernetes", "postman", "swagger",
        "visual studio", "intellij", "eclipse", "vs code", "android studio", "xcode",
        "webstorm", "pycharm", "phpstorm", "rubymine", "sublime", "atom", "notepad++"
    ],
    "methodologies": [
        "agile", "scrum", "kanban", "waterfall", "devops", "ci/cd", "tdd", "bdd",
        "pair programming", "code review", "version control", "microservices", "monolith",
        "rest", "soap", "graphql", "grpc", "oauth", "jwt", "openid", "saml"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking",
        "adaptability", "time management", "creativity", "collaboration", "presentation",
        "mentoring", "coaching", "negotiation", "conflict resolution", "decision making",
        "strategic thinking", "analytical skills", "attention to detail", "multitasking"
    ]
}


all_skills = [skill for category_skills in SKILLS_DATABASE.values() for skill in category_skills]
skill_to_category_map = {skill: category for category, skills in SKILLS_DATABASE.items() for skill in skills}
sorted_skills = sorted(all_skills, key=len, reverse=True)
skills_pattern = r'\b(' + '|'.join(re.escape(skill) for skill in sorted_skills) + r')s?\b'
COMPILED_SKILLS_REGEX = re.compile(skills_pattern, re.IGNORECASE)


nlp = spacy.load("en_core_web_sm")
matcher = spacy.matcher.PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(skill) for skill in all_skills]
matcher.add("SKILL", patterns)


def extract_skills(text: str) -> Dict[str, List[str]]:    
    if not text or not isinstance(text, str): return {}
    found_skills = defaultdict(set)
    try:
        matches = COMPILED_SKILLS_REGEX.finditer(text)
        for match in matches:
            skill_match = match.group(0).lower()
            skill = skill_match[:-1] if skill_match.endswith('s') and skill_match[:-1] in skill_to_category_map else skill_match
            category = skill_to_category_map.get(skill)
            if category:
                found_skills[category].add(skill)
        return {category: sorted(list(skills)) for category, skills in found_skills.items()}
    except Exception as e:
        print(f"Error extracting skills: {e}")
        return {}


def extract_skills_with_context(text: str) -> Dict[str, List[Dict[str, Any]]]:    
    if not text or not isinstance(text, str): return {}
    doc = nlp(text)
    matches = matcher(doc)

    unique_skills_with_context = defaultdict(set)
    
    for match_id, start, end in matches:
        span = doc[start:end]
        skill = span.text.lower()
        sentence = span.sent.text.strip()
        category = skill_to_category_map.get(skill)
        
        if category:
            unique_skills_with_context[category].add((skill, sentence))
            

    found_skills = defaultdict(list)
    for category, skill_set in unique_skills_with_context.items():
        for skill, sentence in sorted(list(skill_set)):
            found_skills[category].append({"skill": skill, "context": sentence})
            
    return dict(found_skills)


def extract_experience(text: str) -> int:
    if not text or not isinstance(text, str): return 0
    max_experience = 0
    try:
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of)?\s*experience',
            r'experience\s*:\s*(\d+)\+?\s*years?',
            r'(\d+)\s*years?\s*(?:in|of)',
            r'(\d+)\s*-\s*(\d+)\s*years?\s*experience',
            r'minimum\s*of\s*(\d+)\s*years',
            r'at least\s*(\d+)\s*years'
        ]
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    exp = max(int(m) for m in match if m.isdigit()) if isinstance(match, tuple) else int(match)
                    max_experience = max(max_experience, exp)
                except ValueError:
                    continue
    except Exception as e:
        print(f"Error extracting experience: {e}")
        return 0
    return max_experience