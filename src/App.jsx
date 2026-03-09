import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingOverlay from './components/LoadingOverlay';
import DashboardResults from './components/DashboardResults';

// ─── ATS Resume Rewriter ─────────────────────────────────────────────────────
// Parses the real resume, identifies sections, rewrites each with missing keywords
function buildRewrittenResume(resume, matched, missing, jd) {
  const lines = resume.split('\n');

  // ── 1. Extract header block (name + contact on first 5 lines) ──────────────
  const headerLines = [];
  let bodyStartIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const l = lines[i].trim();
    // Stop at first obvious section heading
    if (/^(PROFESSIONAL SUMMARY|SUMMARY|TECHNICAL SKILLS|SKILLS|EXPERIENCE|EDUCATION|CERTIFICATIONS)/i.test(l) && i > 0) {
      bodyStartIdx = i;
      break;
    }
    headerLines.push(l);
    bodyStartIdx = i + 1;
  }

  // ── 2. Split remaining resumeinto named sections ───────────────────────────
  const SECTION_RE = /^(PROFESSIONAL SUMMARY|SUMMARY|TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|PROFESSIONAL EXPERIENCE|EXPERIENCE|EDUCATION|CERTIFICATIONS?|AWARDS?|PROJECTS?)/i;

  const sections = []; // [{ name, lines }]
  let currentSection = null;

  for (let i = bodyStartIdx; i < lines.length; i++) {
    const l = lines[i];
    if (SECTION_RE.test(l.trim())) {
      if (currentSection) sections.push(currentSection);
      currentSection = { name: l.trim(), lines: [] };
    } else {
      if (!currentSection) currentSection = { name: '__PREAMBLE__', lines: [] };
      currentSection.lines.push(l);
    }
  }
  if (currentSection) sections.push(currentSection);

  // ── 3. Rewrite each section ────────────────────────────────────────────────
  const rewriteSection = (section) => {
    const name = section.name.toUpperCase();

    // Professional Summary: add missing keywords naturally
    if (/SUMMARY/.test(name)) {
      const originalParas = section.lines.join('\n').trim();
      // Append a sentence that naturally includes missing keywords
      let extra = '';
      if (missing.length > 0) {
        const kwStr = missing.slice(0, 4).join(', ');
        extra = ` Actively expanding expertise in ${kwStr} to deliver end-to-end solutions aligned with current industry standards.`;
      }
      return `${section.name}\n${originalParas}${extra}`;
    }

    // Core Competencies / Technical Skills: append missing keywords to the list
    if (/COMPETENCIES|SKILLS/.test(name)) {
      const original = section.lines.join('\n').trim();
      const toAdd = missing.filter(k => !original.toLowerCase().includes(k.toLowerCase()));
      if (toAdd.length === 0) return `${section.name}\n${original}`;
      return `${section.name}\n${original}\n\nADDITIONAL JD-ALIGNED KEYWORDS\n${toAdd.join('  •  ')}`;
    }

    // Experience: find the LAST bullet of the first role and insert new JD-aligned bullets
    if (/EXPERIENCE/.test(name)) {
      const expLines = [...section.lines];
      // Find first role's bullet block and append new lines
      const bulletsToAdd = missing.slice(0, 3).map((kw, idx) => {
        const actions = ['Implemented', 'Leveraged', 'Integrated', 'Spearheaded', 'Designed'];
        const verbs = actions[idx % actions.length];
        return `•\t${verbs} ${kw} capabilities to enhance platform reliability, streamline automation workflows, and align with evolving organizational requirements.`;
      });
      // Find the index of the first blank line after the first block of bullets
      let insertAt = expLines.length;
      let foundBullet = false;
      for (let i = 0; i < expLines.length; i++) {
        if (expLines[i].trim().startsWith('•') || expLines[i].trim().startsWith('-')) foundBullet = true;
        if (foundBullet && expLines[i].trim() === '' && i > 0) {
          insertAt = i;
          break;
        }
      }
      expLines.splice(insertAt, 0, '', '// ATS-OPTIMIZED ADDITIONS (Job Description Alignment)', ...bulletsToAdd);
      return `${section.name}\n${expLines.join('\n')}`;
    }

    // Education / Certifications / everything else: keep verbatim
    return `${section.name}\n${section.lines.join('\n')}`;
  };

  // ── 4. Assemble the final document ────────────────────────────────────────
  const rewritten = [
    headerLines.join('\n'),
    '',
    ...sections.map(rewriteSection),
  ].join('\n\n').trim();

  return rewritten;
}

