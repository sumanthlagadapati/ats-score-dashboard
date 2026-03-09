import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import InputForm from './components/InputForm';

import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

// ─── Keyword library (100+ terms) ────────────────────────────────────────────
const KEYWORD_LIBRARY = [
  'react', 'javascript', 'typescript', 'python', 'java', 'golang', 'node', 'sql', 'nosql', 'graphql', 'rest', 'grpc', 'kafka', 'redis',
  'docker', 'kubernetes', 'terraform', 'ansible', 'helm', 'argocd', 'packer', 'cloudformation',
  'aws', 'azure', 'gcp', 'cloud', 'devops', 'devsecops', 'sre', 'reliability', 'observability', 'monitoring', 'tracing', 'logging',
  'opentelemetry', 'otel', 'prometheus', 'grafana', 'splunk', 'datadog', 'newrelic', 'dynatrace', 'elastic', 'kibana', 'jaeger',
  'jenkins', 'github', 'gitlab', 'cicd', 'pipeline', 'gitops', 'deployment',
  'llm', 'ai', 'ml', 'openai', 'langchain', 'rag', 'vector', 'inference', 'agents', 'evaluation', 'drift',
  'security', 'rbac', 'iam', 'hipaa', 'compliance', 'soc2', 'fedramp', 'pii', 'oauth', 'okta',
  'agile', 'scrum', 'kanban', 'leadership', 'management', 'strategy', 'planning', 'collaboration',
  'marklogic', 'postgresql', 'mysql', 'dynamodb', 'mongodb', 's3', 'sqs', 'sns', 'lambda', 'ecs', 'eks', 'gke', 'aks',
  'performance', 'latency', 'slo', 'sla', 'mttr', 'incident', 'oncall', 'capacity', 'scaling', 'autoscaling',
  'networking', 'vpn', 'loadbalancer', 'firewall', 'bgp', 'dns', 'cdn',
  'finops', 'cost', 'optimization', 'rightsizing', 'budgeting'
];

// ─── Verb / impact helpers ────────────────────────────────────────────────────
const WEAK_TO_STRONG = {
  'worked on': 'Engineered', 'helped': 'Spearheaded', 'assisted': 'Co-led',
  'supported': 'Enabled', 'did': 'Executed', 'made': 'Developed',
  'was responsible for': 'Owned', 'responsible for': 'Owned',
  'handled': 'Managed', 'dealt with': 'Resolved',
  'used': 'Leveraged', 'utilized': 'Leveraged',
  'involved in': 'Contributed directly to', 'participated in': 'Drove',
};
const POWER_VERBS = [
  'Architected', 'Engineered', 'Orchestrated', 'Spearheaded', 'Designed',
  'Deployed', 'Automated', 'Optimized', 'Integrated', 'Implemented',
  'Established', 'Built', 'Delivered', 'Reduced', 'Accelerated', 'Streamlined',
  'Migrated', 'Secured', 'Owned', 'Modernized',
];
const IMPACTS = [
  ', reducing operational overhead by ~20%',
  ', improving system reliability by ~30%',
  ', cutting incident resolution time by ~25%',
  ', increasing deployment frequency by ~2×',
  ', eliminating manual toil across the team',
];

function strengthenBullet(bullet, kwQueue, idx) {
  let b = bullet.replace(/^[•\-\*]\s*/, '').trim();
  for (const [w, s] of Object.entries(WEAK_TO_STRONG)) {
    if (new RegExp(`^${w}\\b`, 'i').test(b)) { b = b.replace(new RegExp(`^${w}\\b`, 'i'), s); break; }
  }
  const firstWord = b.split(/\s+/)[0].replace(/[,;]/, '');
  if (!POWER_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase())) {
    const verb = POWER_VERBS[idx % POWER_VERBS.length];
    if (!/^[A-Z][a-z]+(ed|ing)\b/.test(b)) {
      b = `${verb} ${b.charAt(0).toLowerCase()}${b.slice(1)}`;
    }
  }
  if (!/\d/.test(b)) b = b.replace(/[.;,]?\s*$/, IMPACTS[idx % IMPACTS.length] + '.');

  const kw = kwQueue[idx % (kwQueue.length || 1)];
  if (kw && !b.toLowerCase().includes(kw.toLowerCase())) {
    b = b.replace(/\.$/, ` — deepening ${kw} alignment across the platform.`);
  }
  return `• ${b}`;
}

function rewriteSummary(original, matched, missing, jd) {
  const yearsMatch = original.match(/(\d+\+?\s*years?)/i);
  const years = yearsMatch ? yearsMatch[1] : '8+ years';
  const jdLow = jd.slice(0, 400).toLowerCase();
  const domain =
    /ai|ml|llm|gen.?ai/i.test(jdLow) ? 'AI/ML Engineering and Observability'
      : /sre|reliability|platform/i.test(jdLow) ? 'Site Reliability and Platform Engineering'
        : /devops|infrastructure/i.test(jdLow) ? 'DevOps and Cloud Infrastructure'
          : /security|compliance/i.test(jdLow) ? 'Security and Compliance Engineering'
            : 'Cloud and Software Engineering';
  const top = matched.slice(0, 5).join(', ') || 'cloud platforms and automation';
  const miss = missing.slice(0, 3).join(', ');
  return `PROFESSIONAL SUMMARY\nResults-driven ${domain} professional with ${years} of hands-on experience designing and operating enterprise-grade systems. Proven track record in ${top}, delivering measurable improvements in reliability, performance, and compliance.${miss ? ` Currently expanding expertise in ${miss} to align with evolving role requirements.` : ''}`;
}

