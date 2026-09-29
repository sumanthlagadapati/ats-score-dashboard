import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'var(--color-primary-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '1rem', color: '#fff', flexShrink: 0,
                }}>A</div>
                <span className="nav-label" style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                    ATS<span className="text-gradient">Match</span>
                </span>
            </div>

            <nav className="sidebar-nav">
                <SidebarLink to="/" icon="📊" label="Dashboard" currentPath={location.pathname} />
                <SidebarLink to="/analyze" icon="✨" label="New Analysis" currentPath={location.pathname} />
                <SidebarLink to="/history" icon="🕒" label="History" currentPath={location.pathname} />
            </nav>
            
            <div style={{ marginTop: 'auto', padding: '24px 16px' }}>
                <div className="nav-label" style={{ padding: '16px', background: 'var(--color-primary-100)', borderRadius: '12px', fontSize: '0.85rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-primary-900)', marginBottom: '8px' }}>Pro Plan</p>
                    <p style={{ color: 'var(--color-primary-500)', marginBottom: '12px' }}>12/50 scans used</p>
                    <div className="score-bar" style={{ background: '#bfdbfe', marginTop: 0 }}><div className="score-bar-fill" style={{ width: '24%', background: 'var(--color-primary-500)' }}></div></div>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ to, icon, label, currentPath }) {
    const active = currentPath === to;
    return (
        <Link to={to} className={`nav-link${active ? ' active' : ''}`}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span className="nav-label">{label}</span>
        </Link>
    );
}
