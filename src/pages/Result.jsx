import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ExeIcon from "../assets/icons/exe.svg";
import Favicon from "../assets/icons/favicon.svg";

const getStatusColor = (status) => {
  if (!status) return "#aaa";
  const s = status.toLowerCase();
  if (s === "clean") return "#4caf50"; // green
  if (s === "malicious" || s === "malware" || s === "infected") return "#e53935"; // red
  if (s === "suspicious" || s === "unknown") return "#ffc107"; // yellow
  return "#aaa";
};

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
        const resp = await fetch(`http://127.0.0.1:8000/apiv2/tasks/get/report/${id}`);
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
  const statusColor = getStatusColor(malstatus);
  return (
    <div style={{ background: "#000000", minHeight: "100vh", color: "#fff", padding: 32, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, justifyContent: "center" }}>
        {/* <img src={Favicon} alt="Malviz logo" style={{ width: 48, height: 48 }} /> */}
        <h1 style={{ color: "#54F4FC", margin: 0 }}>Static Analysis Report</h1>
      </div>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* File Info Card */}
        <div style={{ background: "#282c34", borderRadius: 12, padding: 24, minWidth: 280, flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {/* <img src={ExeIcon} alt="File icon" style={{ width: 32, height: 32, opacity: 0.85 }} /> */}
            <h2 style={{ color: '#54F4FC', margin: 0, fontSize: 22 }}>File Info</h2>
          </div>
          {target && target.file ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 16 }}>
              <li><b>Name:</b> {target.file.name}</li>
              <li><b>Path:</b> <span style={{ wordBreak: "break-all" }}>{target.file.path}</span></li>
              <li><b>Size:</b> {target.file.size} bytes</li>
            </ul>
          ) : <div>No file info.</div>}
        </div>
        {/* Analysis Info Card */}
        <div style={{ background: "#282c34", borderRadius: 12, padding: 24, minWidth: 220, flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <h2 style={{ color: '#54F4FC', marginTop: 0, fontSize: 22 }}>Analysis Info</h2>
          {info ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 16 }}>
              <li><b>Version:</b> {info.version}</li>
              <li><b>Started:</b> {info.started}</li>
              <li><b>Ended:</b> {info.ended}</li>
            </ul>
          ) : <div>No analysis info.</div>}
        </div>
        {/* Malware Score Card */}
        <div style={{ background: "#282c34", borderRadius: 12, padding: 24, minWidth: 220, flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <h2 style={{ color: '#54F4FC', marginTop: 0, fontSize: 22 }}>Malware Score</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{
              display: "inline-block",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: statusColor,
              border: `2px solid ${statusColor}`,
              marginRight: 6,
            }} />
            <span style={{ fontWeight: 600, fontSize: 18 }}>{malstatus || "Unknown"}</span>
          </div>
          <div style={{ fontSize: 16 }}><b>malscore:</b> {malscore}</div>
        </div>
      </div>
      {/* Signatures Section */}
      <div style={{ marginTop: 40, background: "#282c34", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
        <h2 style={{ color: "#54F4FC", marginTop: 0 }}>Signatures</h2>
        {signatures && signatures.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {signatures.map((sig, idx) => (
              <li key={idx} style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: "#1a232b", borderLeft: `4px solid ${sig.severity >= 3 ? '#e53935' : sig.severity === 2 ? '#ffc107' : '#4caf50'}` }}>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{sig.name}</div>
                <div style={{ fontSize: 15, color: "#b0eaff", marginBottom: 4 }}>{sig.description}</div>
                <span style={{ color: sig.severity >= 3 ? '#e53935' : sig.severity === 2 ? '#ffc107' : '#4caf50', fontWeight: 500 }}>
                  Severity: {sig.severity}
                </span>
              </li>
            ))}
          </ul>
        ) : <div style={{ color: "#aaa" }}>No signatures detected.</div>}
      </div>
    </div>
  );
};

export default Result;