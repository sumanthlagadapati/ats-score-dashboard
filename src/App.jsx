import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingOverlay from './components/LoadingOverlay';
import DashboardResults from './components/DashboardResults';

function App() {
  const [mode, setMode] = useState('input'); // 'input' | 'loading' | 'results'
  const [results, setResults] = useState(null);

  const analyzeResume = (resume, jd) => {
    setMode('loading');

    // Simulate API call and mock analysis logic
    setTimeout(() => {
      // Very basic keyword extraction logic (just for visual representation in mock)
      const jdWords = jd.toLowerCase().match(/\b(\w+)\b/g) || [];
      const resumeWords = resume.toLowerCase().match(/\b(\w+)\b/g) || [];

      // Look for some dummy tech keywords or common words larger than 4 chars
      const techKeywords = ["react", "javascript", "cloud", "azure", "aws", "python", "agile", "sql", "api", "docker", "kubernetes", "ci/cd", "management", "leadership", "design", "development"];

      const expectedKeywords = [...new Set(jdWords.filter(w => techKeywords.includes(w) || w.length > 6))].slice(0, 15);

      const matched = [];
      const missing = [];

      expectedKeywords.forEach(kw => {
        if (resumeWords.includes(kw)) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      // If none found by logic, provide some dummy data
      if (expectedKeywords.length === 0) {
        matched.push("leadership", "management", "communication");
        missing.push("agile", "strategic planning", "budgeting");
      }

      // Generate suggested bullet points for missing keywords
      const suggestions = missing.map(kw => {
        return `Add a bullet point demonstrating your experience with **${kw}**. For example: "Spearheaded [Project] utilizing ${kw} to improve [Metric] by [X]%."`;
      });

      const keywordRatio = matched.length / (matched.length + missing.length || 1);
      const overall = Math.floor(50 + (keywordRatio * 40) + (Math.random() * 10)); // realistic looking score

      setResults({
        overallScore: overall > 100 ? 100 : overall,
        keywordScore: Math.floor(keywordRatio * 100) || 65,
        formatScore: 92, // Mock formatting score
        actionScore: 85, // Mock action verb score
        impactScore: 78,  // Mock impact metric score
        matchedKeywords: matched.length > 0 ? matched : ["react", "javascript", "frontend"],
        missingKeywords: missing.length > 0 ? missing : ["typescript", "testing", "graphql"],
        keywordSuggestions: suggestions.length > 0 ? suggestions : [
          "Add a bullet point demonstrating your experience with **typescript**. For example: 'Migrated legacy codebase to typescript, reducing runtime errors by 40%.'",
          "Include your **testing** experience: 'Implemented comprehensive unit testing using Jest and React Testing Library, achieving 90% code coverage.'"
        ]
      });

      setMode('results');
    }, 2500); // 2.5 second loading anticipation
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
