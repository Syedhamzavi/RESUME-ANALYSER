import React, { useMemo } from "react";

export default function JDResultCard({ result, onReset }) {
  const { jd_analysis: jdAnalysis = {}, experience = 0 } = result;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };
  
  const formattedMatchingSkills = useMemo(() => {
    const skills = jdAnalysis.matching_skills || [];
    return skills.slice(0, 20);
  }, [jdAnalysis.matching_skills]);

  const formattedMissingSkills = useMemo(() => {
    const skills = jdAnalysis.missing_skills || [];
    return skills.slice(0, 20);
  }, [jdAnalysis.missing_skills]);

  return (
    <div className="result-card-container">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Score Card */}
        <div className="card shadow-lg mb-4">
          <div className="card-body text-center p-4">
            <h4 className="card-title fw-bold mb-4">Overall Match Score: {jdAnalysis.overall_score || 0}/100</h4>
            
            <div className="row">
              {[
                { label: "Skills Match", value: jdAnalysis.skill_match || 0 },
                { label: "Experience Match", value: jdAnalysis.experience_match || 0 },
                { label: "Education Match", value: jdAnalysis.education_match || 0 },
                { label: "Keyword Match", value: jdAnalysis.keyword_match || 0 }
              ].map((item, index) => (
                <div key={index} className="col-md-3 col-6 mb-3">
                  <h6 className="mb-2">{item.label}</h6>
                  <div
                    className={`mx-auto rounded-circle d-flex align-items-center justify-content-center ${getScoreColor(item.value)}`}
                    style={{
                      width: "70px",
                      height: "70px",
                      background: "linear-gradient(135deg, #2c3e50, #34495e)",
                      margin: "0 auto"
                    }}
                  >
                    <span className="fw-bold text-white">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="row">
          {/* Matching Skills */}
          {jdAnalysis.matching_skills?.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-success">
                    ✅ Matching Skills ({jdAnalysis.matching_skills.length})
                  </h5>
                  <p className="text-muted mb-3">Your skills that match the job requirements:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {formattedMatchingSkills.map((skill, index) => (
                      <span key={index} className="badge bg-success fs-6">
                        {skill}
                      </span>
                    ))}
                    {jdAnalysis.matching_skills.length > 20 && (
                      <span className="badge bg-info">
                        +{jdAnalysis.matching_skills.length - 20} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {jdAnalysis.missing_skills?.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-danger">
                    ❌ Missing Skills ({jdAnalysis.missing_skills.length})
                  </h5>
                  <p className="text-muted mb-3">Skills required but not found in your resume:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {formattedMissingSkills.map((skill, index) => (
                      <span key={index} className="badge bg-danger fs-6">
                        {skill}
                      </span>
                    ))}
                    {jdAnalysis.missing_skills.length > 20 && (
                      <span className="badge bg-warning">
                        +{jdAnalysis.missing_skills.length - 20} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience & Education Summary */}
        <div className="row">
          {/* Experience Summary */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold">Experience Match</h6>
                <div className="progress mb-2" style={{ height: "20px" }}>
                  <div 
                    className="progress-bar bg-info"
                    style={{ width: `${jdAnalysis.experience_match || 0}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  Your experience: <strong>{experience} years</strong>
                </small>
              </div>
            </div>
          </div>

          {/* Education Summary */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold">Education Match</h6>
                <div className="progress mb-2" style={{ height: "20px" }}>
                  <div 
                    className="progress-bar bg-warning"
                    style={{ width: `${jdAnalysis.education_match || 0}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  {jdAnalysis.education_match >= 50 ? 
                    "✅ Education requirements met" : 
                    "⚠️ Review education requirements"}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-4">
          <button className="btn btn-primary me-3" style={{ backgroundColor: "rgba(38, 73, 107, 1)" }} onClick={onReset}>
            Analyze Another Resume
          </button>
          <button className="btn btn-outline-secondary" style={{ borderColor: "rgba(38, 73, 107, 1)" }} onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}