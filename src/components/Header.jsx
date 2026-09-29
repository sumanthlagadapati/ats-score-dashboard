import { useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '68px' }}>
                {/* Search & Actions */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            style={{ padding: '8px 12px 8px 36px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--color-secondary-100)', fontSize: '0.85rem' }}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/analyze')}
                        style={{ padding: '8px 20px', fontSize: '.9rem' }}
                    >
                        + New Scan
                    </button>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-secondary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
}
