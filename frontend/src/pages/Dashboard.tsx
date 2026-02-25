import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../services/sessionService';

import { useTheme } from '../contexts/ThemeContext';

import CertificateCard from '../components/CertificateCard';
import Toast from '../components/Toast';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [sessionTitle, setSessionTitle] = useState('');
    const [error, setError] = useState('');
    const [pastSessions, setPastSessions] = useState<any[]>([]);
    const [hiddenCerts, setHiddenCerts] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_certs');
        return saved ? JSON.parse(saved) : [];
    });

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [querySession, setQuerySession] = useState<any>(null);
    const [isEditingQueryUrl, setIsEditingQueryUrl] = useState(false);
    const [tempQueryUrl, setTempQueryUrl] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const response = await sessionService.getActiveSession();
                if (response.success && response.data) {
                    // Only redirect students directly to session
                    // Teachers should see dashboard with controls and QR code
                    if (user?.role === 'Student') {
                        navigate(`/session/${response.data.code}`);
                    }
                }
            } catch (err) {
                console.error('Error fetching active session:', err);
            } finally {
                setLoading(false);
            }
        };



        const fetchPastSessions = async () => {
            if (user?.role === 'Student') {
                try {
                    // We need to implement this in service/backend first
                    const response = await sessionService.getStudentSessions();
                    if (response.success) {
                        setPastSessions(response.data);
                    }
                } catch (err) {
                    console.error('Error fetching past sessions:', err);
                }
            }
        };

        fetchActiveSession();
        fetchPastSessions();

        // For teachers, also fetch active session for QR code display
        const fetchActiveSessionForQR = async () => {
            if (user?.role === 'Teacher') {
                try {
                    const response = await sessionService.getActiveSession();
                    if (response.success && response.data) {
                        setActiveSession(response.data);
                    }

                    // Also fetch persistent query session
                    const qResponse = await sessionService.getQuerySession();
                    if (qResponse.success) {
                        setQuerySession(qResponse.data);
                    }
                } catch (err) {
                    console.error('Error fetching sessions:', err);
                }
            }
        };
        fetchActiveSessionForQR();
    }, [navigate, user]);

    const handleDeleteCert = (sessionId: string) => {
        const newHidden = [...hiddenCerts, sessionId];
        setHiddenCerts(newHidden);
        localStorage.setItem('hidden_certs', JSON.stringify(newHidden));
        setToast({ message: 'Certificate removed from view', type: 'info' });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionTitle.trim()) return;

        setError('');
        try {
            const response = await sessionService.createSession({ title: sessionTitle });
            if (response.success) {
                navigate(`/session/${response.data.code}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create session');
        }
    };

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setError('');
        try {
            const response = await sessionService.joinSession(joinCode);
            if (response.success) {
                navigate(`/session/${response.data.code}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to join session. Please check the code.');
        }
    };



    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Navigation Bar */}
            <nav style={{
                background: 'var(--color-bg-secondary)',
                opacity: 0.95,
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--color-surface)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1000
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Vi-SlideS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                    {/* Premium Avatar Trigger */}
                    <div
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '0.5rem 1.2rem',
                            borderRadius: 'var(--radius-full)',
                            transition: 'all 0.2s ease',
                            border: showUserMenu ? '1px solid var(--color-primary)' : '1px solid transparent',
                            background: showUserMenu ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{user?.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
                        </div>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: user?.avatar ? `url(${user.avatar}) center/cover no-repeat` : 'var(--gradient-primary)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: 'white',
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                            {!user?.avatar && user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Premium Dropdown Menu */}
                    {showUserMenu && (
                        <div className="glass-card slide-in" style={{
                            position: 'absolute',
                            top: '125%',
                            right: 0,
                            width: '300px',
                            padding: '1rem',
                            zIndex: 1000,
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-surface)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.3)'
                        }}>
                            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-surface)', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Signed in as</p>
                                <p style={{ fontWeight: '600', color: 'var(--color-text)', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            </div>



                            <button
                                onClick={() => { toggleTheme(); }}
                                className="btn"
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    background: 'transparent',
                                    color: 'var(--color-text)',
                                    marginBottom: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem 1rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                                <span style={{ fontSize: '1rem' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="btn"
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    background: 'transparent',
                                    color: '#ef4444',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem 1rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>🚪</span>
                                <span style={{ fontSize: '1rem' }}>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="container fade-in" style={{ paddingTop: '3rem' }}>
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h1 className="mb-2">Welcome, {user?.name}</h1>
                    <p className="text-muted">
                        {user?.role?.toLowerCase() === 'teacher' ? 'Ready to interact with your students?' : 'Join a session to start asking questions!'}
                    </p>

                    {error && (
                        <div className="alert alert-error slide-in" style={{ marginTop: '1rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Quick Actions Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start'
                }}>
                    {user?.role?.toLowerCase() === 'teacher' ? (
                        <>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 100%)' }}>
                                <h3>Start a Session</h3>
                                <p className="text-muted mt-1">Create a new live Q&A session for your class.</p>
                                <form onSubmit={handleCreateSession} style={{ marginTop: '1.5rem' }}>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder="Session Title (e.g. Intro to Biology)"
                                            className="form-input"
                                            value={sessionTitle}
                                            onChange={(e) => setSessionTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-block">Create Now</button>
                                </form>
                            </div>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0) 100%)' }}>
                                <h3>📚 Assignments</h3>
                                <p className="text-muted mt-1">Create and grade student assignments.</p>
                                <button onClick={() => navigate('/assignments')} className="btn btn-primary mt-2">Manage Assignments</button>
                            </div>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <h3>❓ Query Mode</h3>
                                <p className="text-muted mt-1">Let students post questions without login.</p>

                                <div style={{ background: 'white', padding: '10px', borderRadius: '8px', margin: '1rem 0', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                    {querySession?.code ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(querySession.customQueryUrl || querySession.joinUrl)}`}
                                            alt="Query QR Code"
                                            style={{ width: '120px', height: '120px' }}
                                        />
                                    ) : (
                                        <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading...</div>
                                    )}
                                </div>

                                {isEditingQueryUrl ? (
                                    <div style={{ width: '100%', marginBottom: '1rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={tempQueryUrl}
                                            onChange={(e) => setTempQueryUrl(e.target.value)}
                                            placeholder="Paste Google Form or Tunnel URL"
                                            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await sessionService.updateQueryUrl(tempQueryUrl);
                                                        if (response.success) {
                                                            setQuerySession(response.data);
                                                            setIsEditingQueryUrl(false);
                                                            setToast({ message: 'URL updated successfully!', type: 'success' });
                                                        }
                                                    } catch (err) {
                                                        setToast({ message: 'Failed to update URL.', type: 'error' });
                                                    }
                                                }}
                                                className="btn btn-primary"
                                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                                            >Save</button>
                                            <button
                                                onClick={() => setIsEditingQueryUrl(false)}
                                                className="btn btn-secondary"
                                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                                            >Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => {
                                                setTempQueryUrl(querySession?.customQueryUrl || querySession?.joinUrl || '');
                                                setIsEditingQueryUrl(true);
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                                        >
                                            ⚙️ Configure Link
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => navigate('/query-mode')} className="btn btn-primary btn-block">Start Query Mode</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 100%)' }}>
                                <h3>Join Session</h3>
                                <p className="text-muted mt-1">Enter the 6-digit code provided by your teacher.</p>
                                <form onSubmit={handleJoinSession} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="E.G. AB1234"
                                        className="form-input"
                                        style={{ textTransform: 'uppercase' }}
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">Join</button>
                                </form>
                            </div>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0) 100%)' }}>
                                <h3>📚 Assignments</h3>
                                <p className="text-muted mt-1">View and submit your assignments.</p>
                                <button onClick={() => navigate('/assignments')} className="btn btn-primary mt-2">View Assignments</button>
                            </div>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 100%)' }}>
                                <h3>🎓 Certificates</h3>
                                <p className="text-muted mt-1">View and download your participation certificates.</p>
                                <button onClick={() => setShowCertModal(true)} className="btn btn-primary mt-2">View Certificates</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Certificates Modal */}
                {
                    showCertModal && (
                        <div className="modal-overlay fade-in" style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            padding: '2rem'
                        }}>
                            <div className="glass-card slide-in" style={{
                                width: '100%',
                                maxWidth: '900px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative'
                            }}>
                                <button
                                    onClick={() => setShowCertModal(false)}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                                >
                                    ✕
                                </button>

                                <h2 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🎓</span> Your Certificates
                                </h2>

                                {pastSessions.filter(session => !hiddenCerts.includes(session._id)).length === 0 ? (
                                    <p className="text-muted">No certificates found. Join sessions to earn them!</p>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                        gap: '2rem',
                                        marginTop: '1.5rem'
                                    }}>
                                        {pastSessions
                                            .filter(session => !hiddenCerts.includes(session._id))
                                            .map((session) => (
                                                <CertificateCard
                                                    key={session._id}
                                                    sessionTitle={session.title}
                                                    sessionCode={session.code}
                                                    studentName={user?.name || 'Student'}
                                                    date={session.createdAt}
                                                    teacherName="Tarun Venkat"
                                                    onDelete={() => handleDeleteCert(session._id)}
                                                />
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            </main >

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* QR Code Modal */}
            {showQRModal && activeSession && (
                <div className="modal-overlay fade-in" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '2rem'
                }}>
                    <div className="glass-card slide-in" style={{
                        width: '100%',
                        maxWidth: '500px',
                        position: 'relative',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setShowQRModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                        >
                            ✕
                        </button>

                        <h2 className="mb-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span>📱</span> Join with QR Code
                        </h2>

                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            {activeSession.title}
                        </p>

                        {activeSession.qrCodeDataUrl ? (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                                <img src={activeSession.qrCodeDataUrl} alt="QR Code" style={{ width: '100%', maxWidth: '300px', height: 'auto' }} />
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
                                QR Code not available
                            </div>
                        )}

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Join URL:</p>
                            <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--color-primary-light)', wordBreak: 'break-all' }}>
                                {window.location.origin}/join/{activeSession.code}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/join/${activeSession.code}`);
                                setToast({ message: 'Join link copied to clipboard!', type: 'success' });
                            }}
                            className="btn btn-primary btn-block"
                        >
                            📋 Copy Join Link
                        </button>
                    </div>
                </div>
            )}

            {/* Certificates Section for Students */}

        </div >
    );
};

export default Dashboard;
