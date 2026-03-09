export default function LoadingOverlay() {
    return (
        <div className="container animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
        }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '32px' }}>
                {/* Outer Ring */}
                <div className="animate-spin" style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.05)',
                    borderTopColor: 'var(--primary)',
                    borderRightColor: 'var(--accent)'
                }}></div>
                {/* Inner Ring */}
                <div className="animate-spin" style={{
                    position: 'absolute', inset: '16px',
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.05)',
                    borderBottomColor: 'var(--success)',
                    borderLeftColor: 'var(--warning)',
                    animationDirection: 'reverse',
                    animationDuration: '1.5s'
                }}></div>
                {/* Icon */}
                <div className="animate-pulse-slow" style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-hover)'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
            </div>

            <h3 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Analyzing Your Resume...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Parsing sections, extracting keywords, and scoring impact.</p>
        </div>
    );
}
