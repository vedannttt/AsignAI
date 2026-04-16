import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Upload } from 'lucide-react';

export function PlagiarismChecker() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  
  const [plagiarismScore, setPlagiarismScore] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);

  const handleCheck = async () => {
    setIsChecking(true);
    setChecked(false);
    
    try {
      let uploadFile = file;
      if (!uploadFile) {
         uploadFile = new File([text], "pasted_text.txt", { type: "text/plain" });
      }

      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('http://localhost:8000/plagiarism-check', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to check plagiarism");

      const data = await res.json();
      setPlagiarismScore(data.overall_plagiarism_score);
      setMatches(data.matches || []);
      setChecked(true);
    } catch (e) {
      alert("Failed to analyze text using AI.");
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Plagiarism Checker
        </h1>
        <p className="text-gray-600">
          Detect copied content and ensure originality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Text to Check
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paste the text or upload a document
                </label>
                <label className="cursor-pointer flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                         setFile(f);
                         setText(`[Content of ${f.name} read successfully]\n\nSimulated text from uploaded document for plagiarism checking...`);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                   setText(e.target.value);
                   setFile(null); // Reset file if they edit manually
                }}
                placeholder="Paste the student's assignment text here..."
                rows={16}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {text.length} characters
              </p>
            </div>

            <button
              onClick={handleCheck}
              disabled={!text || isChecking}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Check Plagiarism
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>

          {!checked ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Paste your text and click check to analyze plagiarism
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Circle */}
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={plagiarismScore > 30 ? '#ef4444' : '#10b981'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(plagiarismScore / 100) * 553} 553`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plagiarismScore}%
                    </span>
                    <span className="text-sm text-gray-500">Similarity</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      plagiarismScore > 30
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {plagiarismScore > 30 ? (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Moderate Risk</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Low Risk</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Original Content
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {100 - plagiarismScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${100 - plagiarismScore}%` }} />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Matched Content
                    </span>
                    <span className="text-sm font-semibold text-orange-600">
                      {plagiarismScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${plagiarismScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Sources */}
              {matches.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Potential Sources
                  </h3>
                  <div className="space-y-2">
                    {matches.map((match, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            <a href={match.source} target="_blank" rel="noreferrer" className="hover:underline">{match.source}</a>
                          </p>
                          <p className="text-xs text-gray-500">{match.match_percentage}% match</p>
                          <p className="text-xs text-gray-400 mt-1 italic truncate">"{match.text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
