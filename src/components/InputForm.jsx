import { useState, useRef } from 'react';

export default function InputForm({ onAnalyze }) {
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (evt) => setResume(evt.target.result);
            reader.readAsText(file);
        } else {
            // Since this is a frontend-only mock, we simulate parsing PDF/DOCX
            setResume(`[Text extracted from ${file.name}]\n\nExperienced professional with a strong background in software engineering, frontend architecture, and team leadership. I specialize in React, JavaScript, and building scalable cloud applications.`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resume.trim() && jobDescription.trim()) {
            onAnalyze(resume, jobDescription);
        } else {
            alert("Please enter both your resume and the job description.");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>See how your resume stacks up.</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Paste your resume text and the target job description below. Our advanced mocked algorithm will analyze keywords, formatting, and impact to give you an instant ATS match score.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
                <div className="grid-2" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontWeight: '600', color: 'var(--primary-hover)' }}>
                                1. Upload or Paste Resume
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-main)',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    border: '1px solid rgba(59, 130, 246, 0.4)'
                                }}
                            >
                                Upload File
                            </button>
                            <input
                                type="file"
                                accept=".txt,.pdf,.doc,.docx"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                        </div>
                        <textarea
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            placeholder="Upload a file or paste the plain text of your resume here..."
                            style={{ flexGrow: 1, height: '300px', resize: 'vertical' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--accent)' }}>
                            2. Paste Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the target job description here..."
                            style={{ height: '300px', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '16px 48px', fontSize: '1.2rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Analyze Resume
                    </button>
                </div>
            </form>
        </div>
    );
}
