import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface CertificateCardProps {
    sessionTitle: string;
    sessionCode: string;
    studentName: string;
    date: string;
    teacherName: string;
    onDelete: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
    sessionTitle,
    sessionCode,
    studentName,
    date,
    teacherName,
    onDelete
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: '#1e1e2e', // Match theme background
                useCORS: true
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Certificate-${sessionTitle}-${studentName}.png`;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="certificate-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div
                ref={cardRef}
                className="glass-card"
                style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '2px solid gold',
                    background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.95), rgba(40, 40, 60, 0.95))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    color: '#fff',
                    position: 'relative'
                }}
            >
                <div style={{ border: '1px solid rgba(255,215,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎓</div>
                    <h2 style={{
                        fontFamily: 'serif',
                        fontSize: '2rem',
                        color: 'gold',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        Certificate of Participation
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '2rem' }}>This certifies that</p>

                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#fff',
                        marginBottom: '1.5rem',
                        fontFamily: 'cursive',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        {studentName}
                    </h1>

                    <p style={{ fontSize: '1rem', color: '#eee', marginBottom: '1rem' }}>
                        Has successfully participated in the interactive session:
                    </p>

                    <h3 style={{ fontSize: '1.5rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>{sessionTitle}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '2rem' }}>Session Code: {sessionCode}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Date</p>
                            <p style={{ fontSize: '1rem' }}>{new Date(date).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Instructor</p>
                            <p style={{ fontSize: '1rem' }}>{teacherName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions overlay - excluded from download by being outside the ref if needed, 
                but here we want buttons to be outside visual capture anyway.
                Actually, above setup captures the buttons if they are inside ref. 
                I placed buttons OUTSIDE the captured div 'cardRef'.
             */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                <button
                    onClick={handleDownload}
                    className="btn btn-primary"
                    disabled={downloading}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {downloading ? 'Downloading...' : '📥 Download'}
                </button>
                <button
                    onClick={onDelete}
                    className="btn btn-secondary"
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                >
                    🗑️ Remove
                </button>
            </div>
        </div>
    );
};

export default CertificateCard;
