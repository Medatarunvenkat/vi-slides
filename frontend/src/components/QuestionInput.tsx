import React, { useState } from 'react';
import { questionService } from '../services/questionService';

interface QuestionInputProps {
    sessionId: string;
    sessionStatus?: string;
    onQuestionSubmitted?: (question: any) => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ sessionId, sessionStatus, onQuestionSubmitted }) => {
    const isPaused = sessionStatus === 'paused';
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Voice recognition is not supported in your browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setContent(prev => {
                const newContent = prev.trim() ? `${prev} ${transcript}` : transcript;
                return newContent;
            });
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
            } else {
                setError('Speech recognition failed. Try again.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check: Don't submit if already loading or no content
        if (loading || !content.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await questionService.createQuestion({
                content: content.trim(),
                sessionId,
                isDirectToTeacher: true // Always send to teacher first
            });

            if (response.success) {
                setContent(''); // Clear UI immediately
                if (onQuestionSubmitted) {
                    onQuestionSubmitted(response.data);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)' }}>
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '0.75rem', position: 'relative' }}>
                    <textarea
                        className="form-input"
                        placeholder={isPaused ? "Session is paused by teacher..." : "Ask a question..."}
                        rows={3}
                        style={{
                            resize: 'none',
                            background: isPaused ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-lg)',
                            transition: 'all 0.3s ease',
                            cursor: isPaused ? 'not-allowed' : 'text',
                            paddingRight: '3rem'
                        }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && !isPaused) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        disabled={loading || isPaused}
                    ></textarea>

                    {!isPaused && (
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                color: isListening ? '#ef4444' : 'var(--color-primary-light)',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
                            }}
                            title="Voice Input"
                            disabled={loading}
                        >
                            {isListening ? '🛑' : '🎤'}
                        </button>
                    )}
                </div>

                {error && <span className="form-error mb-2">{error}</span>}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)' }}
                        disabled={loading || !content.trim() || isPaused}
                    >
                        {loading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : (isPaused ? 'Paused' : 'Send Question')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionInput;
