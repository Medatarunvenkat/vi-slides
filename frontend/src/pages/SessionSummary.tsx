import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionService, Session } from '../services/sessionService';

const SessionSummary: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const summaryData = location.state?.summaryData;
    const [sessionDetails, setSessionDetails] = useState<Session | null>(null);

    useEffect(() => {
        if (summaryData?.code) {
            const fetchSession = async () => {
                try {
                    const res = await sessionService.getSessionDetails(summaryData.code);
                    if (res.success) {
                        setSessionDetails(res.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch session details", error);
                }
            };
            fetchSession();
        }
    }, [summaryData]);

    // If no data is present (e.g., direct link), redirect to dashboard
    if (!summaryData) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
                <div className="glass-card text-center">
                    <h2>No Summary Available</h2>
                    <p className="text-muted mb-4">It looks like you haven't just ended a session.</p>
                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    const { title, code, questionCount, duration, moodSummary } = summaryData;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>

                {/* Success Header */}
                <div className="text-center mb-5 anim-fade-in">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        ✓
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Session Summary</h1>
                    <p className="text-muted">Class concluded successfully</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="glass-card text-center" style={{ padding: '2rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Session</span>
                        <h3 style={{ margin: 0 }}>{title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 'bold' }}>{code}</span>
                    </div>

                    <div className="glass-card text-center" style={{ padding: '2rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Questions Asked</span>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--color-primary)' }}>{questionCount}</h2>
                    </div>

                    <div className="glass-card text-center" style={{ padding: '2rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Duration</span>
                        <h3 style={{ margin: 0 }}>{duration} min</h3>
                    </div>
                </div>

                {/* Attendance Report (Teacher Only) */}
                {user?.role === 'Teacher' && sessionDetails?.attendance && sessionDetails.attendance.length > 0 && (
                    <div className="glass-card anim-slide-up" style={{ padding: '2rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>📋</div>
                            <h3 style={{ margin: 0 }}>Attendance Report</h3>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text-secondary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem' }}>Student Name</th>
                                        <th style={{ textAlign: 'left', padding: '1rem' }}>Join Time</th>
                                        <th style={{ textAlign: 'left', padding: '1rem' }}>Leave Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        // 1. Filter out teacher and consolidate student records
                                        const uniqueStudents = new Map<string, typeof sessionDetails.attendance[0]>();

                                        sessionDetails.attendance.forEach(record => {
                                            // Skip if it's the teacher
                                            if (record.email === user.email || record.student === (sessionDetails.teacher._id || sessionDetails.teacher)) {
                                                return;
                                            }

                                            // Determine key (prefer ID, fallback to email)
                                            const key = record.student || record.email;
                                            const existing = uniqueStudents.get(key);

                                            if (!existing) {
                                                // Clone to avoid mutating original
                                                uniqueStudents.set(key, { ...record });
                                            } else {
                                                // Keep earliest join time
                                                if (new Date(record.joinTime) < new Date(existing.joinTime)) {
                                                    existing.joinTime = record.joinTime;
                                                }

                                                // Logic for leave time:
                                                // If CURRENT or EXISTING is active (no leaveTime), the student is considered ACTIVE (leaveTime = undefined)
                                                // Else, take the LATEST leave time

                                                if (!record.leaveTime || !existing.leaveTime) {
                                                    existing.leaveTime = undefined;
                                                } else {
                                                    if (new Date(record.leaveTime) > new Date(existing.leaveTime)) {
                                                        existing.leaveTime = record.leaveTime;
                                                    }
                                                }
                                            }
                                        });

                                        return Array.from(uniqueStudents.values()).map((record, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--color-text)' }}>{record.name}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    {new Date(record.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {record.leaveTime
                                                        ? new Date(record.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : sessionDetails.endedAt
                                                            ? new Date(sessionDetails.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>Active</span>
                                                    }
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* AI Mood Summary */}
                <div className="glass-card anim-slide-up" style={{ padding: '2.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>🤖</div>
                        <h3 style={{ margin: 0 }}>Class Mood Summary</h3>
                    </div>

                    <div style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        color: 'var(--color-text-secondary)',
                        fontStyle: 'italic',
                        paddingLeft: '1.5rem',
                        borderLeft: '4px solid var(--color-primary)'
                    }}>
                        "{moodSummary}"
                    </div>
                </div>

                {/* Actions */}
                <div className="text-center mt-7" style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 2.5rem' }}
                    >
                        Back to Dashboard
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SessionSummary;
