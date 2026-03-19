import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/student.css";

type SessionItem = {
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  status?: "active" | "ended";
};

export default function Student() {
  const [sessionCode, setSessionCode] = useState("");
  const navigate = useNavigate();

  const handleJoinSession = () => {
    const trimmedCode = sessionCode.trim().toUpperCase();
    if (!trimmedCode) { toast.error("Please enter a session code"); return; }

    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const matched = sessions.find((s) => s.code === trimmedCode);

    if (!matched) { toast.error("Session not found. Check your code and try again."); return; }
    if (matched.status === "ended") { toast.error("This session has ended. Please contact your teacher."); return; }

    navigate(`/session/${trimmedCode}?role=student`);
  };

  return (
    <div className="student-page">
      {/* NAV */}
      <nav className="s-nav">
        <div className="s-nav-brand">
          <div className="brand-icon">V</div>
          <span>Vi-SlideS</span>
        </div>
        <div className="s-nav-badge">Student Mode</div>
      </nav>

      {/* MAIN */}
      <main className="s-main">
        <div className="s-join-card">
          {/* TOP */}
          <div className="s-card-top">
            <h1>Join a Session</h1>
            <p>Enter the 6-character code your teacher shared to join the live session.</p>
          </div>

          {/* FORM */}
          <div className="s-form">
            <div className="s-input-label">Session Code</div>
            <input
              className="s-code-input"
              type="text"
              placeholder="● ● ● ● ● ●"
              value={sessionCode}
              maxLength={6}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
            />
            <button className="s-join-btn" onClick={handleJoinSession}>
              Join Session <ArrowRight size={20} />
            </button>
            <p className="s-hint">Ask your teacher for the 6-character session code.</p>
          </div>
        </div>
      </main>
    </div>
  );
}