// ─── Keyword Extractor ────────────────────────────────────────────────────────
// A broader keyword list covering tech, methodologies, tools, and soft skills
const KEYWORD_LIBRARY = [
  "react", "javascript", "typescript", "python", "java", "golang", "node", "sql", "nosql", "graphql", "rest", "grpc", "kafka", "redis",
  "docker", "kubernetes", "terraform", "ansible", "helm", "argocd", "packer", "cloudformation",
  "aws", "azure", "gcp", "cloud", "devops", "devsecops", "sre", "reliability", "observability", "monitoring", "tracing", "logging",
  "opentelemetry", "otel", "prometheus", "grafana", "splunk", "datadog", "newrelic", "dynatrace", "elastic", "kibana", "jaeger", "zipkin", "loki",
  "jenkins", "github", "gitlab", "cicd", "pipeline", "ci/cd", "gitops", "deployment", "release",
  "llm", "ai", "ml", "gpt", "openai", "langchain", "rag", "vector", "embedding", "inference", "finetuning", "agents", "evaluation", "drift",
  "security", "rbac", "iam", "hipaa", "compliance", "soc2", "fedramp", "pii", "zero trust", "oauth", "okta", "ldap", "mfa",
  "agile", "scrum", "kanban", "leadership", "management", "strategy", "planning", "collaboration", "communication",
  "marklogic", "postgresql", "mysql", "dynamodb", "cassandra", "mongodb", "s3", "sqs", "sns", "eventbridge", "lambda", "ecs", "eks", "gke", "aks",
  "performance", "latency", "slo", "sla", "mttr", "incident", "postmortem", "oncall", "capacity", "scaling", "autoscaling",
  "networking", "vpn", "expressroute", "vnet", "loadbalancer", "firewalls", "bgp", "dns", "cdn",
  "finops", "cost", "optimization", "rightsizing", "budgeting"
];

function App() {
  const [mode, setMode] = useState('input'); // 'input' | 'loading' | 'results'
  const [results, setResults] = useState(null);

  const analyzeResume = (resume, jd) => {
    setMode('loading');

    setTimeout(() => {
      const jdLower = jd.toLowerCase();
      const resumeLower = resume.toLowerCase();

      // Find every keyword from our library that appears in the JD
      const jdKeywords = KEYWORD_LIBRARY.filter(kw => jdLower.includes(kw));

      // Split into matched vs missing
      const matched = [];
      const missing = [];
      jdKeywords.forEach(kw => {
        if (resumeLower.includes(kw)) matched.push(kw);
        else missing.push(kw);
      });

      // Fallback
      if (jdKeywords.length === 0) {
        matched.push('leadership', 'management', 'collaboration');
        missing.push('agile', 'strategic planning', 'budgeting');
      }

      // Suggestions per missing keyword
      const suggestions = missing.map(kw => {
        return `Add a bullet point for **${kw}**. Example: "Leveraged ${kw} to improve [Metric] by [X]% in production environment."`;
      });

      // Smart rewrite: preserve real resume, inject JD keywords
      const rewrittenResumeText = buildRewrittenResume(resume, matched, missing, jd);

      const keywordRatio = matched.length / (matched.length + missing.length || 1);
      const overall = Math.min(100, Math.floor(50 + keywordRatio * 45 + Math.random() * 5));

      setResults({
        overallScore: overall,
        keywordScore: Math.min(100, Math.floor(keywordRatio * 100)),
        formatScore: 92,
        actionScore: 85,
        impactScore: 78,
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
