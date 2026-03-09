import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingOverlay from './components/LoadingOverlay';
import DashboardResults from './components/DashboardResults';

// ─── Transformation helpers ───────────────────────────────────────────────────

const WEAK_TO_STRONG = {
  'worked on': 'Engineered',
  'helped': 'Spearheaded',
  'assisted': 'Co-led',
  'supported': 'Enabled',
  'did': 'Executed',
  'made': 'Developed',
  'was responsible for': 'Owned',
  'responsible for': 'Owned',
  'handled': 'Managed',
  'dealt with': 'Resolved',
  'used': 'Leveraged',
  'utilized': 'Leveraged',
  'involved in': 'Contributed directly to',
  'participated in': 'Drove',
  'helped to': 'Led',
  'helped with': 'Accelerated',
};

const POWER_VERBS = [
  'Architected', 'Engineered', 'Orchestrated', 'Spearheaded', 'Designed',
  'Deployed', 'Automated', 'Optimized', 'Integrated', 'Implemented',
  'Established', 'Built', 'Developed', 'Delivered', 'Reduced',
  'Increased', 'Accelerated', 'Streamlined', 'Migrated', 'Secured',
];

/**
 * Strengthens a single bullet point:
 *  - Replaces weak verbs with power verbs
 *  - Adds quantification language if no numbers present
 *  - Injects relevant missing keyword if applicable
 */
function strengthenBullet(bullet, missingKw, idx) {
  let improved = bullet.replace(/^[•\-\*]\s*/, '').trim();

  // Replace weak openers
  for (const [weak, strong] of Object.entries(WEAK_TO_STRONG)) {
    const re = new RegExp(`^${weak}\\b`, 'i');
    if (re.test(improved)) {
      improved = improved.replace(re, strong);
      break;
    }
  }

  // If no power verb at the start already, prepend one
  const firstWord = improved.split(/\s+/)[0].replace(/[,;]/, '');
  const alreadyStrong = POWER_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase());
  if (!alreadyStrong) {
    const verb = POWER_VERBS[idx % POWER_VERBS.length];
    // Only prepend if the bullet doesn't already start with a capital action verb
    if (!/^[A-Z][a-z]+ed|ing\b/.test(improved)) {
      improved = `${verb} ${improved.charAt(0).toLowerCase()}${improved.slice(1)}`;
    }
  }

  // Add impact quantification hint if no numbers exist
  if (!/\d/.test(improved) && !improved.toLowerCase().includes('percent') && !improved.toLowerCase().includes('x faster')) {
    const impacts = [
      ', reducing operational overhead by ~20%',
      ', improving system reliability by ~30%',
      ', cutting incident resolution time by ~25%',
      ', increasing deployment frequency by ~2×',
      ', eliminating manual toil across the team',
    ];
    improved = improved.replace(/[.;,]?\s*$/, impacts[idx % impacts.length] + '.');
  }

  // Inject a missing JD keyword naturally (one per bullet, cycle through)
  if (missingKw && !improved.toLowerCase().includes(missingKw.toLowerCase())) {
    improved = improved.replace(/\.$/, ` — delivering measurable gains in ${missingKw} alignment across the platform.`);
  }

  return `• ${improved}`;
}

/**
 * Rewrites the Professional Summary to mirror the JD's language and requirements.
 */
function rewriteSummary(originalSummary, matched, missing, jd) {
  // Pull years of experience from original if present
  const yearsMatch = originalSummary.match(/(\d+\+?\s*years?)/i);
  const yearsStr = yearsMatch ? yearsMatch[1] : '8+ years';

  // Pull strongest domain signals from JD (first 400 chars — job title / key needs)
  const jdSnippet = jd.slice(0, 400).toLowerCase();
  const isDev = /develop|engineer|software|frontend|backend|fullstack/i.test(jdSnippet);
  const isOps = /devops|sre|reliability|platform|infrastructure|observability/i.test(jdSnippet);
  const isAI = /ai|ml|llm|machine learning|artificial intelligence|gen.?ai/i.test(jdSnippet);
  const isCloud = /cloud|aws|azure|gcp|kubernetes/i.test(jdSnippet);
  const isSec = /security|compliance|hipaa|fedramp|zero trust/i.test(jdSnippet);

  const domain = isAI ? 'AI/ML Engineering and Observability'
    : isOps ? 'Site Reliability and DevOps Engineering'
      : isDev ? 'Software Development and Platform Engineering'
        : isCloud ? 'Cloud Platform Engineering'
          : isSec ? 'Security and Compliance Engineering'
            : 'Engineering and Technology';

  const topMatched = matched.slice(0, 5).join(', ') || 'cloud platforms, automation, and distributed systems';
  const topMissing = missing.slice(0, 3).join(', ');

  const missingSentence = topMissing
    ? ` Currently deepening expertise in ${topMissing} to fully align with emerging architectural requirements.`
    : '';

  return `PROFESSIONAL SUMMARY
Results-driven ${domain} professional with ${yearsStr} of hands-on experience designing, scaling, and operating enterprise-grade systems in high-stakes environments. Proven track record in ${topMatched}, delivering measurable improvements in reliability, performance, and compliance. Known for translating complex technical requirements into production-ready solutions that align with organizational goals and security mandates.${missingSentence}`;
}

