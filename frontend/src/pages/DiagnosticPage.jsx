import { useState } from "react";
import { api } from "../services/api.js";

const DiagnosticPage = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics = {};

    // Check environment variables
    diagnostics.envViteApiUrl = import.meta.env.VITE_API_URL || "NOT SET";
    diagnostics.envViteApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "NOT SET";
    diagnostics.apiBaseUrl = api.defaults.baseURL;

    // Test backend connection
    try {
      const response = await fetch(`${api.defaults.baseURL}/products`, {
        method: "GET",
        credentials: "include"
      });
      diagnostics.backendStatus = response.ok ? "✅ Connected" : `❌ Error ${response.status}`;
      diagnostics.backendResponse = await response.text();
    } catch (error) {
      diagnostics.backendStatus = "❌ Failed to connect";
      diagnostics.backendError = error.message;
    }

    setResults(diagnostics);
    setTesting(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔍 Frontend Diagnostics</h1>
      
      <button 
        onClick={runDiagnostics} 
        disabled={testing}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: testing ? "not-allowed" : "pointer",
          marginBottom: "20px"
        }}
      >
        {testing ? "Running..." : "Run Diagnostics"}
      </button>

      {Object.keys(results).length > 0 && (
        <div style={{ 
          background: "#f5f5f5", 
          padding: "20px", 
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all"
        }}>
          <h2>Results:</h2>
          {Object.entries(results).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "10px" }}>
              <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "30px", background: "#fff3cd", padding: "15px", borderRadius: "8px" }}>
        <h3>Expected Values for Production:</h3>
        <ul>
          <li><strong>VITE_API_URL:</strong> https://goxpress.onrender.com/api</li>
          <li><strong>apiBaseUrl:</strong> https://goxpress.onrender.com/api</li>
          <li><strong>backendStatus:</strong> ✅ Connected</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticPage;
