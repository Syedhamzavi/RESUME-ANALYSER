import React from "react";

export default function ResultCard({ result, onReset }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const getJDScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  const copy = (txt) => {
    navigator.clipboard.writeText(txt).catch(() => {
      const textArea = document.createElement("textarea");
      textArea.value = txt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const isJDAnalysis = result.jd_analysis && result.jd_analysis.overall_score !== undefined;

  return (
    <>
    
      <style>
        {`
        .result-card-container {
            background: linear-gradient(135deg, rgba(47, 58, 86, 0.2) 0%, rgba(79, 112, 145, 0.1) 100%);
            padding: 3rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-radius: 1rem;
            justify-content: center;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .custom-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(1px);
            border-radius: 1rem !important;
            border: none;
        }

        .score-circle {
            background: linear-gradient(135deg, rgba(121, 150, 172, 1), #060606ff);
            transition: all 0.3s ease;
        }
        
        .jd-score-circle {
            background: linear-gradient(135deg, #2c3e50);
            transition: all 0.3s ease;
        }

        .score-circle h1, .jd-score-circle h1 {
            color: #ffffffff;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .list-group-item {
            background-color: rgba(255, 255, 255, 0.7);
            border-color: rgba(0, 0, 0, 0.1);
        }
        
        .progress {
            height: 1.5rem;
            background-color: #2c3e50;
            border-radius: 0.75rem;
            overflow: hidden;
        }
        
        .progress-bar {
            transition: width 0.6s ease;
        }
        
        .match-breakdown {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(41, 128, 185, 0.1));
            border-left: 4px solid #2c3e50;
        }
            color: rgba(44, 62, 80, 1);
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            padding-bottom: 0.3rem;
            }

            
            .modal-body-custom ul, .modal-body-custom ol {
            margin-bottom: 1rem;
            }

            .modal-body-custom li {
            margin-bottom: 0.4rem;
            }

            .modal-content-custom {
              width: 95%;
              padding: 1.5rem;
            }
            
            .modal-title-custom {
              font-size: 1.5rem;
            }
        .skill-match-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        
        .skill-match-item:last-child {
            border-bottom: none;
        }
        
        .missing-skill {
            color: #e74c3c;
            font-weight: 500;
        }
        
        .matching-skill {
            color: #27ae60;
            font-weight: 500;
        }
        .btn.btn-secondary{
          background-color: rgba(38, 73, 107, 1);
        }
        `}
      </style>
      <div className="result-card-container">
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* JD Analysis Header */}
          {isJDAnalysis && result.job_description && (
            <div className="card custom-card shadow-lg mb-4">
              <div className="card-body text-center p-4">
                <h4 className="card-title fw-bold mb-2">Job Description Analysis</h4>
                
              </div>
            </div>
          )}

          {/* Score Card - Shows both scores for JD analysis */}
          <div className="card custom-card shadow-lg mb-4">
            <div className="card-body text-center p-4">
              {isJDAnalysis ? (
                <>
                  <h4 className="card-title fw-bold mb-4">Analysis Scores</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <h5 className="mb-3">Resume Quality</h5>
                      <div
                        className={`mx-auto d-flex align-items-center justify-content-center rounded-circle shadow score-circle ${getScoreColor(
                          result.score
                        )}`}
                        style={{ width: "140px", height: "140px" }}
                      >
                        <h2 className="fw-bold mb-0">{result.score}/100</h2>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h5 className="mb-3">JD Match</h5>
                      <div
                        className={`mx-auto d-flex align-items-center justify-content-center rounded-circle shadow jd-score-circle ${getJDScoreColor(
                          result.jd_analysis.overall_score
                        )}`}
                        style={{ width: "140px", height: "140px" }}
                      >
                        <h2 className="fw-bold mb-0">{result.jd_analysis.overall_score}/100</h2>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="card-title fw-bold mb-3">Resume Score</h4>
                  <div
                    className={`mx-auto d-flex align-items-center justify-content-center rounded-circle shadow score-circle ${getScoreColor(
                      result.score
                    )}`}
                    style={{ width: "160px", height: "160px" }}
                  >
                    <h1 className="fw-bold mb-0">{result.score}/100</h1>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* JD Match Breakdown */}
          {isJDAnalysis && (
            <div className="card custom-card shadow-sm mb-4 match-breakdown">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-4">JD Match Breakdown</h5>
                
                <div className="skill-match-item">
                  <span>Skills Match</span>
                  <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <div className="progress me-3" style={{ flex: 1 }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${result.jd_analysis.skill_match}%` }}
                      ></div>
                    </div>
                    <span className="fw-bold">{result.jd_analysis.skill_match}%</span>
                  </div>
                </div>
                
                <div className="skill-match-item">
                  <span>Experience Match</span>
                  <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <div className="progress me-3" style={{ flex: 1 }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${result.jd_analysis.experience_match}%` }}
                      ></div>
                    </div>
                    <span className="fw-bold">{result.jd_analysis.experience_match}%</span>
                  </div>
                </div>
                
                <div className="skill-match-item">
                  <span>Education Match</span>
                  <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <div className="progress me-3" style={{ flex: 1 }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${result.jd_analysis.education_match}%` }}
                      ></div>
                    </div>
                    <span className="fw-bold">{result.jd_analysis.education_match}%</span>
                  </div>
                </div>
                
                <div className="skill-match-item">
                  <span>Keyword Match</span>
                  <div className="d-flex align-items-center" style={{ width: '60%' }}>
                    <div className="progress me-3" style={{ flex: 1 }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${result.jd_analysis.keyword_match}%` }}
                      ></div>
                    </div>
                    <span className="fw-bold">{result.jd_analysis.keyword_match}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Missing Skills for JD Analysis */}
          {isJDAnalysis && result.jd_analysis.missing_skills && result.jd_analysis.missing_skills.length > 0 && (
            <div className="card custom-card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold text-danger">Missing Skills</h5>
                <p className="text-muted mb-3">These skills are required in the job description but not found in your resume:</p>
                <div className="d-flex flex-wrap gap-2">
                  {result.jd_analysis.missing_skills.map((skill, index) => (
                    <span key={index} className="badge bg-danger missing-skill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matching Skills for JD Analysis */}
          {isJDAnalysis && result.jd_analysis.matching_skills && result.jd_analysis.matching_skills.length > 0 && (
            <div className="card custom-card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold text-success">Matching Skills</h5>
                <p className="text-muted mb-3">These skills from your resume match the job requirements:</p>
                <div className="d-flex flex-wrap gap-2">
                  {result.jd_analysis.matching_skills.map((skill, index) => (
                    <span key={index} className="badge bg-success matching-skill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Regular Resume Metrics (shown for both analysis types) */}
          <div className="card custom-card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Formatting & Layout Metrics</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Average Font Size: <b>{result.metrics?.avg_font_size ?? "N/A"}</b>
                </li>
                <li className="list-group-item">
                  Line Spacing: <b>{result.metrics?.avg_line_spacing ?? "N/A"}</b>
                </li>
                <li className="list-group-item">
                  Indentation Count: <b>{result.metrics?.indentations ?? 0}</b>
                </li>
                <li className="list-group-item">
                  Blank Lines: <b>{result.metrics?.blank_lines ?? 0}</b>
                </li>
                <li className="list-group-item">
                  Total Pages: <b>{result.metrics?.pages ?? "N/A"}</b>
                </li>
                <li className="list-group-item">
                  Total Words: <b>{result.metrics?.words ?? "N/A"}</b>
                </li>
              </ul>
            </div>
          </div>

          {/* Contacts */}
          <div className="card custom-card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Contact Information</h5>
              <ul className="list-group list-group-flush">
                {["email", "phone", "linkedin", "github"].map((k) => {
                  const val = result.contacts?.[k];
                  return (
                    <li
                      className="list-group-item d-flex justify-content-between align-items-center"
                      key={k}
                    >
                      <span>
                        {k === "email" && "📧 Email:"}
                        {k === "phone" && "📞 Phone:"}
                        {k === "linkedin" && "🔗 LinkedIn:"}
                        {k === "github" && "🐙 GitHub:"}
                        &nbsp;<b>{val || "Not found"}</b>
                      </span>
                      {val && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => copy(val)}
                        >
                          Copy
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Sections */}
          <div className="card custom-card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Sections Found</h5>
              <ul className="list-group list-group-flush">
                {result.metrics?.sections_found &&
                  Object.entries(result.metrics.sections_found).map(
                    ([section, present]) => (
                      <li
                        key={section}
                        className="list-group-item d-flex justify-content-between"
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                        <span
                          className={`badge ${present ? "bg-success" : "bg-danger"}`}
                        >
                          {present ? "Present" : "Missing"}
                        </span>
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="card custom-card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Suggestions</h5>
              {result.suggestions?.length ? (
                <ul className="list-group list-group-flush">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="list-group-item">
                      ⚠️ {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-success p-3">
                  <h6 className="mb-0">✅ Your resume looks great!</h6>
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center mt-4">
            <button className="btn btn-secondary" onClick={onReset}>
              {isJDAnalysis ? "Analyze Another" : "Upload Another Resume"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}