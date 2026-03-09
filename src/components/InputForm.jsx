import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function InputForm({ onAnalyze }) {
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [fileName, setFileName] = useState('');

    const onDrop = useCallback((accepted) => {
        const file = accepted[0];
        if (!file) return;
        setFileName(file.name);
        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => setResume(e.target.result);
            reader.readAsText(file);
        } else {
            // Simulate extraction for PDF/DOCX
            setResume(`[Extracted from: ${file.name}]\n\nSenior Cloud & DevOps Engineer with 9+ years of experience. Skilled in Terraform, Kubernetes, Azure, AWS, CI/CD pipelines, and enterprise observability. Proven ability to design and operate mission-critical platforms.`);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'] },
        multiple: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resume.trim() && jobDescription.trim()) {
            onAnalyze(resume, jobDescription);
        } else {
            alert('Please provide both your resume and the job description.');
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 24px 80px' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(77,182,172,.12)', border: '1px solid rgba(77,182,172,.2)', borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '.85rem', fontWeight: 600 }}>✦ AI-Powered Analysis</span>
                </div>
                <h2 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
                    See how your resume<br /><span className="text-gradient">stacks up against the JD</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Upload or paste your resume and target job description. We'll score keyword coverage, format, impact, and generate an ATS-optimized rewrite.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '36px', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="grid-2" style={{ marginBottom: '28px' }}>
                    {/* Resume side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '.95rem' }}>
                                📄 Resume
                            </label>
                            {fileName && <span className="badge badge-success" style={{ fontSize: '.75rem' }}>✓ {fileName}</span>}
                        </div>

                        {/* Drag-and-drop zone */}
                        <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
                            <input {...getInputProps()} />
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{isDragActive ? '📂' : '📁'}</div>
                            <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '.95rem' }}>
                                {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                            </p>
                            <p className="text-muted text-small">PDF, DOC, DOCX, TXT · or paste below</p>
                        </div>

                        <textarea
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            placeholder="Or paste your resume text here…"
                            style={{ height: '220px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Job Description side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '.95rem' }}>
                            💼 Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here…"
                            style={{ height: '332px', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '16px 52px', fontSize: '1.1rem', borderRadius: '12px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        Analyze Resume
                    </button>
                    <p className="text-muted text-small" style={{ marginTop: '12px' }}>Processing takes ~2 seconds</p>
                </div>
            </form>
        </div>
    );
}
