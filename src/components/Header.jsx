export default function Header() {
    return (
        <header style={{
            padding: '24px 0',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '40px'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        A
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        ATS<span className="text-gradient">Match</span>
                    </h1>
                </div>
                <nav style={{ display: 'flex', gap: '20px' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-main)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>How it works</a>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'var(--text-main)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>Pricing</a>
                </nav>
            </div>
        </header>
    );
}
