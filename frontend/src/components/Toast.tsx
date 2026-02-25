import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getStyles = () => {
        const baseStyles = {
            position: 'fixed' as const,
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '300px',
            maxWidth: '500px',
            zIndex: 9999,
            animation: 'slideInRight 0.3s ease-out'
        };

        const typeStyles = {
            success: {
                background: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981'
            },
            error: {
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
            },
            warning: {
                background: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: '#f59e0b'
            },
            info: {
                background: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                color: 'var(--color-primary-light)'
            }
        };

        return { ...baseStyles, ...typeStyles[type] };
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    };

    return (
        <div style={getStyles()} className="anim-fade-in">
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'currentColor',
                color: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
            }}>
                {getIcon()}
            </div>
            <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'currentColor',
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '1.2rem',
                    padding: '0',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
