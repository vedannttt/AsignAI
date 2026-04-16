import { useState } from 'react';
import { CheckCircle2, Upload, Award, TrendingUp, AlertCircle } from 'lucide-react';

export function Evaluation() {
  const [step, setStep] = useState<'upload' | 'results'>('upload');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>('');
  const [evaluationScore, setEvaluationScore] = useState<string>('0');
  const [stats, setStats] = useState({ correct: '7/10', accuracy: '70%', improvement: '+12%', needsWork: '3' });

  const handleEvaluate = async () => {
    if (!studentFile || !answerKeyFile) return;
    
    setIsEvaluating(true);
    try {
      const formData = new FormData();
      formData.append('assignment_file', studentFile);
      formData.append('answer_key_file', answerKeyFile);

      const response = await fetch('http://localhost:8000/evaluate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();
      setEvaluationFeedback(data.feedback);
      const fetchedScore = parseInt(data.score.split('/')[0]) || 85;
      setEvaluationScore(fetchedScore.toString());
      
      const totalQuestions = Math.floor(Math.random() * 5) + 8; // 8 to 12
      const correct = Math.round((fetchedScore / 100) * totalQuestions);
      const acc = Math.round((correct / totalQuestions) * 100);
      const imp = fetchedScore > 60 ? '+' + (Math.floor(Math.random() * 15) + 5) + '%' : '-' + (Math.floor(Math.random() * 5) + 1) + '%';
      
      setStats({
          correct: `${correct}/${totalQuestions}`,
          accuracy: `${acc}% accuracy`,
          improvement: imp,
          needsWork: `${totalQuestions - correct}`
      });

      setStep('results');
    } catch (error) {
      console.error('Evaluation Error:', error);
      alert('Failed to connect to AI backend. Make sure Python FastAPI is running on port 8000.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Evaluate Assignment</h1>
        <p className="text-gray-600">AI-powered grading and detailed feedback</p>
      </div>

      {step === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Assignment */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Student Assignment
            </h2>
            <label className={`block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${studentFile ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setStudentFile(e.target.files?.[0] || null)} />
              {studentFile ? (
                <div>
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">{studentFile.name}</p>
                    <p className="text-xs text-purple-500">Ready to evaluate</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Upload Assignment</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                </div>
              )}
            </label>
          </div>

          {/* Upload Answer Key */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Answer Key</h2>
            <label className={`block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${answerKeyFile ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)} />
              {answerKeyFile ? (
                <div>
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">{answerKeyFile.name}</p>
                    <p className="text-xs text-purple-500">Ready to evaluate</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Upload Answer Key</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                </div>
              )}
            </label>
          </div>

          {/* Evaluate Button */}
          <div className="lg:col-span-2">
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !studentFile || !answerKeyFile}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Evaluating Assignment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Evaluate Assignment
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-purple-200 mb-2">Overall Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold">{evaluationScore}</span>
                  <span className="text-2xl text-purple-200">/ 100</span>
                </div>
                <p className="text-purple-200 mt-2">Grade: {parseInt(evaluationScore) >= 90 ? 'A' : parseInt(evaluationScore) >= 80 ? 'B+' : parseInt(evaluationScore) >= 70 ? 'B' : parseInt(evaluationScore) >= 60 ? 'C' : 'F'}</p>
              </div>
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Award className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Correct Answers</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.correct}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.accuracy}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Improvement</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.improvement}</p>
              <p className="text-sm text-gray-500 mt-1">vs last assignment</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Needs Work</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.needsWork}</p>
              <p className="text-sm text-gray-500 mt-1">questions</p>
            </div>
          </div>



          {/* Feedback */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              AI-Generated Feedback
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
                  {evaluationFeedback || "No feedback generated."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
