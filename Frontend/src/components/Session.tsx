import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from '../hooks/useSocket';
import { sessionService } from "../services/sessionService";
import "../styles/session.css";

type Student = {
  id: string;
  name: string;
  joinedAt: string;
};

type Question = {
  id: string;
  studentName: string;
  question: string;
  timestamp: string;
  answer?: string;
};

type SessionItem = {
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  status?: "active" | "ended";
  students?: Student[];
};

export default function Session() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { sessionCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = searchParams.get("role");

  const [students, setStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<SessionItem | null>(null);
  const [ended, setEnded] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);


  const userInfo = JSON.parse(localStorage.getItem("studentInfo") || "{}");

  const { socket, connected } = useSocket(
    sessionCode || '',
    role || '',
    userInfo.name || ''
  );

  // SOCKET
  useEffect(() => {
    if (!socket) return;

    socket.on('load-questions', setQuestions);
    socket.on('new-question', (q: Question) =>
      setQuestions(prev => [...prev, q])
    );
    socket.on('new-answer', (q: Question) => {
      setQuestions(prev => prev.map(x => x.id === q.id ? q : x));
      setIsAIThinking(false);
    });
    socket.on('session-ended', () => {
      setEnded(true);
      // If student, show message and redirect after delay
      if (role === 'student') {
        toast.error('Session has been ended by the teacher');
        setTimeout(() => navigate('/student'), 2000);
      } else if (role === 'teacher') {
        // Teachers who didn't click "End" might see this (e.g., another teacher or session closed remotely)
        toast('This session has been closed', { icon: '🛑' });
        setTimeout(() => navigate('/teacher'), 2000);
      }
    });
    socket.on('session-paused-toggled', (paused: boolean) => {
      setIsPaused(paused);
      if (paused) {
        toast.error('Session has been paused');
      } else {
        toast.success('Session has been resumed');
      }
    });

    socket.on('update-students', (updatedStudents: string[]) => {
      const formattedStudents: Student[] = updatedStudents.map((name, index) => ({
        id: index.toString(),
        name,
        joinedAt: new Date().toISOString()
      }));
      setStudents(formattedStudents);
    });

    return () => {
      socket.off('load-questions');
      socket.off('new-question');
      socket.off('new-answer');
      socket.off('session-ended');
      socket.off('session-paused-toggled');
      socket.off('update-students');
    };
  }, [socket]);

  // LOAD SESSION
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionCode) return;
      try {
        const found = await sessionService.getSession(sessionCode);
        setSession(found);
        if (found.status === "ended") setEnded(true);
      } catch (err) {
        setSession(null);
      }
    };
    loadSession();
  }, [sessionCode]);

  // ACTIONS
  const handleSendQuestion = () => {
    if (!newQuestion.trim() || !socket || isPaused) return;

    socket.emit('send-question', {
      sessionCode,
      question: newQuestion.trim()
    });

    setNewQuestion('');
  };

  const handleSendAnswer = (id: string) => {
    if (!answerText.trim() || !socket) return;

    socket.emit('send-answer', {
      sessionCode,
      questionId: id,
      answer: answerText.trim()
    });

    setAnswerText('');
  };

  const handleAskAI = (id: string) => {
    if (!socket || isAIThinking) return;
    setIsAIThinking(true);
    socket.emit('ask-ai', {
      sessionCode,
      questionId: id
    });
    toast.success('Asking AI for a response...');
  };

  const handleStudentLeave = () => navigate("/student");

  const handleEndSession = async () => {
    if (socket && role === "teacher") {
      socket.emit('end-session', { sessionCode });
    }

    try {
      if (sessionCode) {
        await sessionService.endSession(sessionCode);
      }
      setEnded(true);
      toast.success('Session ended successfully');
      navigate('/teacher');
    } catch (err) {
      console.error("Failed to end session", err);
      navigate('/teacher');
    }
  };

  const handleTogglePause = () => {
    if (socket && role === "teacher") {
      socket.emit('toggle-pause', { sessionCode });
    }
  };

  if (!session) return <div className="center-msg">Session not found</div>;
  if (ended) return <div className="center-msg">Session ended</div>;

  const current = currentSlideIndex !== null ? questions[currentSlideIndex] : null;

  return (
    <div className="session-page">
      <div className="session-container">

        {/* HEADER */}
        <header className="session-topbar">
          <span className="session-title">Code: {sessionCode}</span>
          <span className="session-title">{session.name}</span>
          <div className="actions">
            {role === "teacher" && (
              <>
                <button
                  className={isPaused ? "btn-success" : "btn-warning"}
                  onClick={handleTogglePause}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button className="btn-danger" onClick={handleEndSession}>End</button>
              </>
            )}

            {role === "student" && (
              <button className="btn-danger" onClick={handleStudentLeave}>Leave</button>
            )}

            <button className="btn-icon" onClick={() => navigate("/")}>
              <ArrowLeft size={14} />
            </button>
          </div>
        </header>

        {/* Q&A */}
        <div className={`qa-sidebar ${showSidebar ? "open" : ""}`}>
          <h3>Questions</h3>
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`sidebar-item ${currentSlideIndex === index ? "active" : ""}`}
              onClick={() => {
                setCurrentSlideIndex(index);
                setShowSidebar(false);
              }}
            >
              <strong>{q.studentName}</strong>
              <p>{q.question}</p>
            </div>
          ))}
        </div>
        {showSidebar && (
          <div className="overlay" onClick={() => setShowSidebar(false)} />
        )}
        <div className="card">
          <div className="card-title">
            <button onClick={() => setShowSidebar(true)} className="card-btn">☰</button>
            Live Q&A {connected ? "🟢" : "⚪"} {isPaused && <span className="paused-badge">Paused</span>}
          </div>


          {questions.length === 0 ? (
            <div className="qa-empty">No questions yet</div>
          ) : current === null ? (
            <div className="qa-empty">Select a question from sidebar</div>
          ) : (
            <div className="qa-box">
              <div className="question" key={current.id}>
                <span className="student">{current?.studentName}</span>
                <p>{current?.question}</p>

                {current.answer ? (
                  <div className="answer">{current.answer}</div>
                ) : role === "teacher" && (
                  <div className="input-row">
                    <input
                      className="input"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write answer..."
                    />
                    <button className="btn-primary" onClick={() => handleSendAnswer(current.id)}>
                      Reply
                    </button>
                    <button
                      className="btn-ai"
                      onClick={() => handleAskAI(current.id)}
                      disabled={isAIThinking}
                    >
                      <Sparkles size={14} style={{ marginRight: '5px' }} />
                      {isAIThinking ? "Thinking..." : "Ask AI"}
                    </button>
                  </div>
                )}
              </div>

              {/* NAV */}
              <div className="nav-btns">
                <button disabled={currentSlideIndex === null} onClick={() => setCurrentSlideIndex(i =>
                  i === null ? 0 : Math.max(0, i - 1))
                }
                >Prev
                </button>
                <button
                  disabled={currentSlideIndex === null}
                  onClick={() =>
                    setCurrentSlideIndex(i =>
                      i === null ? 0 : Math.min(questions.length - 1, i + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {role === "student" && (
            <div className={`input-row ${isPaused ? "paused-input" : ""}`}>
              <input
                className="input"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={isPaused ? "Session is paused..." : "Ask a question..."}
                disabled={isPaused}
              />
              <button
                className="btn-primary"
                onClick={handleSendQuestion}
                disabled={isPaused}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* STUDENTS */}
        {role === "teacher" && (
          <div className="card">
            <div className="card-title">
              Students ({students.length})
            </div>

            {students.map(s => (
              <div key={s.id} className="student-item">
                {s.name}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}