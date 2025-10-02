import React, { useState } from "react";
import { analyzeWithJD } from "../services/api";

export default function JDUploadForm({ onUploadComplete }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResumeDragOver, setIsResumeDragOver] = useState(false);
  const [isJdDragOver, setIsJdDragOver] = useState(false);

  const MAX_FILE_MB = 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jdFile) {
      setError("Please select both a resume and a job description file.");
      return;
    }

    if (resumeFile.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Resume exceeds ${MAX_FILE_MB} MB.`);
      return;
    }
    if (jdFile.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Job description exceeds ${MAX_FILE_MB} MB.`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await analyzeWithJD(resumeFile, jdFile);
      onUploadComplete(result);
    } catch (err) {
      setError(err.message || "Failed to analyze files.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    setIsResumeDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };

  const handleJdDrop = (e) => {
    e.preventDefault();
    setIsJdDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setJdFile(file);
  };

  const getFileTypeText = (file) => {
    if (!file) return "";
    switch (file.type) {
      case "application/pdf": return "PDF";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": return "DOCX";
      case "text/plain": return "TXT";
      default: return file.name.split('.').pop().toUpperCase();
    }
  };

  return (
    <div className="jd-upload-container">
      {/* ADD ALL THESE CSS STYLES */}
      <style>
        {`
          .jd-upload-container {
            width: 100%;
          }
          
          .upload-section {
            margin-bottom: 1.5rem;
          }
          
          .upload-title {
            font-weight: 600;
            color: #e0e0e0;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
          }
          
          .drop-zone {
            border: 2px dashed rgba(75, 91, 148, 0.3);
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(80, 114, 165, 0.05);
          }
          
          .drop-zone:hover {
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.08);
          }
          
          .drop-zone.drag-over {
            border-color: #3498db;
            background: rgba(52, 152, 219, 0.1);
          }
          
          .drop-zone-text {
            color: #e0e0e0;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          
          .format-hint {
            color: #bbbbbb;
            font-size: 0.9rem;
          }
          
          .file-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          
          .file-type-badge {
            background: rgba(52, 152, 219, 0.2);
            color: #3498db;
            padding: 0.2rem 0.8rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .d-none {
            display: none !important;
          }
          
          .alert-danger {
            background: rgba(220, 53, 69, 0.2);
            border: 1px solid rgba(220, 53, 69, 0.3);
            color: #f8d7da;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 1rem;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #2c3e50);
            border: none;
            padding: 0.75rem 1.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.3s ease;
            color: white;
            cursor: pointer;
          }
          
          .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #2c3e50);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px #2c3e50;
          }
          .btn-primary:disabled {
            background: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.5);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .w-100 {
            width: 100%;
          }
          
          .mt-3 {
            margin-top: 1rem;
          }

          /* Responsive styles */
          @media (max-width: 768px) {
            .drop-zone {
              padding: 1.5rem;
            }
            
            .drop-zone-text {
              font-size: 1rem;
            }
            
            .btn-primary {
              padding: 0.6rem 1.2rem;
              font-size: 1rem;
            }
          }
        `}
      </style>

      <form onSubmit={handleSubmit}>

        {/* Resume Upload */}
        <div className="upload-section">
          <div className="upload-title">1. Upload Your Resume</div>
          <div
            className={`drop-zone ${isResumeDragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsResumeDragOver(true); }}
            onDragLeave={() => setIsResumeDragOver(false)}
            onDrop={handleResumeDrop}
            onClick={() => document.getElementById("resume-upload").click()}
          >
            <div className="drop-zone-text">
              {resumeFile ? (
                <div className="file-info">
                  {resumeFile.name}
                  <span className="file-type-badge">{getFileTypeText(resumeFile)}</span>
                </div>
              ) : "Click or drag your resume here"}
            </div>
            <div className="format-hint">PDF or DOCX (max 8 MB)</div>
            <input
              id="resume-upload"
              type="file"
              className="d-none"
              accept=".pdf,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* JD Upload */}
        <div className="upload-section">
          <div className="upload-title">2. Upload Job Description</div>
          <div
            className={`drop-zone ${isJdDragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsJdDragOver(true); }}
            onDragLeave={() => setIsJdDragOver(false)}
            onDrop={handleJdDrop}
            onClick={() => document.getElementById("jd-upload").click()}
          >
            <div className="drop-zone-text">
              {jdFile ? (
                <div className="file-info">
                  {jdFile.name}
                  <span className="file-type-badge">{getFileTypeText(jdFile)}</span>
                </div>
              ) : "Click or drag the JD here"}
            </div>
            <div className="format-hint">PDF, DOCX, or TXT (max 8 MB)</div>
            <input
              id="jd-upload"
              type="file"
              className="d-none"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setJdFile(e.target.files[0])}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading || !resumeFile || !jdFile}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

      </form>
    </div>
  );
}