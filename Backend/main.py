import io
from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import docx

from analyzers.jd_parser import parse_job_description
from analyzers.jd_matcher import calculate_match_score
from analyzers.docx_analyzer import analyze_resume_bytes

ALLOWED_ORIGINS = [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:8000", "http://127.0.0.1:8000",
]
MAX_UPLOAD_MB = 8
ALLOWED_RESUME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_JD_TYPES = {
    "text/plain", "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

app = FastAPI(title="Resume Analyzer API", version="3.0.0 FINAL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

async def _process_upload_file(file: UploadFile, allowed_types: set) -> bytes:
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Please upload one of: {', '.join(allowed_types)}")
    
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File is too large. Maximum size is {MAX_UPLOAD_MB}MB.")
    
    return contents

def _extract_text_from_file(file_bytes: bytes, content_type: str) -> str:
    text = ""
    try:
        if content_type == "application/pdf":
            reader = PdfReader(io.BytesIO(file_bytes))
            text = "".join([page.extract_text() or "" for page in reader.pages])
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])
        elif content_type == "text/plain":
            text = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text from file: {e}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the provided file.")
        
    return text

@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0 FINAL"}

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):

    try:
        file_bytes = await _process_upload_file(file, ALLOWED_RESUME_TYPES)
        result = analyze_resume_bytes(io.BytesIO(file_bytes), file.filename or "resume")
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during analysis: {e}")

@app.post("/analyze-with-jd")
async def analyze_with_jd(resume_file: UploadFile = File(...), jd_file: UploadFile = File(...)):
    
    try:
        resume_bytes = await _process_upload_file(resume_file, ALLOWED_RESUME_TYPES)
        resume_analysis = analyze_resume_bytes(io.BytesIO(resume_bytes), resume_file.filename or "resume")
        if "error" in resume_analysis:
            raise HTTPException(status_code=400, detail=f"Resume analysis error: {resume_analysis['error']}")

        jd_bytes = await _process_upload_file(jd_file, ALLOWED_JD_TYPES)
        jd_text = _extract_text_from_file(jd_bytes, jd_file.content_type)
        parsed_jd = parse_job_description(jd_text)

        match_result = calculate_match_score(resume_analysis, parsed_jd)

        final_result = resume_analysis
        final_result["jd_analysis"] = match_result
        final_result["job_description"] = {
            "job_title": parsed_jd.get("job_title", "Unknown Position"),
            "required_experience": parsed_jd.get("experience_required", 0),
            "required_education": parsed_jd.get("education_required", [])
        }
        
        return final_result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during JD analysis: {e}")
