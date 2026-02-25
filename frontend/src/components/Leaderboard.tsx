import React from 'react';

interface Student {
    _id: string;
    id?: string;
    name: string;
    email: string;
    points: number;
    avatar?: string;
}

interface LeaderboardProps {
    students?: Student[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ students = [] }) => {
    // Sort students by points (high to low)
    const sortedStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));

    return (
        <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 className="mb-0">🏆 Leaderboard</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Top Students</span>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {sortedStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        No participants yet
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sortedStudents.map((student, index) => (
                            <li key={student._id || student.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.6rem',
                                marginBottom: '0.5rem',
                                background: index === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                border: index === 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--color-text-muted)',
                                    marginRight: '0.5rem'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    marginRight: '0.8rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {student.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {student.points || 0} pts
                                    </div>
                                </div>
                                {index === 0 && <div style={{ fontSize: '1.2rem' }}>👑</div>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
