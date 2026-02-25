import React, { useState } from 'react';
import { pollService } from '../services/pollService';

interface PollCreatorProps {
    sessionId: string;
    onPollCreated: (poll: any) => void;
}

const PollCreator: React.FC<PollCreatorProps> = ({ sessionId, onPollCreated }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!question.trim()) {
            setError('Please enter a question');
            return;
        }

        const filteredOptions = options.filter(opt => opt.trim() !== '');
        if (filteredOptions.length < 2) {
            setError('Please provide at least 2 options');
            return;
        }

        setLoading(true);
        try {
            const response = await pollService.createPoll({
                question,
                type: 'mcq',
                options: filteredOptions,
                sessionId
            });

            if (response.success) {
                setQuestion('');
                setOptions(['', '']);
                onPollCreated(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card anim-slide-up" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--color-primary-light)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span> Create Live Poll
            </h3>

            <form onSubmit={handleCreatePoll}>
                <div className="form-group mb-3">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Question</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Which framework do you prefer?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Options</label>
                    {options.map((option, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required={index < 2}
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOption(index)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.5rem' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {options.length < 5 && (
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                        >
                            + Add Option
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-error" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                    disabled={loading}
                >
                    {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : '🚀 Launch Live Poll'}
                </button>
            </form>
        </div>
    );
};

export default PollCreator;
