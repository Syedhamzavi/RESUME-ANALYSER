import re
from typing import Dict, List

print("--- Starting Standalone Diagnostic Test ---")

# --- Test Data ---
# Using the exact text from your resume and JD samples
RESUME_TEXT = """
HUZAIFA NISHANI
Aspiring Software Developer


OVERVIEW
Results -driven software developer with expertise in full -stack development, focused on delivering scalable and
efficient solutions. Passionate about adopting emerging technologies and optimizing performance. Thrives on new
challenges with a growth mindset, continually enhancing skills. Avid traveler with a broad perspective enriching
both personal and professional life. +91 7349641585
nishani.huzaif@gmail.com
Linked In profile
Koppal , Karnataka , India.
EDUCATION
• BE in Computer Science | GEC, Koppal | 2020 - 2024 | 8.3 CGPA .
• Senior Secondary (XII) | S.G College, Koppal | 2020 | 89%.
• Secondary (X) | Trinity Public School, Koppal | 2018 | 93%.
INTERNSHIP
• Software Developer Intern |Rexroth Bosch |Bengaluru
Aug – Sep 2023
Engineered a Pump Search Application in Python to automate metadata
processing and streamline Excel -based data integration. Designed an
intuitive, filter -driven UI for efficient attribute -based searches. Developed
and deployed Flask -based REST APIs with enhanced CORS policies to
ensure secure and scalable cross -origin communication.
• Full Stack Development Trainee |Kodnest Technologies |Bengaluru
Developed scalable backend systems using Java, Spring Boot, SQL, and
MongoDB. Engineered responsive, component -based front -end
interfaces with HTML, CSS, JavaScript, and React, focusing on optimized
user experience and architecture.
PROJECTS
• Drone -Based Magnetic Intelligent Sensing System
May 2024
Led the development of an autonomous drone system equipped with
magnetic sensors for precision field analysis. Engineered a robust data
integration model to aggregate multi -sensor inputs, enhancing real -time
assessment accuracy and supporting data -driven d ecision -making.
TECHNICAL SKILLS
• Programming Languages:
Java (Fundamentals, OOP
Concepts), SQL, HTML,
CSS, JavaScript
• Web Development:
Front -End (HTML, CSS,
JavaScript, React)
"""

JD_TEXT = """
Software Engineer Position
We are looking for a skilled software engineer to join our team.

Required Skills and Qualifications
·       Experience 1+ years
·       Bachelor of engineering in computer science
·       Strong understanding of Python/R programming and SQL.
"""

# --- Self-Contained Parsing Functions (Final Versions) ---
# These are the core logic functions from your project, put here to ensure they are tested directly.

def extract_experience(text: str) -> int:
    if not text or not isinstance(text, str): return 0
    try:
        text_lower = text.lower()
        experience_patterns = [
            r'experience\s+(\d+)\+?\s*years?', r'(\d+)\+?\s*years?\s*(?:of)?\s*experience',
            r'experience\s*:\s*(\d+)\+?\s*years?', r'(\d+)\s*years?\s*(?:in|of)',
            r'(\d+)\s*-\s*(\d+)\s*years?\s*experience', r'minimum\s*of\s*(\d+)\s*years', r'at least\s*(\d+)\s*years'
        ]
        max_experience = 0
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                for match in matches:
                    try:
                        if isinstance(match, tuple): exp = max(int(m) for m in match if str(m).isdigit())
                        else: exp = int(match)
                        max_experience = max(max_experience, exp)
                    except: continue
        return max_experience
    except Exception: return 0

def extract_job_title(text: str) -> str:
    """Extracts the job title from the JD text using a series of robust patterns."""
    patterns = [
        r'(?:job\s+title|position|role)[:\s-]+([^\n\r]+)',
        r'(senior|junior|lead|sr\.|jr\.)?\s*(software|data|product|qa|web|full.?stack|front.?end|back.?end)\s*(developer|engineer|analyst|scientist|manager)',
        r'(?:we are|we\'re|looking for|hiring)\s+(?:an?|a)\s+([^\n\r,.]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if "developer" in pattern or "engineer" in pattern:
                 full_title = ' '.join(filter(None, match.groups())).strip()
                 if len(full_title) > 3: return full_title
            if match.group(1):
                return match.group(1).strip()
    for line in text.split('\n')[:5]:
        clean_line = line.strip()
        if clean_line and len(clean_line) < 70 and any(kw in clean_line.lower() for kw in ['engineer', 'developer', 'analyst', 'manager', 'scientist']):
            return clean_line
    return "Not specified"

def extract_resume_title(text: str) -> str:
    lines = text.split('\n')
    for line in lines[:10]:
        line_lower = line.lower().strip()
        if any(keyword in line_lower for keyword in ['developer', 'engineer', 'analyst', 'specialist', 'architect', 'manager', 'designer']) and len(line_lower) < 60:
            return line.strip()
    return "Not specified"

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"\+?\d[\d\s-]{8,}\d")
LINKEDIN_RE = re.compile(r"linkedin\.com/(in|pub)/[a-zA-Z0-9_-]+", re.I)
GITHUB_RE = re.compile(r"github\.com/[a-zA-Z0-9_-]{1,39}/?", re.I)

def _extract_contacts(text: str):
    def first(rx):
        m = rx.search(text)
        return m.group(0) if m else None
    return {
        "email": first(EMAIL_RE), 
        "phone": first(PHONE_RE), 
        "linkedin": first(LINKEDIN_RE), 
        "github": first(GITHUB_RE)
    }

# --- Running the Test ---

print("\n--- 1. ANALYZING RESUME ---")
resume_experience = extract_experience(RESUME_TEXT)
print(f"Resume Experience Extracted: {resume_experience} (Expected: 0)")

resume_title = extract_resume_title(RESUME_TEXT)
print(f"Resume Title Extracted: '{resume_title}' (Expected: 'Aspiring Software Developer')")

contacts = _extract_contacts(RESUME_TEXT)
print(f"Contacts Extracted: {contacts}")
print("Checking for missing LinkedIn/GitHub...")
if not contacts.get("linkedin"):
    print("  - LinkedIn is missing (Correctly identified)")
if not contacts.get("github"):
    print("  - GitHub is missing (Correctly identified)")

print("\n--- 2. ANALYZING JOB DESCRIPTION ---")
jd_experience = extract_experience(JD_TEXT)
print(f"JD Experience Extracted: {jd_experience} (Expected: 1)")

jd_title = extract_job_title(JD_TEXT)
print(f"JD Title Extracted: '{jd_title}' (Expected: 'Software Engineer Position' or similar)")

print("\n--- 3. SIMULATING MATCH SCORE ---")
if jd_experience > 0 and resume_experience < jd_experience:
    print("Experience Match Score: 0% (Correctly fails)")
else:
    print(f"Experience Match Score: 100% (Resume Exp: {resume_experience}, JD Exp: {jd_experience})")


print("\n--- End of Diagnostic Test ---")