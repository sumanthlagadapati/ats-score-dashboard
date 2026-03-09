export default function DashboardResults({ results, onReset }) {
    // SVG Circular progress math
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (results.overallScore / 100) * circumference;

    // Color determination based on score
    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--danger)';
    };

    const scoreColor = getScoreColor(results.overallScore);

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem' }}>Analysis Results</h2>
                <button onClick={onReset} className="btn-primary" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                    Scan Another Resume
                </button>
            </div>

            <div className="grid-2" style={{ gap: '32px' }}>
                {/* Left Column - Overall Score & Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Overall Score Card */}
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: `linear-gradient(90deg, ${scoreColor}, transparent)` }}></div>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.2rem' }}>Candidate Match Score</h3>

                        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
                            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="80" cy="80" r={radius} stroke="var(--bg-dark)" strokeWidth="12" fill="none" />
                                <circle
                                    cx="80" cy="80" r={radius}
                                    stroke={scoreColor}
                                    strokeWidth="12" fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: 'stroke-dashoffset 1.5s ease-in-out', strokeLinecap: 'round' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1, color: scoreColor }}>{results.overallScore}</span>
                                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                            </div>
                        </div>
                        <p style={{ marginTop: '24px', fontSize: '1.1rem' }}>
                            {results.overallScore >= 80 ? "Excellent Match! You are highly qualified." :
                                results.overallScore >= 60 ? "Good Match! A few tweaks could improve your chances." :
                                    "Low Match. Consider tailoring your resume heavily."}
                        </p>
                    </div>

                    {/* Sub Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <MetricCard title="Keyword Matching" score={results.keywordScore} />
                        <MetricCard title="Formatting (ATS)" score={results.formatScore} />
                        <MetricCard title="Action Verbs" score={results.actionScore} />
                        <MetricCard title="Impact Metrics" score={results.impactScore} />
                    </div>
                </div>

                {/* Right Column - Keyword Analysis Details */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Keyword Analysis</h3>

                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ color: 'var(--success)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Matched Keywords ({results.matchedKeywords.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {results.matchedKeywords.map((kw, i) => (
                                <span key={i} style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '100px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: 'var(--danger)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            Missing Keywords ({results.missingKeywords.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {results.missingKeywords.map((kw, i) => (
                                <span key={i} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '100px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--primary-hover)' }}>How to Improve</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                            Try seamlessly integrating the following missing keywords into your experience bullet points. Combine them with measurable outcomes where possible.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {results.keywordSuggestions && results.keywordSuggestions.map((suggestion, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-card)',
                                    padding: '12px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-main)'
                                }}>
                                    <span style={{
                                        color: 'var(--warning)',
                                        marginRight: '8px',
                                        fontWeight: 'bold'
                                    }}>Tip:</span>
                                    {/* Simple dangerouslySetInnerHTML alternative for bolding the keyword */}
                                    <span dangerouslySetInnerHTML={{ __html: suggestion.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent);">$1</strong>') }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Rewritten Resume Section ── */}
            {results.rewrittenResume && (
                <div className="glass-panel animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                                ✨ ATS-Optimized Resume
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Rewritten to maximise keyword coverage for this job description.
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                const blob = new Blob([results.rewrittenResume], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'ATS_Optimized_Resume.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            style={{ padding: '10px 24px', fontSize: '1rem', whiteSpace: 'nowrap' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download .txt
                        </button>
                    </div>

                    {/* Divider */}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

                    {/* Preview */}
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.9rem',
                        lineHeight: '1.8',
                        color: 'var(--text-main)',
                        background: 'rgba(15, 23, 42, 0.5)',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {results.rewrittenResume}
                    </pre>
                </div>
            )}
        </div>
    );
}

function MetricCard({ title, score }) {
    const getScoreColor = (s) => s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--danger)';
    const color = getScoreColor(score);

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: color, lineHeight: 1 }}>{score}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingBottom: '4px' }}>/100</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-dark)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px' }}></div>
            </div>
        </div>
    )
}
