import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExeIcon from "../assets/icons/exe.svg";
import '../styles/Submit.css';

const Submit = () => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staticProgress, setStaticProgress] = useState(0);
  const [dynamicProgress, setDynamicProgress] = useState(0);
  const [staticDone, setStaticDone] = useState(false);
  const [dynamicDone, setDynamicDone] = useState(false);
  const [staticTaskId, setStaticTaskId] = useState(null);
  const [dynamicTaskId, setDynamicTaskId] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFiles = (selectedFiles) => {
    setFiles(Array.from(selectedFiles));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setStaticProgress(0);
    setDynamicProgress(0);
    setStaticDone(false);
    setDynamicDone(false);
    setStaticTaskId(null);
    setDynamicTaskId(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    // Helper for progress bar
    let staticStart = Date.now();
    let dynamicStart = Date.now();
    let staticInterval, dynamicInterval;

    // --- Static Analysis ---
    const staticPromise = fetch("http://127.0.0.1:8000/apiv2/tasks/create/static/", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Static analysis failed");
        let ID = await response.json();
        let taskId = ID.data.task_ids[0];
        setStaticTaskId(taskId);
        // Progress bar simulation (30s)
        staticInterval = setInterval(() => {
          let elapsed = (Date.now() - staticStart) / 1000;
          setStaticProgress(Math.min(100, (elapsed / 30) * 100));
        }, 500);
        // Poll status
        return new Promise((resolve) => {
          const poll = async () => {
            try {
              const statusResp = await fetch(`http://127.0.0.1:8000/apiv2/tasks/status/${taskId}`);
              const statusResult = await statusResp.json();
              if (statusResult.data === "reported" || statusResult.status === "completed" || statusResult.status === "finished") {
                setStaticDone(true);
                setStaticProgress(100);
                clearInterval(staticInterval);
                resolve(taskId);
              } else {
                setTimeout(poll, 1000);
              }
            } catch {
              setTimeout(poll, 1000);
            }
          };
          poll();
        });
      });

    // --- Dynamic Analysis ---
    const dynamicPromise = fetch("http://127.0.0.1:8000/apiv2/tasks/create/file/", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Dynamic analysis failed");
        let ID = await response.json();
        let taskId = ID.data.task_ids[0];
        setDynamicTaskId(taskId);
        // Progress bar simulation (3-5min, use 4min avg)
        dynamicInterval = setInterval(() => {
          let elapsed = (Date.now() - dynamicStart) / 1000;
          setDynamicProgress(Math.min(100, (elapsed / 240) * 100));
        }, 500);
        // Poll status
        return new Promise((resolve) => {
          const poll = async () => {
            try {
              const statusResp = await fetch(`http://127.0.0.1:8000/apiv2/tasks/status/${taskId}`);
              const statusResult = await statusResp.json();
              if (statusResult.data === "reported" || statusResult.status === "completed" || statusResult.status === "finished") {
                setDynamicDone(true);
                setDynamicProgress(100);
                clearInterval(dynamicInterval);
                resolve(taskId);
              } else {
                setTimeout(poll, 2000);
              }
            } catch {
              setTimeout(poll, 2000);
            }
          };
          poll();
        });
      });

    // Wait for both to finish, then navigate
    Promise.all([staticPromise, dynamicPromise]).then(([staticId, dynamicId]) => {
      setLoading(false);
      navigate(`/result?id=${staticId}&dynamicId=${dynamicId}`);
    }).catch(() => {
      setLoading(false);
      alert("Failed to upload or analyze file(s).");
    });
  };

  return (
    <section
      id="submit"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onDragEnter={handleDrag}
        onSubmit={handleSubmit}
        style={{
          border: "2px dashed #54F4FC",
          borderRadius: 8,
          padding: 32,
          background: dragActive ? "#22313a" : "#282c34",
          textAlign: "center",
          position: "relative",
          minWidth: 400,
          minHeight: 300,
          color: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          width: 500,
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Hide input and drag area when loading */}
        {!loading && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleChange}
            />
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#54F4FC",
                fontSize: 18,
                borderRadius: 8,
                transition: "background 0.2s",
                zIndex: 1,
                background: "transparent",
              }}
              onClick={handleButtonClick}
            >
              <img
                src={ExeIcon}
                alt="exe icon"
                style={{ width: 64, height: 64, marginBottom: 16, opacity: 0.85 }}
              />
              {dragActive
                ? "Drop your files here..."
                : "Drag & drop files here, or click to select"}
            </div>
            {files.length > 0 && (
              <ul style={{ textAlign: "left", marginTop: 20, color: "#fff", zIndex: 2 }}>
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
            <button
              type="submit"
              style={{
                marginTop: 24,
                padding: "10px 24px",
                fontSize: 16,
                borderRadius: 4,
                border: "none",
                background: "#54F4FC",
                color: "#282c34",
                cursor: "pointer",
                fontWeight: "bold",
                zIndex: 2,
              }}
              disabled={files.length === 0}
            >
              Submit
            </button>
          </>
        )}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <div className="spinner" style={{ marginBottom: 24 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" stroke="#54F4FC" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 24 24" to="360 24 24" />
                </circle>
              </svg>
            </div>
            <div style={{ color: "#54F4FC", fontSize: 20, marginBottom: 24 }}>Analyzing file, please wait...</div>
            {/* Progress bars */}
            <div style={{ width: 320, marginBottom: 16 }}>
              <div style={{ marginBottom: 6, color: '#fff' }}>Static Analysis <span style={{ float: 'right', color: staticDone ? '#4caf50' : '#54F4FC' }}>{staticDone ? 'Done' : `${Math.round(staticProgress)}%`}</span></div>
              <div style={{ background: '#222', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                <div style={{ width: `${staticProgress}%`, height: '100%', background: staticDone ? '#4caf50' : '#54F4FC', transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ width: 320 }}>
              <div style={{ marginBottom: 6, color: '#fff' }}>Dynamic Analysis <span style={{ float: 'right', color: dynamicDone ? '#4caf50' : '#54F4FC' }}>{dynamicDone ? 'Done' : `${Math.round(dynamicProgress)}%`}</span></div>
              <div style={{ background: '#222', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                <div style={{ width: `${dynamicProgress}%`, height: '100%', background: dynamicDone ? '#4caf50' : '#54F4FC', transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </form>
    </section>
  );
};

export default Submit;