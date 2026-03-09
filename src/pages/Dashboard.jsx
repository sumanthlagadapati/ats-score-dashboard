import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const history = JSON.parse(localStorage.getItem('ats_history') || '[]');

    const totalScans = history.length;
    const avgScore = totalScans
        ? Math.round(history.reduce((s, r) => s + r.overallScore, 0) / totalScans)
        : 0;
    const bestScore = totalScans ? Math.max(...history.map(r => r.overallScore)) : 0;
    const recentItems = [...history].reverse().slice(0, 5);

    const getColor = (s) => s >= 80 ? 'var(--accent)' : s >= 60 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div className="container animate-fade-in" style={{ padding: '48px 24px 80px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>Dashboard</h2>
                    <p className="text-muted">Your hiring intelligence command centre</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ padding: '12px 28px' }}>
                    + New Analysis
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid-3" style={{ marginBottom: '40px' }}>
                <StatCard icon="🔍" label="Total Scans" value={totalScans} color="var(--primary-light)" />
                <StatCard icon="📊" label="Average Score" value={avgScore ? `${avgScore} / 100` : '—'} color="var(--accent)" />
                <StatCard icon="🏆" label="Best Score" value={bestScore ? `${bestScore} / 100` : '—'} color="var(--warning)" />
            </div>

            {/* Recent activity */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Recent Analyses</h3>
                    {totalScans > 0 && (
                        <button className="btn-ghost" onClick={() => navigate('/history')} style={{ padding: '6px 16px', fontSize: '.85rem' }}>
                            View all →
                        </button>
                    )}
                </div>

                {recentItems.length === 0 ? (
                    <div style={{ padding: '64px 28px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
                        <p style={{ fontWeight: 600, marginBottom: '8px' }}>No analyses yet</p>
                        <p className="text-muted text-small" style={{ marginBottom: '24px' }}>Upload a resume and job description to get started.</p>
                        <button className="btn-primary" onClick={() => navigate('/analyze')}>Start First Scan</button>
                    </div>
                ) : (
                    recentItems.map((item, i) => (
                        <div key={i} className="history-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📄</div>
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                                        {item.jdSnippet || 'Job Description'}
                                    </p>
                                    <p className="text-muted text-small">{item.date}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: getColor(item.overallScore) }}>
                                    {item.overallScore}
                                </span>
                                <button
                                    className="btn-ghost"
                                    onClick={() => navigate('/analyze')}
                                    style={{ padding: '6px 14px', fontSize: '.82rem' }}
                                >
                                    Rescan
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick guide */}
            <div className="glass-panel" style={{ marginTop: '32px', padding: '32px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>How it works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                    {[
                        { step: '01', icon: '📤', title: 'Upload', desc: 'Drag & drop your resume or paste text' },
                        { step: '02', icon: '💼', title: 'Add JD', desc: 'Paste the target job description' },
                        { step: '03', icon: '🤖', title: 'Analyze', desc: 'Our engine scores and rewrites your resume' },
                        { step: '04', icon: '📥', title: 'Download', desc: 'Export a polished PDF or TXT report' },
                    ].map((s) => (
                        <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ background: 'rgba(63,81,181,.15)', border: '1px solid rgba(63,81,181,.25)', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '.8rem', color: 'var(--primary-light)', flexShrink: 0 }}>
                                {s.step}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{s.icon} {s.title}</p>
                                <p className="text-muted text-small">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}
