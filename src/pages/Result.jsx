import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Result = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Extract id from query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`http://127.0.0.1:8001/apiv2/tasks/get/report/${id}`);
        const data = await resp.json();
        setReport(data);
      } catch (err) {
        setReport({ error: "Failed to fetch report." });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#282c34" }}>
        <div style={{ color: "#54F4FC", fontSize: 24 }}>Loading report...</div>
      </div>
    );
  }

  if (!report || report.error) {
    return <div style={{ color: "#fff", background: "#282c34", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>{report?.error || "No report found."}</div>;
  }

  // Example structure based on your sample
  const { target, malscore, malstatus, signatures, info } = report;
  return (
    <div style={{ background: "#282c34", minHeight: "100vh", color: "#fff", padding: 32 }}>
      <h1 style={{ color: "#54F4FC" }}>Static Analysis Report</h1>
      {target && target.file && (
        <div style={{ marginBottom: 24 }}>
          <h2>File Info</h2>
          <ul>
            <li><b>Name:</b> {target.file.name}</li>
            <li><b>Path:</b> {target.file.path}</li>
            <li><b>Size:</b> {target.file.size} bytes</li>
          </ul>
        </div>
      )}
      {info && (
        <div style={{ marginBottom: 24 }}>
          <h2>Analysis Info</h2>
          <ul>
            <li><b>Version:</b> {info.version}</li>
            <li><b>Started:</b> {info.started}</li>
            <li><b>Ended:</b> {info.ended}</li>
          </ul>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h2>Malware Score</h2>
        <div><b>malscore:</b> {malscore}</div>
        <div><b>malstatus:</b> {malstatus}</div>
      </div>
      {signatures && signatures.length > 0 && (
        <div>
          <h2>Signatures</h2>
          <ul>
            {signatures.map((sig, idx) => (
              <li key={idx} style={{ marginBottom: 12 }}>
                <b>{sig.name}</b>: {sig.description} <span style={{ color: "#54F4FC" }}>[Severity: {sig.severity}]</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Result;