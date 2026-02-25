import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionService } from '../services/sessionService';
import { questionService, Question } from '../services/questionService';
import { socketService } from '../services/socketService';

const QueryPPTView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initQueryMode = async () => {
            try {
                // 1. Get/Create the persistent query session
                const sResponse = await sessionService.getQuerySession();
                if (sResponse.success) {
                    setSession(sResponse.data);

                    // 2. Fetch existing questions
                    const qResponse = await questionService.getSessionQuestions(sResponse.data._id);
                    if (qResponse.success) {
                        setQuestions(qResponse.data);
                    }

                    // 3. Connect to Socket and listen for new questions
                    socketService.connect();
                    socketService.joinSession({ sessionCode: sResponse.data.code, user });

                    socketService.onNewQuestion((newQ: Question) => {
                        setQuestions(prev => {
                            // Avoid duplicates
                            if (prev.find(q => q._id === newQ._id)) return prev;
                            return [...prev, newQ];
                        });
                    });
                }
            } catch (err) {
                console.error('Error initializing Query Mode:', err);
            } finally {
                setLoading(false);
            }
        };

        initQueryMode();

        return () => {
            if (session) {
                socketService.leaveSession(session.code);
            }
            socketService.offNewQuestion();
        };
    }, []);

    const deleteQuestion = async (id: string) => {
        try {
            const response = await questionService.deleteQuestion(id);
            if (response.success) {
                setQuestions(questions.filter(q => q._id !== id));
            }
        } catch (err) {
            console.error('Error deleting question:', err);
        }
    };

    const totalSlides = questions.length + 1; // +1 for QR slide

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0a0c', color: 'white', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{
                width: '250px',
                background: '#16161e',
                borderRight: '1px solid #2d2d3a',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Slides</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                    >✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* QR Code Slide Thumbnail */}
                    <div
                        onClick={() => setCurrentSlide(0)}
                        style={{
                            padding: '0.5rem',
                            border: currentSlide === 0 ? '2px solid #6366f1' : '1px solid #2d2d3a',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: currentSlide === 0 ? 'rgba(99, 102, 241, 0.1)' : '#1a1a24'
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px' }}>Slide 1</div>
                        <div style={{ background: 'white', height: '80px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {session?.code ? (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(session.customQueryUrl || session.joinUrl)}`}
                                    alt="QR Thumbnail"
                                    style={{ height: '80%', width: 'auto' }}
                                />
                            ) : (
                                <div style={{ color: '#ccc', fontSize: '10px' }}>Loading...</div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', marginTop: '4px', textAlign: 'center' }}>QR Code</p>
                    </div>

                    {/* Question Slides Thumbnails */}
                    {questions.map((q, i) => (
                        <div
                            key={q._id}
                            onClick={() => setCurrentSlide(i + 1)}
                            style={{
                                padding: '0.5rem',
                                border: currentSlide === i + 1 ? '2px solid #6366f1' : '1px solid #2d2d3a',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: currentSlide === i + 1 ? 'rgba(99, 102, 241, 0.1)' : '#1a1a24',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px' }}>Slide {i + 2}</div>
                            <div style={{
                                height: '80px',
                                background: '#242433',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                fontSize: '0.65rem',
                                color: '#ccc',
                                overflow: 'hidden'
                            }}>
                                {q.content}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteQuestion(q._id); }}
                                style={{
                                    position: 'absolute', top: '2px', right: '2px',
                                    background: 'rgba(239, 68, 68, 0.8)', border: 'none',
                                    color: 'white', borderRadius: '50%', width: '16px', height: '16px',
                                    fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >×</button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #2d2d3a', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                        Manual question addition is disabled in Query Mode. Use the QR code to post questions.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                    {loading ? (
                        <div className="spinner"></div>
                    ) : currentSlide === 0 ? (
                        <div style={{
                            background: 'white', padding: '3rem', borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center',
                            maxWidth: '600px', width: '100%'
                        }}>
                            <h1 style={{ color: '#1a1a24', marginBottom: '2rem', fontSize: '2.5rem' }}>Scan to Ask Questions</h1>
                            {session?.code && (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(session.customQueryUrl || session.joinUrl)}`}
                                    alt="QR Code"
                                    style={{ width: '80%', height: 'auto', marginBottom: '2rem' }}
                                />
                            )}
                            <p style={{ color: '#666', fontSize: '1.2rem' }}>Go to your camera and scan the code above!</p>
                        </div>
                    ) : (
                        <div style={{
                            background: 'linear-gradient(135deg, #1e1e2d 0%, #16161e 100%)',
                            padding: '5rem', borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                            textAlign: 'center',
                            maxWidth: '1000px', width: '100%', minHeight: '400px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', textShadow: '0 4px 10px rgba(0,0,0,0.5)', marginBottom: '2rem' }}>
                                {questions[currentSlide - 1].content}
                            </h1>
                            <div style={{
                                padding: '10px 20px', background: 'rgba(255,255,255,0.05)',
                                borderRadius: '100px', fontSize: '1.2rem', color: '#888'
                            }}>
                                Asked by <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{questions[currentSlide - 1].guestName || 'Anonymous'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Bar */}
                <div style={{
                    height: '80px', background: '#16161e', borderTop: '1px solid #2d2d3a',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>
                            Slide {currentSlide + 1} of {totalSlides}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            disabled={currentSlide === 0}
                            onClick={() => setCurrentSlide(prev => prev - 1)}
                            style={{
                                padding: '0.6rem 1.5rem', background: '#242433',
                                border: '1px solid #2d2d3a', borderRadius: '8px', color: 'white',
                                cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', opacity: currentSlide === 0 ? 0.5 : 1
                            }}
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentSlide === totalSlides - 1}
                            onClick={() => setCurrentSlide(prev => prev + 1)}
                            style={{
                                padding: '0.6rem 1.5rem', background: '#6366f1',
                                border: 'none', borderRadius: '8px', color: 'white',
                                cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold', opacity: currentSlide === totalSlides - 1 ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                padding: '0.6rem 1.5rem', background: 'transparent',
                                border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444',
                                cursor: 'pointer'
                            }}
                        >
                            End Presentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryPPTView;
