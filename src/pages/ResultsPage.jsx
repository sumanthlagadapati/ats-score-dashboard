import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';

export default function ResultsPage({ results, onReset }) {
    const getColor = (s) => s >= 80 ? '#4DB6AC' : s >= 60 ? '#FFA726' : '#EF5350';
    const oc = getColor(results.overallScore);

    // Recharts data for radial bars
    const radarData = [
        { name: 'Keywords', value: results.keywordScore, fill: '#4DB6AC' },
        { name: 'Format', value: results.formatScore, fill: '#3F51B5' },
        { name: 'Actions', value: results.actionScore, fill: '#7986CB' },
        { name: 'Impact', value: results.impactScore, fill: '#FFA726' },
    ];

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const margin = 48;
        let y = margin;

        // Helper: wrap text
        const addSection = (title, body) => {
            if (y > 720) { doc.addPage(); y = margin; }
            doc.setFontSize(13); doc.setFont('helvetica', 'bold');
            doc.setTextColor(63, 81, 181);
            doc.text(title, margin, y); y += 18;
            doc.setFontSize(10); doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 40);
            const lines = doc.splitTextToSize(body, W - margin * 2);
            lines.forEach(line => {
                if (y > 760) { doc.addPage(); y = margin; }
                doc.text(line, margin, y); y += 14;
            });
            y += 10;
        };

        // Header
        doc.setFillColor(63, 81, 181);
        doc.rect(0, 0, W, 80, 'F');
        doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('ATSMatch — ATS Score Report', margin, 38);
        doc.setFontSize(11); doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 58);
        y = 100;

        // Overall score
        doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(63, 81, 181);
        doc.text(`Overall Match Score: ${results.overallScore} / 100`, margin, y); y += 28;

        // Sub scores
        addSection('Sub-Scores',
            `Keyword Matching: ${results.keywordScore}/100\n` +
            `ATS Formatting:   ${results.formatScore}/100\n` +
            `Action Verbs:     ${results.actionScore}/100\n` +
            `Impact Metrics:   ${results.impactScore}/100`
        );

        addSection('Matched Keywords', results.matchedKeywords.join(', ') || 'None');
        addSection('Missing Keywords', results.missingKeywords.join(', ') || 'None');
        addSection('Improvement Tips', results.keywordSuggestions.join('\n'));

        if (results.rewrittenResume) {
            addSection('ATS-Optimized Resume', results.rewrittenResume);
        }

        // Footer
        const pages = doc.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setFontSize(9); doc.setTextColor(140, 140, 140);
            doc.text(`ATSMatch Report  |  Page ${i} of ${pages}`, margin, 828);
        }

        doc.save('ATSMatch_Report.pdf');
    };

    const handleDownloadTXT = () => {
        if (!results.rewrittenResume) return;
        const blob = new Blob([results.rewrittenResume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ATS_Optimized_Resume.txt'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px 80px' }}>

            {/* Topbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '4px' }}>Analysis Results</h2>
                    <p className="text-muted">Here's how your resume matches the job description</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: '10px 22px', fontSize: '.92rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Download PDF
                    </button>
                    <button onClick={onReset} className="btn-ghost" style={{ padding: '10px 20px', fontSize: '.9rem' }}>
                        ↩ New Scan
                    </button>
                </div>
            </div>

            {/* Top row: score donut + radial chart */}
            <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
                {/* Overall donut */}
                <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${oc}, transparent)` }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '1rem', fontWeight: 500 }}>Candidate Match Score</h3>

                    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
                        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r="72" stroke="var(--bg-dark)" strokeWidth="14" fill="none" />
                            <circle cx="90" cy="90" r="72"
                                stroke={oc}
                                strokeWidth="14" fill="none"
                                strokeDasharray={2 * Math.PI * 72}
                                strokeDashoffset={2 * Math.PI * 72 * (1 - results.overallScore / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 900, color: oc, lineHeight: 1 }}>{results.overallScore}</span>
                            <span className="text-muted text-small">/ 100</span>
                        </div>
                    </div>

                    <p style={{ marginTop: '20px', fontWeight: 600, fontSize: '1.05rem' }}>
                        {results.overallScore >= 80 ? '🟢 Excellent Match!' : results.overallScore >= 60 ? '🟡 Good Match — Some Tweaks Needed' : '🔴 Low Match — Revisit Heavily'}
                    </p>
                </div>

                {/* Radial stacked bar chart */}
                <div className="glass-panel" style={{ padding: '28px' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Score Breakdown</h3>
                    <p className="text-muted text-small" style={{ marginBottom: '16px' }}>Keyword, Format, Actions, Impact</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="95%" data={radarData} startAngle={90} endAngle={-270}>
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar minAngle={10} dataKey="value" cornerRadius={6} />
                            <Tooltip formatter={(v, n) => [`${v} / 100`, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '.85rem' }} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                        {radarData.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
                                <span className="text-small" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                                <span className="text-small" style={{ marginLeft: 'auto', fontWeight: 700 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Keyword panels */}
            <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>Keyword Analysis</h3>
                <div className="grid-2" style={{ gap: '28px' }}>
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '12px' }}>
                            ✅ Matched ({results.matchedKeywords.length})
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {results.matchedKeywords.map((kw, i) => <span key={i} className="badge badge-success">{kw}</span>)}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '12px' }}>
                            ❌ Missing ({results.missingKeywords.length})
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {results.missingKeywords.map((kw, i) => <span key={i} className="badge badge-danger">{kw}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Improvement tips */}
            {results.keywordSuggestions?.length > 0 && (
                <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>💡 How to Improve</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {results.keywordSuggestions.map((tip, i) => (
                            <div key={i} style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '8px', fontSize: '.9rem' }}>
                                <span style={{ color: 'var(--warning)', fontWeight: 700, marginRight: '8px' }}>Tip:</span>
                                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent)">$1</strong>') }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rewritten resume */}
            {results.rewrittenResume && (
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>✨ ATS-Optimized Resume</h3>
                            <p className="text-muted text-small">Your resume rewritten with JD keywords, power verbs, and impact language</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: '9px 20px', fontSize: '.88rem' }}>📄 Download PDF</button>
                            <button onClick={handleDownloadTXT} className="btn-ghost" style={{ padding: '9px 18px', fontSize: '.88rem' }}>📝 Download TXT</button>
                        </div>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />
                    <pre style={{
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        fontFamily: "'Inter', sans-serif", fontSize: '.88rem', lineHeight: 1.75,
                        color: 'var(--text-main)',
                        background: 'rgba(8,14,26,0.55)', padding: '24px', borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        maxHeight: '520px', overflowY: 'auto',
                    }}>
                        {results.rewrittenResume}
                    </pre>
                </div>
            )}
        </div>
    );
}
