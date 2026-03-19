import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutDashboard, Zap } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/teacher.css";

function generateSessionCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

type SessionItem = {
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  status?: "active" | "ended";
};

export default function Teacher() {
  const [sessionName, setSessionName] = useState("");
  const [activeSessions, setActiveSessions] = useState<SessionItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    setActiveSessions(sessions.filter((s) => s.status !== "ended"));
  }, []);

  const handleCreateSession = () => {
    const trimmedName = sessionName.trim();
    if (!trimmedName) { toast.error("Please enter a session name"); return; }

    const sessionCode = generateSessionCode();
    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const newSession: SessionItem = {
      code: sessionCode,
      name: trimmedName,
      createdBy: "teacher",
      createdAt: new Date().toISOString(),
      status: "active",
    };
    localStorage.setItem("sessions", JSON.stringify([...sessions, newSession]));
    setActiveSessions((prev) => [...prev, newSession]);
    navigate(`/session/${sessionCode}?role=teacher`);
  };

  return (
    <div className="teacher-page">
      {/* NAV */}
      <nav className="t-nav">
        <div className="t-nav-brand">
          <div className="brand-icon">V</div>
          <span>Vi-SlideS</span>
        </div>
        <div className="t-nav-badge">Teacher Mode</div>
      </nav>

      {/* HERO */}
      <div className="t-hero">
        <h1>Teacher Dashboard</h1>
        <p>Create and manage your interactive presentation sessions.</p>
      </div>

      {/* CONTENT GRID */}
      <div className="t-content">
        {/* Create Session */}
        <div className="t-card">
          <div className="t-card-header">
            <div>
              <h2>New Session</h2>
              <p>Start a live session for students</p>
            </div>
          </div>
          <div className="t-card-body">
            <input
              className="create-input"
              type="text"
              placeholder="e.g. Physics 101 – Thermodynamics"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
            />
            <button className="create-btn" onClick={handleCreateSession}>
              <Zap size={18} /> Create &amp; Start Session
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="t-card">
          <div className="t-card-header">
            <div>
              <h2>Active Sessions</h2>
              <p>{activeSessions.length} session{activeSessions.length !== 1 ? "s" : ""} running</p>
            </div>
          </div>
          <div className="t-card-body">
            {activeSessions.length === 0 ? (
              <div className="t-empty">
                <div className="t-empty-icon">🎬</div>
                <p>No active sessions yet.<br />Create one to get started!</p>
              </div>
            ) : (
              <div className="session-list">
                {activeSessions.map((s) => (
                  <div key={s.code} className="session-list-item" onClick={() => navigate(`/session/${s.code}?role=teacher`)}>
                    <div className="s-item-left">
                      <div className="s-item-dot" />
                      <div>
                        <div className="s-item-name">{s.name}</div>
                        <div className="s-item-code">{s.code}</div>
                      </div>
                    </div>
                    <button className="s-item-join">Open →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}