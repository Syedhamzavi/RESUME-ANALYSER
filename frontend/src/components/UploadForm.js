import React, { useState } from "react";
import { analyzeFile, analyzeWithJD } from "../services/api";

export default function UploadForm({ onUploadComplete, analysisMode = "resume" }) {
  const [file, setFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isJdDragOver, setIsJdDragOver] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (analysisMode === "resume") {
      
      if (!file) {
        setErr("Please select a resume file (.pdf or .docx).");
        return;
      }

      const validMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validMimeTypes.includes(file.type)) {
        setErr("Only PDF or DOCX files are allowed for resumes.");
        return;
      }
    } else {
      
      if (!file || !jdFile) {
        setErr("Please select both a resume and a job description file.");
        return;
      }

      const resumeValidTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const jdValidTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!resumeValidTypes.includes(file.type)) {
        setErr("Resume must be PDF or DOCX format.");
        return;
      }

      if (!jdValidTypes.includes(jdFile.type)) {
        setErr("Job description must be PDF, DOCX, or text file.");
        return;
      }
    }

    setErr("");
    setLoading(true);

    try {
      let result;
      if (analysisMode === "resume") {
        result = await analyzeFile(file);
      } else {
        result = await analyzeWithJD(file, jdFile);
      }
      
      onUploadComplete(result);
      

      const resultElement = document.getElementById("result-container");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      setErr(e.message || `Failed to analyze ${analysisMode === "resume" ? "resume" : "files"}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    if (selectedFile) {
      setErr("");
    }
  };

  const handleJdFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setJdFile(selectedFile || null);
    if (selectedFile) {
      setErr("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErr("");
    }
  };

  const handleJdDrop = (e) => {
    e.preventDefault();
    setIsJdDragOver(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      setJdFile(selectedFile);
      setErr("");
    }
  };

  const getFileTypeText = (file) => {
    if (!file) return "";
    if (file.type === "application/pdf") return "PDF";
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
    if (file.type === "text/plain") return "TXT";
    return file.name.split('.').pop().toUpperCase();
  };

  return (
    <>
      <style>
        {`
        .drop-zone {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            border: 2px dashed #2c3e50;
            border-radius: 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            background-color: rgba(98, 101, 105, 0.1);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            position: relative;
            margin-bottom: 1.5rem;
        }
        .drop-zone:hover, .drop-zone.drag-over {
            border-color: #959598ff;
            background-color: rgba(195, 196, 200, 0.8);
        }
        .jd-drop-zone {
            border: 2px dashed #3498db;
            background-color: rgba(52, 152, 219, 0.1);
        }
        .jd-drop-zone:hover, .jd-drop-zone.drag-over {
            border-color: #2980b9;
            background-color: rgba(41, 128, 185, 0.2);
        }
        .drop-zone-text {
            color: #0d0d0dff;
            font-weight: 500;
        }
        .file-name-text {
            font-weight: 600;
            color: #1f2937;
            margin-top: 0.5rem;
        }
        .file-type-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            background: rgba(0,0,0,0.1);
            margin-left: 0.5rem;
        }
        .btn-analyze {
            color: #000000ff;
            background-color: #ffffffff;
            border-color: #2c3e50;
            transition: background-color 0.2s ease;
        }
        .btn-analyze:hover {
            background-color: #2c3e50;
            color: white;
        }
        .upload-section-title {
            color: #2c3e50;
            font-weight: 600;
            margin-bottom: 1rem;
            text-align: center;
        }
        .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 1.5rem 0;
            color: #2c3e50;
        }
        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #ddd;
        }
        .divider::before {
            margin-right: .5rem;
        }
        .divider::after {
            margin-left: .5rem;
        }
        `}
      </style>
      <form onSubmit={onSubmit}>
        {/* Resume Upload Section */}
        <div className="upload-section-title" >
          <h3>{analysisMode === "resume" ? "Upload Your Resume" : "1. Upload Your Resume"}</h3>
        </div>
        
        <div
          className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload").click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ width: "3rem", height: "3rem", color: "#5b5d60ff" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-4-4v-1a4 4 0 014-4h1a4 4 0 014 4v1a4 4 0 01-4 4h1a4 4 0 00-4-4v-1a4 4 0 00-4 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v-1a4 4 0 014-4h1a4 4 0 014 4v1a4 4 0 01-4 4h-1a4 4 0 01-4-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8a4 4 0 014-4h1a4 4 0 014 4v1a4 4 0 01-4 4h-1a4 4 0 01-4-4z"
            />
          </svg>

          <p className="drop-zone-text">
            {file ? (
              <span>
                <span className="file-name-text">{file.name}</span>
                <span className="file-type-badge">{getFileTypeText(file)}</span>
              </span>
            ) : (
              "Drag & drop your resume here or click to browse"
            )}
          </p>
          <p className="text-muted text-sm">Accepted formats: .pdf, .docx</p>

          <input
            id="file-upload"
            type="file"
            className="form-control d-none"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* JD Upload Section (only shown for JD analysis mode) */}
        {analysisMode === "jd" && (
          <>
            <div className="divider">and</div>
            
            <div className="upload-section-title">2. Upload Job Description</div>
            
            <div
              className={`drop-zone jd-drop-zone ${isJdDragOver ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsJdDragOver(true);
              }}
              onDragLeave={() => setIsJdDragOver(false)}
              onDrop={handleJdDrop}
              onClick={() => document.getElementById("jd-file-upload").click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#3498db"
                style={{ width: "3rem", height: "3rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>

              <p className="drop-zone-text">
                {jdFile ? (
                  <span>
                    <span className="file-name-text">{jdFile.name}</span>
                    <span className="file-type-badge">{getFileTypeText(jdFile)}</span>
                  </span>
                ) : (
                  "Drag & drop job description here or click to browse"
                )}
              </p>
              <p className="text-muted text-sm">Accepted formats: .pdf, .docx, .txt</p>

              <input
                id="jd-file-upload"
                type="file"
                className="form-control d-none"
                accept=".pdf,.docx,.txt"
                onChange={handleJdFileChange}
                disabled={loading}
              />
            </div>
          </>
        )}

        {err && <div className="alert alert-danger mt-3">{err}</div>}

        <div className="d-grid mt-4">
          <button
            className="btn btn-analyze btn-lg text-black shadow"
            type="submit"
            disabled={loading || (analysisMode === "resume" ? !file : !file || !jdFile)}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {analysisMode === "resume" ? "Analyzing..." : "Comparing..."}
              </>
            ) : (
              analysisMode === "resume" ? "Analyze My Resume" : "Analyze Match"
            )}
          </button>
        </div>
      </form>
    </>
  );
}