import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { guestService } from '../services/guestService';

const QueryAsk: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        question: ''
    });

    useEffect(() => {
        const fetchSessionInfo = async () => {
            if (!code) return;
            try {
                const response = await guestService.getPublicSessionInfo(code);
                if (response.success) {
                    setSessionTitle(response.data.title);
                }
            } catch (err: any) {
                console.error('Session info fetch error:', err);
                setError('Session not found or inactive.');
            } finally {
                setLoading(false);
            }
        };
        fetchSessionInfo();
    }, [code]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !formData.name.trim() || !formData.question.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await guestService.submitGuestJoin({
                code,
                name: formData.name,
                email: 'guest@vi-slides.com', // Placeholder since it's an internal query session
                question: formData.question
            });

            if (response.success) {
                setSuccess(true);
                setFormData(prev => ({ ...prev, question: '' }));
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to send question.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner" style={{ border: '4px solid rgba(99, 102, 241, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #1e1e2d, #0a0a0c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: 'white'
        }}>
            <style>
                {`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 450px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.6s ease-out;
                }
                .input-field {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    padding: 16px;
                    width: 100%;
                    margin-bottom: 24px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .submit-btn {
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    padding: 16px;
                    width: 100%;
                    font-size: 18px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5);
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                `}
            </style>

            <div className="glass-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px'
                    }}>
                        ❓
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Ask a Question</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
                        {sessionTitle || 'Join the conversation'}
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '50%', color: '#10b981', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                            fontSize: '24px'
                        }}>✓</div>
                        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Sent Successfully!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Your question will appear on the slide shortly.</p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="submit-btn"
                            style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}
                        >
                            Ask Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                                padding: '12px', borderRadius: '8px', marginBottom: '20px',
                                fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                {error}
                            </div>
                        )}

                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Your Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Your Question</label>
                        <textarea
                            className="input-field"
                            placeholder="What would you like to ask?"
                            rows={4}
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                            style={{ resize: 'none' }}
                        />

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Sending...' : 'Post Question'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default QueryAsk;