/**
 * Rewrites Core Competencies / Technical Skills section.
 * Re-groups keywords to mirror the JD category structure.
 */
function rewriteSkills(section, matched, missing) {
  // Keep original lines but append a new "Job-Aligned Skills" row
  const original = section.lines.join('\n').trim();
  const toAdd = missing.filter(k => !original.toLowerCase().includes(k.toLowerCase()));
  const toHighlight = matched.slice(0, 8);

  let out = `${section.name}\n${original}`;

  if (toHighlight.length > 0) {
    out += `\n\nHIGH-RELEVANCE MATCHED SKILLS (JD-Aligned)\n${toHighlight.join('  •  ')}`;
  }
  if (toAdd.length > 0) {
    out += `\n\nADDITIONAL JD-REQUIRED SKILLS (Add/Strengthen in Resume)\n${toAdd.join('  •  ')}`;
  }
  return out;
}

/**
 * Rewrites Experience section —
 * strengthens every bullet, injects missing keywords contextually.
 */
function rewriteExperience(section, missing) {
  const outputLines = [];
  let bulletIdx = 0;
  const kwQueue = [...missing]; // rotate through missing keywords

  for (const line of section.lines) {
    const trimmed = line.trim();
    // Role header lines (company | title | dates) — keep as-is
    if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      outputLines.push(line);
      continue;
    }
    // It's a bullet — strengthen it
    const kw = kwQueue[bulletIdx % (kwQueue.length || 1)] || null;
    const improved = strengthenBullet(trimmed, kw, bulletIdx);
    outputLines.push(improved);
    bulletIdx++;
  }

  return `${section.name}\n${outputLines.join('\n')}`;
}

// ─── Main Rewriter ────────────────────────────────────────────────────────────
function buildRewrittenResume(resume, matched, missing, jd) {
  const lines = resume.split('\n');

  // 1. Extract header block (name + contact, first ≤5 lines before any section)
  const SECTION_RE = /^(PROFESSIONAL SUMMARY|SUMMARY|TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|PROFESSIONAL EXPERIENCE|EXPERIENCE|EDUCATION|CERTIFICATIONS?|AWARDS?|PROJECTS?)/i;
  const headerLines = [];
  let bodyStartIdx = 0;
  for (let i = 0; i < Math.min(7, lines.length); i++) {
    if (SECTION_RE.test(lines[i].trim()) && i > 0) { bodyStartIdx = i; break; }
    headerLines.push(lines[i]);
    bodyStartIdx = i + 1;
  }

  // 2. Split body into named sections
  const sections = [];
  let current = null;
  for (let i = bodyStartIdx; i < lines.length; i++) {
    const l = lines[i];
    if (SECTION_RE.test(l.trim())) {
      if (current) sections.push(current);
      current = { name: l.trim(), lines: [] };
    } else {
      if (!current) current = { name: '__PREAMBLE__', lines: [] };
      current.lines.push(l);
    }
  }
  if (current) sections.push(current);

  // 3. Rewrite each section
  const rewritten = sections.map(s => {
    const n = s.name.toUpperCase();
    if (/SUMMARY/.test(n)) {
      return rewriteSummary(s.lines.join(' '), matched, missing, jd);
    }
    if (/COMPETENCIES|SKILLS/.test(n)) {
      return rewriteSkills(s, matched, missing);
    }
    if (/EXPERIENCE/.test(n)) {
      return rewriteExperience(s, missing);
    }
    // Education, Certifications — verbatim
    return `${s.name}\n${s.lines.join('\n')}`;
  });

  return [
    '════════════════════════════════════════════════════════',
    '  ATS-OPTIMIZED RESUME  —  Generated by ATSMatch',
    '════════════════════════════════════════════════════════',
    '',
    headerLines.join('\n').trim(),
    '',
    ...rewritten,
    '',
    '════════════════════════════════════════════════════════',
    '  NOTE: Review all additions marked above before using.',
    '════════════════════════════════════════════════════════',
  ].join('\n\n').trim();
}

