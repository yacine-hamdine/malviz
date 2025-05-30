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
  const [staticReport, setStaticReport] = useState(null);
  const [dynamicReport, setDynamicReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Extract id and dynamicId from query string
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const dynamicId = searchParams.get("dynamicId");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchStatic = async () => {
      try {
        const resp = await fetch(`http://127.0.0.1:8000/apiv2/tasks/get/report/${id}`);
        const data = await resp.json();
        setStaticReport(data);
      } catch (err) {
        setStaticReport({ error: "Failed to fetch static report." });
      }
    };
    const fetchDynamic = async () => {
      if (!dynamicId) return;
      try {
        const resp = await fetch(`http://127.0.0.1:8000/apiv2/tasks/get/report/${dynamicId}`);
        const data = await resp.json();
        setDynamicReport(data);
      } catch (err) {
        setDynamicReport({ error: "Failed to fetch dynamic report." });
      }
    };
    fetchStatic();
    if (dynamicId) fetchDynamic();
    setTimeout(() => setLoading(false), 800); // Small delay for UX
  }, [id, dynamicId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#282c34" }}>
        <div style={{ color: "#54F4FC", fontSize: 24 }}>Loading report...</div>
      </div>
    );
  }

  const renderReport = (report, title, isDynamic = false) => {
    if (!report || report.error) {
      return <div style={{ color: "#fff", background: "#282c34", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, marginBottom: 32 }}>{report?.error || "No report found."}</div>;
    }
    const { target, malscore, malstatus, signatures, info, detections, detections2pid, dropped } = report;
    const statusColor = getStatusColor(malstatus);
    return (
      <div style={{ background: "#000000", borderRadius: 16, marginBottom: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, justifyContent: "center" }}>
          <h1 style={{ color: "#54F4FC", margin: 0, fontSize: 28 }}>{title}</h1>
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {/* File Info Card */}
          <div style={{ background: "#282c34", borderRadius: 12, padding: 24, minWidth: 280, flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
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
        {/* Dynamic-specific fields */}
        {isDynamic && (
          <>
            {/* Detections */}
            {detections && detections.length > 0 && (
              <div style={{ marginTop: 40, background: "#282c34", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <h2 style={{ color: "#54F4FC", marginTop: 0 }}>Detections</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {detections.map((det, idx) => (
                    <li key={idx} style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: "#1a232b" }}>
                      <div style={{ fontWeight: 600, fontSize: 17 }}>Family: {det.family}</div>
                      {det.details && det.details.length > 0 && (
                        <ul style={{ fontSize: 15, color: "#b0eaff", margin: 0, paddingLeft: 16 }}>
                          {det.details.map((detail, didx) => (
                            <li key={didx}>{Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(", ")}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Detections2pid */}
            {detections2pid && Object.keys(detections2pid).length > 0 && (
              <div style={{ marginTop: 40, background: "#282c34", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <h2 style={{ color: "#54F4FC", marginTop: 0 }}>Detections by PID</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {Object.entries(detections2pid).map(([pid, families]) => (
                    <li key={pid} style={{ marginBottom: 12 }}>
                      <b>PID {pid}:</b> {families.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Dropped Files */}
            {dropped && dropped.length > 0 && (
              <div style={{ marginTop: 40, background: "#282c34", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <h2 style={{ color: "#54F4FC", marginTop: 0 }}>Dropped Files</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {dropped.map((drop, idx) => (
                    <li key={idx} style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: "#1a232b" }}>
                      <div><b>Name:</b> {Array.isArray(drop.name) ? drop.name.join(", ") : drop.name}</div>
                      <div><b>Path:</b> <span style={{ wordBreak: "break-all" }}>{drop.path}</span></div>
                      <div><b>Size:</b> {drop.size} bytes</div>
                      <div><b>MD5:</b> {drop.md5}</div>
                      <div><b>SHA1:</b> {drop.sha1}</div>
                      <div><b>SHA256:</b> {drop.sha256}</div>
                      {drop.guest_paths && drop.guest_paths.length > 0 && (
                        <div><b>Guest Paths:</b> {drop.guest_paths.join(", ")}</div>
                      )}
                      {drop.type && <div><b>Type:</b> {drop.type}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: "#000000", minHeight: "100vh", color: "#fff", padding: 32, fontFamily: 'Inter, Arial, sans-serif' }}>
      {renderReport(staticReport, "Static Analysis Report")}
      {dynamicId && renderReport(dynamicReport, "Dynamic Analysis Report", true)}
    </div>
  );
};

export default Result;