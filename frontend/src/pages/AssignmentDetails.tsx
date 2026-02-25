import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, Assignment } from '../services/assignmentService';
import { submissionService, Submission } from '../services/submissionService';
import Toast from '../components/Toast';

const AssignmentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [mySubmission, setMySubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    const isTeacher = user?.role?.toLowerCase() === 'teacher';

    // Student submission form
    const [submissionText, setSubmissionText] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');

    // Teacher grading form
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
    const [marks, setMarks] = useState<number>(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Fetch assignment details
            const assignmentRes = await assignmentService.getAssignmentById(id);
            if (assignmentRes.success) {
                setAssignment(assignmentRes.data);
            }

            if (isTeacher) {
                // Fetch all submissions for this assignment
                const submissionsRes = await submissionService.getSubmissionsByAssignment(id);
                if (submissionsRes.success) {
                    setSubmissions(submissionsRes.data);
                }
            } else {
                // Fetch student's own submissions
                const mySubmissionsRes = await submissionService.getMySubmissions();
                if (mySubmissionsRes.success) {
                    const mySubmissionForThis = mySubmissionsRes.data.find(s => s.assignment._id === id);
                    setMySubmission(mySubmissionForThis || null);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setToast({ message: 'Failed to load assignment details', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSubmitting(true);
        try {
            const response = await submissionService.submitAssignment({
                assignmentId: id,
                submissionText,
                pdfUrl: pdfUrl || undefined
            });

            if (response.success) {
                setToast({ message: 'Assignment submitted successfully!', type: 'success' });
                setMySubmission(response.data);
                setSubmissionText('');
                setPdfUrl('');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            setToast({
                message: error.response?.data?.message || 'Failed to submit assignment',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        try {
            const response = await submissionService.gradeSubmission(gradingSubmission._id, {
                marksObtained: marks,
                feedback
            });

            if (response.success) {
                setToast({
                    message: `Graded successfully! ${response.emailSent ? 'Email sent to student.' : 'Email failed to send.'}`,
                    type: response.emailSent ? 'success' : 'warning'
                });
                setGradingSubmission(null);
                setMarks(0);
                setFeedback('');
                fetchData(); // Refresh submissions
            }
        } catch (error) {
            console.error('Grade error:', error);
            setToast({ message: 'Failed to grade submission', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2>Assignment not found</h2>
                    <button onClick={() => navigate('/assignments')} className="btn btn-primary">
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }

    const isOverdue = new Date() > new Date(assignment.deadline);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <button onClick={() => navigate('/assignments')} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
                    ← Back to Assignments
                </button>

                {/* Assignment Info */}
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{assignment.title}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        {assignment.description}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <span>📊 Max Marks: <strong>{assignment.maxMarks}</strong></span>
                        <span style={{ color: isOverdue ? 'var(--color-error)' : 'inherit' }}>
                            ⏰ Deadline: <strong>{new Date(assignment.deadline).toLocaleString()}</strong>
                        </span>
                        <span>👤 Teacher: <strong>{assignment.teacher.name}</strong></span>
                    </div>
                </div>

                {/* Student View: Submission Form or View Submission */}
                {!isTeacher && (
                    <>
                        {mySubmission ? (
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3>Your Submission</h3>
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        background: mySubmission.status === 'graded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                        color: mySubmission.status === 'graded' ? 'var(--color-success)' : 'var(--color-primary-light)'
                                    }}>
                                        {mySubmission.status === 'graded' ? '✓ Graded' : '✓ Submitted'}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Submission Text:</strong>
                                    <p style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap' }}>
                                        {mySubmission.submissionText}
                                    </p>
                                </div>

                                {mySubmission.pdfUrl && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Attached PDF:</strong>
                                        <a href={mySubmission.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                            📄 View PDF
                                        </a>
                                    </div>
                                )}

                                {mySubmission.isLate && (
                                    <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                        <strong style={{ color: 'var(--color-warning)' }}>⚠ Late Submission</strong>
                                    </div>
                                )}

                                {mySubmission.status === 'graded' && (
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>Grade Results</h4>
                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '1rem' }}>
                                            {mySubmission.marksObtained} / {assignment.maxMarks}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', color: 'var(--color-primary-light)', marginBottom: '1rem' }}>
                                            Percentage: {((mySubmission.marksObtained! / assignment.maxMarks) * 100).toFixed(2)}%
                                        </div>
                                        {mySubmission.feedback && (
                                            <div>
                                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Teacher's Feedback:</strong>
                                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{mySubmission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Submit Assignment</h3>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label">Submission Text *</label>
                                        <textarea
                                            className="form-input"
                                            rows={8}
                                            value={submissionText}
                                            onChange={(e) => setSubmissionText(e.target.value)}
                                            placeholder="Enter your assignment submission here..."
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label">PDF URL (Optional)</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={pdfUrl}
                                            onChange={(e) => setPdfUrl(e.target.value)}
                                            placeholder="https://example.com/your-file.pdf"
                                        />
                                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                            Upload your PDF to a cloud service (Google Drive, Dropbox) and paste the link here
                                        </small>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}

                {/* Teacher View: Submissions List */}
                {isTeacher && (
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Student Submissions ({submissions.length})</h3>

                        {submissions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                <p>No submissions yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {submissions.map((submission) => (
                                    <div
                                        key={submission._id}
                                        className="glass-card"
                                        style={{
                                            padding: '1.5rem',
                                            border: submission.status === 'graded' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '0.25rem' }}>{submission.student.name}</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                    {submission.student.email}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {submission.isLate && (
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(245, 158, 11, 0.15)',
                                                        color: 'var(--color-warning)'
                                                    }}>
                                                        Late
                                                    </span>
                                                )}
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.75rem',
                                                    background: submission.status === 'graded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                    color: submission.status === 'graded' ? 'var(--color-success)' : 'var(--color-primary-light)'
                                                }}>
                                                    {submission.status === 'graded' ? `Graded: ${submission.marksObtained}/${assignment.maxMarks}` : 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Submission:</strong>
                                            <p style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                                {submission.submissionText}
                                            </p>
                                        </div>

                                        {submission.pdfUrl && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <a href={submission.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                                    📄 View PDF
                                                </a>
                                            </div>
                                        )}

                                        {submission.status === 'graded' && submission.feedback && (
                                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                                <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Your Feedback:</strong>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{submission.feedback}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setGradingSubmission(submission);
                                                setMarks(submission.marksObtained || 0);
                                                setFeedback(submission.feedback || '');
                                            }}
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                        >
                                            {submission.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Grading Modal */}
                {gradingSubmission && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1.5rem'
                    }} onClick={() => setGradingSubmission(null)}>
                        <div className="glass-card anim-slide-up" style={{
                            maxWidth: '500px',
                            width: '100%',
                            padding: '2rem',
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Grade Submission</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                Student: <strong>{gradingSubmission.student.name}</strong>
                            </p>

                            <form onSubmit={handleGrade}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Marks Obtained (out of {assignment.maxMarks})</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                        min="0"
                                        max={assignment.maxMarks}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Feedback</label>
                                    <textarea
                                        className="form-input"
                                        rows={4}
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide feedback to the student..."
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setGradingSubmission(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Grade & Email Student
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default AssignmentDetails;
