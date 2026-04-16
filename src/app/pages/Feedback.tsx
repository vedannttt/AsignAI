import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, ThumbsUp, Lightbulb, Target } from 'lucide-react';

interface FeedbackProps {
  initialStudentName?: string;
}

export function Feedback({ initialStudentName = "" }: FeedbackProps) {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [score, setScore] = useState('');
  const [assignment, setAssignment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'teacher' };

  const [studentFeedbacks, setStudentFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (initialStudentName) {
      setStudentName(initialStudentName);
    }
  }, [initialStudentName]);

  useEffect(() => {
     if (user.role === 'student') {
        const raw = localStorage.getItem('student_feedbacks');
        if (raw) setStudentFeedbacks(JSON.parse(raw));
     }
  }, [user.role]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const res = await fetch("http://localhost:8000/generate-feedback", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ student_name: studentName, score, assignment_text: assignment })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGeneratedResult(data);
    } catch(e) {
      alert("Failed to generate AI feedback.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToStudent = () => {
     if (!generatedResult) return;
     const existing = localStorage.getItem("student_feedbacks");
     const arr = existing ? JSON.parse(existing) : [];
     arr.unshift({
        studentName,
        score,
        date: new Date().toLocaleDateString(),
        ...generatedResult
     });
     localStorage.setItem("student_feedbacks", JSON.stringify(arr));
     alert("Feedback successfully sent to student dashboard!");
  };

  if (user.role === 'student') {
     return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Feedback</h1>
            <p className="text-gray-600">Review feedback sent by your teachers</p>
          </div>
          {studentFeedbacks.length === 0 ? (
             <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                You have no feedback yet.
             </div>
          ) : (
             <div className="space-y-6">
                {studentFeedbacks.map((fb, idx) => (
                   <div key={idx} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-semibold text-gray-900">Score: {fb.score}/100</h2>
                         <span className="text-sm text-gray-500">{fb.date}</span>
                      </div>
                      <p className="text-gray-800 bg-purple-50 p-4 rounded-xl mb-4 border border-purple-100">
                         <strong>Overall:</strong> {fb.overall}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><ThumbsUp className="w-4 h-4"/> Strengths</h3>
                            <ul className="text-sm text-green-800 list-disc pl-4 space-y-1">
                               {fb.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                         </div>
                         <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> Improvements</h3>
                            <ul className="text-sm text-orange-800 list-disc pl-4 space-y-1">
                               {fb.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                         </div>
                         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Recommendations</h3>
                            <ul className="text-sm text-blue-800 list-disc pl-4 space-y-1">
                               {fb.recommendations.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
     );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Feedback Generator
        </h1>
        <p className="text-gray-600">
          Generate personalized and constructive feedback for students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Assignment Details
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Score
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g., 85"
                min="0"
                max="100"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Text
              </label>
              <textarea
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="Paste the student's assignment or key observations..."
                rows={10}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!assignment || !studentName || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Feedback
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Generated Feedback
          </h2>

          {!generatedResult ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Fill in the details and generate personalized feedback
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Comment */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-purple-900 mb-1">
                      Overall Assessment
                     </h3>
                     <p className="text-sm text-purple-800 leading-relaxed">
                        {generatedResult.overall}
                     </p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Strengths</h3>
                    <ul className="text-sm text-green-800 space-y-2">
                      {generatedResult.strengths.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Areas for Improvement
                    </h3>
                    <ul className="text-sm text-orange-800 space-y-2">
                      {generatedResult.improvements.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Recommendations
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                      {generatedResult.recommendations.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendToStudent}
                className="w-full border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50 py-3 rounded-xl font-semibold flex items-center justify-center transition-colors"
               >
                 Send to Student Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