// ─── Keyword Library ──────────────────────────────────────────────────────────
const KEYWORD_LIBRARY = [
  'react', 'javascript', 'typescript', 'python', 'java', 'golang', 'node', 'sql', 'nosql', 'graphql', 'rest', 'grpc', 'kafka', 'redis',
  'docker', 'kubernetes', 'terraform', 'ansible', 'helm', 'argocd', 'packer', 'cloudformation',
  'aws', 'azure', 'gcp', 'cloud', 'devops', 'devsecops', 'sre', 'reliability', 'observability', 'monitoring', 'tracing', 'logging',
  'opentelemetry', 'otel', 'prometheus', 'grafana', 'splunk', 'datadog', 'newrelic', 'dynatrace', 'elastic', 'kibana', 'jaeger', 'zipkin', 'loki',
  'jenkins', 'github', 'gitlab', 'cicd', 'pipeline', 'gitops', 'deployment', 'release',
  'llm', 'ai', 'ml', 'openai', 'langchain', 'rag', 'vector', 'inference', 'finetuning', 'agents', 'evaluation', 'drift',
  'security', 'rbac', 'iam', 'hipaa', 'compliance', 'soc2', 'fedramp', 'pii', 'oauth', 'okta', 'ldap', 'mfa',
  'agile', 'scrum', 'kanban', 'leadership', 'management', 'strategy', 'planning', 'collaboration', 'communication',
  'marklogic', 'postgresql', 'mysql', 'dynamodb', 'cassandra', 'mongodb', 's3', 'sqs', 'sns', 'lambda', 'ecs', 'eks', 'gke', 'aks',
  'performance', 'latency', 'slo', 'sla', 'mttr', 'incident', 'postmortem', 'oncall', 'capacity', 'scaling', 'autoscaling',
  'networking', 'vpn', 'expressroute', 'vnet', 'loadbalancer', 'firewall', 'bgp', 'dns', 'cdn',
  'finops', 'cost', 'optimization', 'rightsizing', 'budgeting'
];

// ─── App Component ────────────────────────────────────────────────────────────
function App() {
  const [mode, setMode] = useState('input');
  const [results, setResults] = useState(null);

  const analyzeResume = (resume, jd) => {
    setMode('loading');

    setTimeout(() => {
      const jdLower = jd.toLowerCase();
      const resumeLower = resume.toLowerCase();

      const jdKeywords = KEYWORD_LIBRARY.filter(kw => jdLower.includes(kw));
      const matched = [], missing = [];
      jdKeywords.forEach(kw =>
        (resumeLower.includes(kw) ? matched : missing).push(kw)
      );

      if (jdKeywords.length === 0) {
        matched.push('leadership', 'management', 'collaboration');
        missing.push('agile', 'strategic planning', 'budgeting');
      }

      const suggestions = missing.map(kw =>
        `Add a bullet for **${kw}**. Example: "Leveraged ${kw} to improve [Metric] by [X]% in production."`
      );

      const rewrittenResumeText = buildRewrittenResume(resume, matched, missing, jd);

      const keywordRatio = matched.length / (matched.length + missing.length || 1);
      const overall = Math.min(100, Math.floor(50 + keywordRatio * 45 + Math.random() * 5));

      setResults({
        overallScore: overall,
        keywordScore: Math.min(100, Math.floor(keywordRatio * 100)),
        formatScore: 92,
        actionScore: 88,
        impactScore: 80,
        matchedKeywords: matched,
        missingKeywords: missing,
        keywordSuggestions: suggestions.length > 0 ? suggestions : [
          'Add a bullet for **typescript**: "Migrated codebase to TypeScript, reducing runtime errors by 40%."',
          'Add a bullet for **testing**: "Achieved 90% code coverage via Jest and React Testing Library."'
        ],
        rewrittenResume: rewrittenResumeText
      });

      setMode('results');
    }, 2500);
  };

  return (
    <>
      <Header />
      <main>
        {mode === 'input' && <InputForm onAnalyze={analyzeResume} />}
        {mode === 'loading' && <LoadingOverlay />}
        {mode === 'results' && results && (
          <DashboardResults results={results} onReset={() => setMode('input')} />
        )}
      </main>
    </>
  );
}

export default App;
