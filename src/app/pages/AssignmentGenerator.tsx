import { useState } from 'react';
import { Sparkles, Copy, Download } from 'lucide-react';

export function AssignmentGenerator() {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    questions: '5',
    type: 'theoretical',
    total_marks: 15,
  });
  const [useCustomRubric, setUseCustomRubric] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssignment, setGeneratedAssignment] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/generate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          questions_count: parseInt(formData.questions) || 5,
          question_type: formData.type,
          total_marks: useCustomRubric ? parseInt(formData.total_marks as any) || 15 : 15,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate assignment');
      
      const data = await response.json();
      setGeneratedAssignment(data.assignment);
      setGenerated(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to AI backend. Make sure Python FastAPI is running on port 8000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAssignment);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedAssignment], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.subject}_assignment.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Assignment Generator</h1>
        <p className="text-gray-600">Create custom assignments powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Assignment Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              >
                <option value="">Select a subject</option>
                <option value="Cloud Computing (CC)">Cloud Computing (CC)</option>
                <option value="Software testing and quality assurance (STQA)">Software testing and quality assurance (STQA)</option>
                <option value="Probabilistic Graphical Model (PGM)">Probabilistic Graphical Model (PGM)</option>
                <option value="Software Computing (SC)">Software Computing (SC)</option>
                <option value="Startup planing development (MDM)">Startup planing development (MDM)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Calculus, Quantum Mechanics"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, type: 'theoretical' })}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    formData.type === 'theoretical'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Theoretical
                </button>
                <button
                  onClick={() => setFormData({ ...formData, type: 'numerical' })}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    formData.type === 'numerical'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Numerical
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                      formData.difficulty === level
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={formData.questions}
                onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                min="1"
                max="20"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
               <label className="flex items-center space-x-3 cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={useCustomRubric}
                    onChange={(e) => setUseCustomRubric(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                 />
                 <span className="text-gray-800 font-medium text-sm">Enable Custom Rubric (Teacher Mode)</span>
               </label>
               {useCustomRubric && (
                  <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Total Subject Marks (e.g., ISA - 15)</label>
                     <input
                       type="number"
                       value={formData.total_marks}
                       onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                       min="1"
                       className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                     />
                  </div>
               )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!formData.subject || !formData.topic || isGenerating}
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
                  Generate Assignment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col" style={{ minHeight: '600px' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Generated Assignment</h2>
            {generated && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={handleDownload} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {!generated ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Fill in the details and click generate to create your assignment
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border border-transparent focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all flex-1 flex overflow-hidden">
              <textarea
                className="w-full flex-1 whitespace-pre-wrap font-mono text-sm text-gray-700 bg-transparent resize-none focus:outline-none leading-relaxed"
                value={generatedAssignment}
                onChange={(e) => setGeneratedAssignment(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
