import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";
import JDUploadForm from "./components/JDUploadForm";
import JDResultCard from "./components/JDResultCard";
import bgImage from "./background.png";
import resumeSample1 from './sample1.jpg';
import resumeSample2 from './sample2.png';
import resumeSample3 from './sample3.png';
import resumeSample4 from './sample4.jpg';

export default function App() {
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("resume");

  const resumeSamples = [
    { id: 1, src: resumeSample1, alt: "Sample Resume 1" },
    { id: 2, src: resumeSample2, alt: "Sample Resume 2" },
    { id: 3, src: resumeSample3, alt: "Sample Resume 3" },
    { id: 4, src: resumeSample4, alt: "Sample Resume 4" },
  ];

  const handleReset = () => {
    setResult(null);
    setAnalysisMode("resume");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeModal = () => {
    setShowModal(null);
  };

  const handleJDAnalysisComplete = (result) => {
    setResult(result);
    setAnalysisMode("jd");
    closeModal();
    
    setTimeout(() => {
      const resultElement = document.getElementById("result-container");
      if (resultElement) {
        const navbarHeight = 56;
        const elementPosition = resultElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  return (
    <>
      <style>
        {`
          body {
          background-color: rgba(31, 38, 43, 1);
          margin: 0;
          padding: 0;
          min-height: 100vh;  /* instead of fixed height */
          overflow-x: hidden; /* only hide horizontal scroll */
        }

          .app-container {
            min-height: 100vh;   /* allow it to expand with content */
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start; /* don’t force vertical centering */
            background-image: url(${bgImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
          }


          .content-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(38, 73, 107, 0.1) 100%);
            border-radius: 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }

          .app-title {
            font-size: 4.5rem;
            font-weight: 700;
            color: #e0e0e0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            transition: opacity 0.5s ease;
          }

          .app-subtitle {
            font-size: 1.5rem;
            color: #bbbbbb;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
            transition: opacity 0.5s ease;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-on-load {
            animation: fadeInUp 0.8s ease-in-out forwards;
          }

          .animate-on-load.delay-1 {
            animation-delay: 0.2s;
          }

          /* Navbar Styles */
          .navbar-custom {
            background: rgba(31, 38, 43, 0.4);
            backdrop-filter: blur(10px);
            width: 100%;
            position: fixed;
            top: 0;
            z-index: 1000;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .navbar-custom .container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .navbar-custom .navbar-nav {
            padding: 0;
            margin: 0;
          }
          
          .navbar-custom .nav-item {
            padding: 0;
            margin: 0;
          }
          
          .navbar-brand {
            color: #e0e0e0 !important;
            font-weight: 600;
            font-size: 1.2rem;
            padding: 0.5rem 1rem !important;
            margin: 0 !important;
          }
          
          .nav-link-custom {
            color: #bbbbbb !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            margin: 0 !important;
          }
          
          .nav-link-custom:hover {
            color: #ffffff !important;
            background: rgba(31, 38, 43, 1);
          }

          .nav-link-custom.active {
            color: #ffffff !important;
            background: rgba(31, 38, 43, 0.2);
          }
          
          .navbar-toggler {
            padding: 0.25rem 0.5rem !important;
            margin: 0.5rem !important;
          }
          
          /* Modal Styles */
          .modal-backdrop-custom {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(3px);
          }
          
          .modal-content-custom {
            background-color: rgba(31, 38, 43, 1);
            border-radius: 1rem;
            max-width: 90%;
            padding: 2rem;
            width: 800px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          
          .modal-header-custom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .modal-title-custom {
            color: #e0e0e0;
            font-size: 1.8rem;
            font-weight: 600;
          }
          
          .close-button {
            background: none;
            border: none;
            color: #bbbbbb;
            font-size: 1.8rem;
            cursor: pointer;
            transition: color 0.3s ease;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .close-button:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          }
          
          .modal-body-custom {
            color: #d0d0d0;
            line-height: 1.6;
            padding: 1rem 0;
          }
          
          .modal-body-custom h4 {
            color: #e0e0e0;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          .modal-body-custom ul, .modal-body-custom ol {
            padding-left: 1.5rem;
          }
          
          .modal-body-custom li {
            margin-bottom: 0.5rem;
          }

          /* Resume Gallery Styles */
          .resume-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            justify-content: center;
            margin: 1.5rem 0;
          }

          .resume-item {
            flex: 1 1 45%;
            max-width: 45%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .resume-item:hover {
            transform: scale(1.03);
            box-shadow: 0 8px 25px rgba(0,0,0,0.7);
          }
          
          .resume-image {
            width: 100%;
            height: auto;
            display: block;
          }

          /* Mode selector styles */
          .mode-selector {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 0.5rem;
            gap: 0.5rem;
          }
          
          .mode-button {
            padding: 0.75rem 1.5rem;
            border: none;
            background: transparent;
            color: #bbbbbb;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
          }
          
          .mode-button.active {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
          }
          
          .mode-button:hover:not(.active) {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }

          @media (max-width: 768px) {
            .app-container {
              padding: 5rem 1rem 2rem 1rem;
            }
            .app-title {
              font-size: 2.5rem;
            }
            
            .navbar-brand {
              font-size: 1.1rem;
              padding: 0.5rem !important;
            }
            
            .nav-link-custom {
              padding: 0.4rem 0.8rem !important;
              font-size: 0.9rem;
            }

            .modal-content-custom {
              width: 95%;
              padding: 1.5rem;
              max-height: 90vh;
            }
            
            .modal-title-custom {
              font-size: 1.5rem;
            }

            .resume-item {
              flex: 1 1 100%;
              max-width: 100%;
            }

            .mode-selector {
              flex-direction: column;
              gap: 0.5rem;
            }

            .mode-button {
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">
          <a 
            className="navbar-brand" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            style={{ cursor: "pointer" }}
          >
            Resume Analyzer
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('template');
                  }}
                >
                  Sample Resumes
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('jd-upload');
                  }}
                >
                  JD Analysis
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link nav-link-custom" 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('instructions');
                  }}
                >
                  Instructions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showModal === 'template' && (
        <div className="modal-backdrop-custom" onClick={closeModal}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">Sample Resumes</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>Here are a few sample resume layouts for inspiration. Click on an image to view it.</p>
              <div className="resume-gallery">
                {resumeSamples.map(sample => (
                  <div key={sample.id} className="resume-item">
                     <a href={sample.src} target="_blank" rel="noopener noreferrer">
                      <img src={sample.src} alt={sample.alt} className="resume-image" />
                     </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'jd-upload' && (
        <div className="modal-backdrop-custom" onClick={closeModal}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">JD-Based Resume Analysis</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>Upload your resume and a job description to analyze how well your resume matches the job requirements.</p>
              {/* KEY FIX: Force JD mode for the modal form */}
              <JDUploadForm onUploadComplete={handleJDAnalysisComplete}/>
            </div>
          </div>
        </div>
      )}

      {showModal === 'instructions' && (
        <div className="modal-backdrop-custom" onClick={closeModal}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">Resume Creation Guide</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body-custom">
              <h4>How to Create an Effective Resume</h4>
              
              <p>Follow these professional guidelines to create a resume that stands out to employers:</p>
              
              <h5>1. Choose the Right Format</h5>
              <ul>
                <li><strong>Chronological:</strong> Most common, emphasizes work history</li>
                <li><strong>Functional:</strong> Focuses on skills, good for career changers</li>
                <li><strong>Combination:</strong> Mix of both, highlights skills and experience</li>
              </ul>
              
              <h5>2. Essential Resume Sections</h5>
              <ol>
                <li><strong>Contact Information:</strong> Full name, phone, email, LinkedIn profile</li>
                <li><strong>Professional Summary:</strong> 3-4 lines highlighting your value proposition</li>
                <li><strong>Work Experience:</strong> List in reverse chronological order with achievements</li>
                <li><strong>Education:</strong> Degrees, certifications, relevant coursework</li>
                <li><strong>Skills:</strong> Technical, software, and soft skills</li>
                <li><strong>Additional Sections:</strong> Projects, languages, volunteer work</li>
              </ol>
              
              <h5>3. Writing Powerful Bullet Points</h5>
              <ul>
                <li>Use action verbs (Managed, Developed, Increased, Created)</li>
                <li>Quantify achievements with numbers and metrics</li>
                <li>Focus on results and impact, not just responsibilities</li>
                <li>Tailor to job description keywords</li>
              </ul>
              
              <h5>4. Formatting Tips</h5>
              <ul>
                <li>Keep it to 1-2 pages maximum</li>
                <li>Use clean, professional fonts (11-12pt size)</li>
                <li>Maintain consistent formatting and spacing</li>
                <li>Use bullet points for readability</li>
                <li>Save as PDF to preserve formatting</li>
              </ul>
              
              <h5>5. Content Guidelines</h5>
              <ul>
                <li><strong>Be Specific:</strong> Instead of "managed team" say "managed 5-person team"</li>
                <li><strong>Show Results:</strong> "Increased sales by 25% in Q2" not "responsible for sales"</li>
                <li><strong>Use Keywords:</strong> Mirror language from job descriptions</li>
                <li><strong>Be Honest:</strong> Never exaggerate or falsify information</li>
                <li><strong>Proofread:</strong> Zero spelling or grammar errors</li>
              </ul>
              
              <h5>6. Common Mistakes to Avoid</h5>
              <ul>
                <li>❌ Using unprofessional email addresses</li>
                <li>❌ Including irrelevant personal information</li>
                <li>❌ Writing long paragraphs instead of bullet points</li>
                <li>❌ Using buzzwords without substance</li>
                <li>❌ Submitting without customizing for the specific job</li>
              </ul>
              
              <h5>7. Before You Submit</h5>
              <ol>
                <li>Tailor your resume to each specific job application</li>
                <li>Use our analyzer to check for completeness and formatting</li>
                <li>Get feedback from mentors or colleagues</li>
                <li>Test with ATS (Applicant Tracking System) compatibility</li>
                <li>Double-check contact information</li>
              </ol>
              
              <div className="mt-4 p-3" style={{background: 'rgba(52, 152, 219, 0.1)', borderRadius: '8px'}}>
                <h6>💡 Pro Tip:</h6>
                <p className="mb-0">Use our <strong>JD Analysis feature</strong> to compare your resume against specific job descriptions and identify exactly what skills and keywords you need to include!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-container">
        <div className="container" style={{ paddingTop: "56px" }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="text-center mb-5">
                <h1 className="app-title mb-2 animate-on-load">
                  {result ? "Resume Report" : "Resume Analyzer"}
                </h1>
                <p className="app-subtitle animate-on-load delay-1">
                  {result
                    ? analysisMode === "jd" 
                      ? "JD Match Analysis Results" 
                      : "Here are the detailed insights and suggestions for your resume."
                    : "Analyze your resume's quality, get a score, and receive improvement tips."}
                </p>
              </div>

              {!result ? (
                <>
                  <div className="mode-selector mb-4">
                    <button 
                      className={`mode-button ${analysisMode === "resume" ? "active" : ""}`}
                      onClick={() => setAnalysisMode("resume")}
                    >
                      Standard Analysis
                    </button>
                    <button 
                      className={`mode-button ${analysisMode === "jd" ? "active" : ""}`}
                      onClick={() => setShowModal('jd-upload')}
                    >
                      JD-Based Analysis
                    </button>
                  </div>
                  <div className="p-4 content-card animate-on-load delay-1">
                    <UploadForm onUploadComplete={setResult} analysisMode={analysisMode} />
                  </div>
                </>
              ) : (
                <div id="result-container" className="animate-on-load">
                  {analysisMode === "jd" ? (
                    <JDResultCard result={result} onReset={handleReset} />
                  ) : (
                    <ResultCard result={result} onReset={handleReset} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}