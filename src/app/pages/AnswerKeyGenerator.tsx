import { useState } from 'react';
import { Key, Copy, Download, Upload, Bot, User, Send, Sparkles } from 'lucide-react';

export function AnswerKeyGenerator() {
  const [questions, setQuestions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('questions_file', file);
      } else {
        formData.append('questions_text', questions);
      }

      const response = await fetch('http://localhost:8000/answer-key', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Answer Key Generation failed');

      const data = await response.json();
      setGeneratedKey(data.answer_key);
      setGenerated(true);
    } catch (error) {
      console.error('Error generating answer key:', error);
      alert('Failed to connect to AI backend. Make sure Python FastAPI is running on port 8000.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `answer_key.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Answer Key Generator
        </h1>
        <p className="text-gray-600">
          Generate detailed answer keys with marking schemes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Assignment Questions
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paste your assignment questions
                </label>
                <label className="cursor-pointer flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        setFile(selectedFile);
                        setQuestions(`[File Added: ${selectedFile.name}]\n\nThe system will read the questions directly from this file during generation.`);
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="Paste your assignment questions here..."
                rows={16}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!questions || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  Generate Answer Key
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Generated Answer Key</h2>
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
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Paste your questions and click generate to create an answer key
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-0 h-[600px] flex">
              <textarea
                value={generatedKey}
                onChange={(e) => setGeneratedKey(e.target.value)}
                className="w-full h-full bg-transparent p-6 font-mono text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
