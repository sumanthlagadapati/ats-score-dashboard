import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
    const navigate = useNavigate();
    const raw = JSON.parse(localStorage.getItem('ats_history') || '[]');
    const items = [...raw].reverse();

    const clearAll = () => {
        if (window.confirm('Delete all history?')) {
            localStorage.removeItem('ats_history');
            window.location.reload();
        }
    };

    const deleteOne = (idx) => {
        const actual = raw.length - 1 - idx; // map reversed index back
        const updated = raw.filter((_, i) => i !== actual);
        localStorage.setItem('ats_history', JSON.stringify(updated));
        window.location.reload();
    };

    const getColor = (s) => s >= 80 ? 'var(--accent)' : s >= 60 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div className="container animate-fade-in" style={{ padding: '48px 24px 80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '4px' }}>Scan History</h2>
                    <p className="text-muted">{items.length} past {items.length === 1 ? 'analysis' : 'analyses'}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ padding: '10px 22px', fontSize: '.9rem' }}>
                        + New Scan
                    </button>
                    {items.length > 0 && (
                        <button className="btn-ghost" onClick={clearAll} style={{ padding: '10px 18px', fontSize: '.9rem', color: 'var(--danger)' }}>
                            🗑 Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {items.length === 0 ? (
                    <div style={{ padding: '72px 28px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                        <p style={{ fontWeight: 600, marginBottom: '8px' }}>No history yet</p>
                        <p className="text-muted text-small" style={{ marginBottom: '24px' }}>Run your first analysis to see it here.</p>
                        <button className="btn-primary" onClick={() => navigate('/analyze')}>Start First Scan</button>
                    </div>
                ) : (
                    items.map((item, i) => (
                        <div key={i} className="history-row">
                            {/* Left: icon + info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden', flex: 1 }}>
                                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                    📄
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '500px' }}>
                                        {item.jdSnippet || 'Job Description'}
                                    </p>
                                    <p className="text-muted text-small">{item.date}</p>
                                </div>
                            </div>

                            {/* Right: score badges + actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: getColor(item.overallScore) }}>
                                        {item.overallScore}
                                    </span>
                                    <span className="text-muted text-small" style={{ display: 'block', lineHeight: 1 }}>/100</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className={`badge ${item.overallScore >= 80 ? 'badge-success' : item.overallScore >= 60 ? 'badge-primary' : 'badge-danger'}`}>
                                        {item.overallScore >= 80 ? '✦ Strong' : item.overallScore >= 60 ? '◈ Fair' : '✗ Weak'}
                                    </span>
                                    <button
                                        className="btn-ghost"
                                        onClick={() => deleteOne(i)}
                                        style={{ padding: '4px 10px', fontSize: '.8rem', color: 'var(--danger)' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
