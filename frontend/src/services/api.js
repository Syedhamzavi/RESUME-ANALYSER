const API_BASE = process.env.REACT_APP_API || "http://localhost:8000";

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options);
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const payload = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJSON ? payload?.detail || payload?.error : payload;
    throw new Error(msg || "API Error");
  }
  return payload;
}

export async function analyzeFile(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/analyze", { method: "POST", body: form });
}

export async function analyzeWithJD(resumeFile, jdFile) {
  if (!resumeFile || !jdFile) throw new Error("Both resume and JD files are required.");

  console.log("Sending files:", resumeFile.name, jdFile.name);

  const form = new FormData();
  form.append("resume_file", resumeFile);
  form.append("jd_file", jdFile);

  return request("/analyze-with-jd", { method: "POST", body: form });
}

export async function health() {
  return request("/health");
}
