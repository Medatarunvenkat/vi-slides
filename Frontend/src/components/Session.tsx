import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSocket } from '../hooks/useSocket';
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
    socket.on('new-answer', (q: Question) =>
      setQuestions(prev => prev.map(x => x.id === q.id ? q : x))
    );
  }, [socket]);

  // LOAD SESSION
  useEffect(() => {
    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const found = sessions.find(s => s.code === sessionCode);
    if (!found) return setSession(null);
    if (found.status === "ended") setEnded(true);

    setSession(found);
    setStudents(found.students || []);
  }, [sessionCode]);

  // AUTO JOIN
  useEffect(() => {
    if (role !== "student" || !sessionCode) return;

    const info = JSON.parse(localStorage.getItem("studentInfo") || "{}");
    const name = info.name || info.email?.split("@")[0];

    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");
    const current = sessions.find(s => s.code === sessionCode);

    if (!current) return;

    setStudents(current.students || []);

    const exists = current.students?.some(s => s.name === name);
    if (!exists) {
      const newStudent: Student = {
        id: Date.now().toString(),
        name,
        joinedAt: new Date().toISOString()
      };

      const updated = sessions.map(s =>
        s.code === sessionCode
          ? { ...s, students: [...(s.students || []), newStudent] }
          : s
      );

      localStorage.setItem("sessions", JSON.stringify(updated));
      setStudents(prev => [...prev, newStudent]);
    }
  }, [role, sessionCode]);

  // ACTIONS
  const handleSendQuestion = () => {
    if (!newQuestion.trim() || !socket) return;

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

  const handleStudentLeave = () => navigate("/student");

  const handleEndSession = () => {
    const sessions: SessionItem[] = JSON.parse(localStorage.getItem("sessions") || "[]");

    const updated = sessions.map(s =>
      s.code === sessionCode ? { ...s, status: "ended" } : s
    );

    localStorage.setItem("sessions", JSON.stringify(updated));
    setEnded(true);
    navigate(role === "teacher" ? "/teacher" : "/student");
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
              <button className="btn-danger" onClick={handleEndSession}>End</button>
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
         Live Q&A {connected ? "🟢" : "⚪"}
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
                  </div>
                )}
              </div>

              {/* NAV */}
              <div className="nav-btns">
                   <button disabled={currentSlideIndex === null}  onClick={() =>  setCurrentSlideIndex(i =>
                       i === null ? 0 : Math.max(0, i - 1) )
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
            <div className="input-row">
              <input
                className="input"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
              />
              <button className="btn-primary" onClick={handleSendQuestion}>
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