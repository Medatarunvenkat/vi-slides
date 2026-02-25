import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService, Assignment } from '../services/assignmentService';
import { submissionService, Submission } from '../services/submissionService';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const Assignments: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    const isTeacher = user?.role?.toLowerCase() === 'teacher';

    // Form state for creating assignment
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        maxMarks: 100,
        deadline: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const assignmentsRes = await assignmentService.getAllAssignments();
            if (assignmentsRes.success) {
                setAssignments(assignmentsRes.data);
            }

            // If student, also fetch their submissions
            if (!isTeacher) {
                const submissionsRes = await submissionService.getMySubmissions();
                if (submissionsRes.success) {
                    setSubmissions(submissionsRes.data);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setToast({ message: 'Failed to load assignments', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await assignmentService.createAssignment(formData);
            if (response.success) {
                setToast({ message: 'Assignment created successfully!', type: 'success' });
                setShowCreateForm(false);
                setFormData({ title: '', description: '', maxMarks: 100, deadline: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Create error:', error);
            setToast({ message: 'Failed to create assignment', type: 'error' });
        }
    };

    const handleEditAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) return;

        try {
            const response = await assignmentService.updateAssignment(selectedAssignment._id, formData);
            if (response.success) {
                setToast({ message: 'Assignment updated successfully!', type: 'success' });
                setShowEditModal(false);
                setSelectedAssignment(null);
                setFormData({ title: '', description: '', maxMarks: 100, deadline: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Update error:', error);
            setToast({ message: 'Failed to update assignment', type: 'error' });
        }
    };

    const handleDeleteAssignment = async () => {
        if (!selectedAssignment) return;

        try {
            const response = await assignmentService.deleteAssignment(selectedAssignment._id);
            if (response.success) {
                setToast({ message: 'Assignment deleted successfully!', type: 'success' });
                setShowDeleteModal(false);
                setSelectedAssignment(null);
                fetchData();
            }
        } catch (error) {
            console.error('Delete error:', error);
            setToast({ message: 'Failed to delete assignment', type: 'error' });
        }
    };

    const openEditModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            maxMarks: assignment.maxMarks,
            deadline: new Date(assignment.deadline).toISOString().slice(0, 16)
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setShowDeleteModal(true);
    };

    const getSubmissionStatus = (assignmentId: string) => {
        const submission = submissions.find(s => s.assignment._id === assignmentId);
        return submission;
    };

    const getTimeRemaining = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();

        if (diff < 0) return 'Overdue';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return 'Due soon';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚 Assignments</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {isTeacher ? 'Manage and grade student assignments' : 'View and submit your assignments'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            ← Back to Dashboard
                        </button>
                        {isTeacher && (
                            <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
                                {showCreateForm ? 'Cancel' : '+ Create Assignment'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Create Assignment Form (Teacher Only) */}
                {isTeacher && showCreateForm && (
                    <div className="glass-card anim-slide-up" style={{ marginBottom: '2rem', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New Assignment</h3>
                        <form onSubmit={handleCreateAssignment}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="form-label">Max Marks</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.maxMarks}
                                        onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Create Assignment</button>
                        </form>
                    </div>
                )}

                {/* Assignments List */}
                {assignments.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                        <h3>No assignments yet</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {isTeacher ? 'Create your first assignment to get started!' : 'Check back later for new assignments'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {assignments.map((assignment) => {
                            const submission = getSubmissionStatus(assignment._id);
                            const timeRemaining = getTimeRemaining(assignment.deadline);
                            const isOverdue = timeRemaining === 'Overdue';

                            return (
                                <div
                                    key={assignment._id}
                                    className="glass-card"
                                    style={{
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: submission?.status === 'graded' ? '1px solid var(--color-success)' : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                    onClick={() => navigate(`/assignments/${assignment._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{assignment.title}</h3>
                                                {!isTeacher && submission && (
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: submission.status === 'graded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                        color: submission.status === 'graded' ? 'var(--color-success)' : 'var(--color-primary-light)'
                                                    }}>
                                                        {submission.status === 'graded' ? `✓ Graded (${submission.marksObtained}/${assignment.maxMarks})` : '✓ Submitted'}
                                                    </span>
                                                )}
                                                {!isTeacher && submission?.isLate && (
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: 'rgba(245, 158, 11, 0.15)',
                                                        color: 'var(--color-warning)'
                                                    }}>
                                                        Late
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                                {assignment.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                <span>📊 Max Marks: <strong>{assignment.maxMarks}</strong></span>
                                                <span style={{ color: isOverdue ? 'var(--color-error)' : 'inherit' }}>
                                                    ⏰ {timeRemaining}
                                                </span>
                                                {isTeacher && <span>👤 By: {assignment.teacher.name}</span>}
                                            </div>
                                            {isTeacher && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(assignment);
                                                        }}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeleteModal(assignment);
                                                        }}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--color-error)' }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '2rem' }}>
                                            {submission?.status === 'graded' ? '✅' : submission ? '📤' : '📝'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

                {/* Edit Assignment Modal */}
                {showEditModal && selectedAssignment && (
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
                    }} onClick={() => setShowEditModal(false)}>
                        <div className="glass-card anim-slide-up" style={{
                            maxWidth: '600px',
                            width: '100%',
                            padding: '2rem',
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Edit Assignment</h3>
                            <form onSubmit={handleEditAssignment}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label className="form-label">Max Marks</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.maxMarks}
                                            onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Update Assignment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedAssignment && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }} onClick={() => setShowDeleteModal(false)}>
                        <div className="glass-card anim-slide-up" style={{
                            maxWidth: '400px',
                            width: '90%',
                            padding: '1.5rem',
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--color-error)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>⚠</div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', margin: 0, marginBottom: '0.25rem' }}>Delete Assignment?</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>This will delete all submissions</p>
                                </div>
                            </div>

                            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                Are you sure you want to delete "<strong>{selectedAssignment.title}</strong>"? This action cannot be undone.
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.6rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAssignment}
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        background: 'var(--color-error)',
                                        borderColor: 'var(--color-error)'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;
