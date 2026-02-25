import React, { useState } from 'react';
import { socketService } from '../services/socketService';

interface EngagementControlsProps {
    sessionCode: string;
    user: any;
}

const EngagementControls: React.FC<EngagementControlsProps> = ({ sessionCode, user }) => {
    const [understanding, setUnderstanding] = useState('understanding');
    const [isHandRaised, setIsHandRaised] = useState(false);

    const handleUnderstandingChange = (level: string) => {
        setUnderstanding(level);
        socketService.emitUnderstandingUpdate(sessionCode, level, user);
    };

    const toggleHandRaise = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        socketService.emitHandRaise(sessionCode, newState, user);
    };

    return (
        <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <h4 className="mb-2">How are you feeling?</h4>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => handleUnderstandingChange('confused')}
                    className={`btn ${understanding === 'confused' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', background: understanding === 'confused' ? '#ef4444' : '' }}
                >
                    😕 Lost
                </button>
                <button
                    onClick={() => handleUnderstandingChange('neutral')}
                    className={`btn ${understanding === 'neutral' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', background: understanding === 'neutral' ? '#f59e0b' : '' }}
                >
                    😐 Ok
                </button>
                <button
                    onClick={() => handleUnderstandingChange('understanding')}
                    className={`btn ${understanding === 'understanding' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', background: understanding === 'understanding' ? '#10b981' : '' }}
                >
                    🙂 Got it
                </button>
            </div>

            <button
                onClick={toggleHandRaise}
                className={`btn ${isHandRaised ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: isHandRaised ? 'var(--color-warning)' : '',
                    color: isHandRaised ? 'white' : ''
                }}
            >
                {isHandRaised ? '🖐️ Lower Hand' : '✋ Raise Hand'}
            </button>
        </div>
    );
};

export default EngagementControls;