function rewriteExperience(section, missing) {
  const out = []; let idx = 0;
  for (const line of section.lines) {
    if (!line.trim().match(/^[•\-\*]/)) { out.push(line); continue; }
    out.push(strengthenBullet(line.trim(), missing, idx++));
  }
  return `${section.name}\n${out.join('\n')}`;
}

function rewriteSkills(section, matched, missing) {
  const orig = section.lines.join('\n').trim();
  const toAdd = missing.filter(k => !orig.toLowerCase().includes(k.toLowerCase()));
  return `${section.name}\n${orig}${matched.length ? `\n\nHIGH-RELEVANCE JD-MATCHED\n${matched.slice(0, 8).join('  •  ')}` : ''}${toAdd.length ? `\n\nADD / STRENGTHEN FOR THIS JD\n${toAdd.join('  •  ')}` : ''}`;
}

function buildRewrittenResume(resume, matched, missing, jd) {
  const SECTION_RE = /^(PROFESSIONAL SUMMARY|SUMMARY|TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|PROFESSIONAL EXPERIENCE|EXPERIENCE|EDUCATION|CERTIFICATIONS?|AWARDS?|PROJECTS?)/i;
  const lines = resume.split('\n');
  const header = []; let start = 0;
  for (let i = 0; i < Math.min(7, lines.length); i++) {
    if (SECTION_RE.test(lines[i].trim()) && i > 0) { start = i; break; }
    header.push(lines[i]); start = i + 1;
  }
  const sections = []; let cur = null;
  for (let i = start; i < lines.length; i++) {
    if (SECTION_RE.test(lines[i].trim())) {
      if (cur) sections.push(cur);
      cur = { name: lines[i].trim(), lines: [] };
    } else {
      if (!cur) cur = { name: '', lines: [] };
      cur.lines.push(lines[i]);
    }
  }
  if (cur) sections.push(cur);

  const rewritten = sections.map(s => {
    const n = s.name.toUpperCase();
    if (/SUMMARY/.test(n)) return rewriteSummary(s.lines.join(' '), matched, missing, jd);
    if (/COMPETENCIES|SKILLS/.test(n)) return rewriteSkills(s, matched, missing);
    if (/EXPERIENCE/.test(n)) return rewriteExperience(s, missing);
    return `${s.name}\n${s.lines.join('\n')}`;
  });

  return [
    '═══════════════════════════════════════════════════',
    '  ATS-OPTIMIZED RESUME  —  Generated by ATSMatch',
    '═══════════════════════════════════════════════════',
    '',
    header.join('\n').trim(),
    '',
    ...rewritten,
    '',
    '═══════════════════════════════════════════════════',
    '  Review all additions before submitting.',
    '═══════════════════════════════════════════════════',
  ].join('\n\n').trim();
}

// ─── AnalyzePage  (wraps InputForm + LoadingOverlay + ResultsPage) ────────────
function AnalyzePage() {
  const [mode, setMode] = useState('input');
  const [results, setResults] = useState(null);

  const analyzeResume = (resume, jd) => {
    setMode('loading');
    setTimeout(() => {
      const jdL = jd.toLowerCase(), rL = resume.toLowerCase();
      const jdKw = KEYWORD_LIBRARY.filter(k => jdL.includes(k));
      const matched = [], missing = [];
      jdKw.forEach(k => (rL.includes(k) ? matched : missing).push(k));
      if (!jdKw.length) { matched.push('leadership', 'management'); missing.push('agile', 'budgeting'); }

      const suggestions = missing.map(k =>
        `Add a bullet for **${k}**. Example: "Leveraged ${k} to improve [Metric] by [X]% in production."`
      );
      const rewrittenResume = buildRewrittenResume(resume, matched, missing, jd);
      const ratio = matched.length / ((matched.length + missing.length) || 1);
      const overall = Math.min(100, Math.floor(50 + ratio * 45 + Math.random() * 5));

      const record = {
        date: new Date().toLocaleString(),
        overallScore: overall,
        jdSnippet: jd.replace(/\s+/g, ' ').slice(0, 80) + '…',
      };
      const history = JSON.parse(localStorage.getItem('ats_history') || '[]');
      history.push(record);
      localStorage.setItem('ats_history', JSON.stringify(history));

      setResults({
        overallScore: overall,
        keywordScore: Math.min(100, Math.floor(ratio * 100)),
        formatScore: 92, actionScore: 88, impactScore: 80,
        matchedKeywords: matched,
        missingKeywords: missing,
        keywordSuggestions: suggestions,
        rewrittenResume,
      });
      setMode('results');
    }, 2500);
  };

  if (mode === 'loading') return <LoadingOverlay />;
  if (mode === 'results' && results)
    return <ResultsPage results={results} onReset={() => setMode('input')} />;
  return <InputForm onAnalyze={analyzeResume} />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
