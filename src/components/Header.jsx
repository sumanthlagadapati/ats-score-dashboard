import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(8,14,26,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '1.1rem', color: '#fff', flexShrink: 0,
                    }}>A</div>
                    <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
                        ATS<span className="text-gradient">Match</span>
                    </span>
                </Link>

                {/* Nav */}
                <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <NavLink to="/" label="Dashboard" />
                    <NavLink to="/analyze" label="Analyze" />
                    <NavLink to="/history" label="History" />
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/analyze')}
                        style={{ marginLeft: '12px', padding: '8px 20px', fontSize: '.9rem' }}
                    >
                        + New Scan
                    </button>
                </nav>
            </div>
        </header>
    );
}

function NavLink({ to, label }) {
    const active = window.location.pathname === to;
    return (
        <Link to={to} className={`nav-link${active ? ' active' : ''}`}>
            {label}
        </Link>
    );
}
