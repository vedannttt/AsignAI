import { useState } from 'react';
import { Copy, Users, AlertCircle } from 'lucide-react';

export function CopyDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<{ similarity_score: number; analysis: string } | null>(null);

  const handleAnalyze = async () => {
    if (uploadedFiles.length < 2) {
       alert("Please upload at least 2 files to detect copies.");
       return;
    }
    setIsAnalyzing(true);
    setAnalyzed(false);

    try {
       const formData = new FormData();
       for (let i = 0; i < uploadedFiles.length; i++) {
           formData.append('files', uploadedFiles[i]);
       }

       const res = await fetch('http://localhost:8000/copy-detection', {
          method: 'POST',
          body: formData,
       });
       
       if (!res.ok) throw new Error("Failed to check copies");

       const data = await res.json();
       setAnalysisResult(data);
       setAnalyzed(true);
    } catch(e) {
       console.error(e);
       alert("Failed to run copy detection API.");
    } finally {
       setIsAnalyzing(false);
    }
  };



  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Copy Detection
        </h1>
        <p className="text-gray-600">
          Advanced similarity analysis between multiple submissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Upload Submissions
          </h2>

          <div className="space-y-4 mb-6">
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-purple-300 hover:bg-gray-50 transition-all cursor-pointer">
              <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const newFiles = Array.from(e.target.files);
                  setUploadedFiles(newFiles); // Replace totally with newest upload batch
                  setAnalyzed(false); // clear previous analysis
                  setAnalysisResult(null);
                }
              }} />
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload Multiple Assignments
              </p>
              <p className="text-xs text-gray-500">
                Select all student submissions to compare
              </p>
            </label>

            {/* Uploaded Files Preview */}
            <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Files ({uploadedFiles.length})
              </p>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-white rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <Copy className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-700 truncate flex-1">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Analyze Similarity
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Detection Results
          </h2>

          {!analyzed ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Copy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Upload submissions and click analyze to detect similarities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`rounded-xl p-4 text-center transition-colors ${analysisResult?.similarity_score && analysisResult.similarity_score > 70 ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-transparent'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto ${analysisResult?.similarity_score && analysisResult.similarity_score > 70 ? 'bg-red-500 shadow-lg shadow-red-500/40' : 'bg-gray-200'}`} />
                  <p className={`text-xs mt-3 font-semibold ${analysisResult?.similarity_score && analysisResult.similarity_score > 70 ? 'text-red-800' : 'text-gray-500'}`}>High Risk</p>
                </div>
                <div className={`rounded-xl p-4 text-center transition-colors ${analysisResult?.similarity_score && analysisResult.similarity_score > 30 && analysisResult.similarity_score <= 70 ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-transparent'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto ${analysisResult?.similarity_score && analysisResult.similarity_score > 30 && analysisResult.similarity_score <= 70 ? 'bg-orange-500 shadow-lg shadow-orange-500/40' : 'bg-gray-200'}`} />
                  <p className={`text-xs mt-3 font-semibold ${analysisResult?.similarity_score && analysisResult.similarity_score > 30 && analysisResult.similarity_score <= 70 ? 'text-orange-800' : 'text-gray-500'}`}>Medium Risk</p>
                </div>
                <div className={`rounded-xl p-4 text-center transition-colors ${analysisResult?.similarity_score && analysisResult.similarity_score <= 30 ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-transparent'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto ${analysisResult?.similarity_score && analysisResult.similarity_score <= 30 ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'bg-gray-200'}`} />
                  <p className={`text-xs mt-3 font-semibold ${analysisResult?.similarity_score && analysisResult.similarity_score <= 30 ? 'text-green-800' : 'text-gray-500'}`}>Low Risk</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-3">
                {analysisResult && (
                  <div className={`p-4 rounded-xl border ${
                    analysisResult.similarity_score > 70 ? 'bg-red-50 border-red-200' : analysisResult.similarity_score > 30 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {analysisResult.similarity_score > 70 && (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-semibold text-gray-900`}>
                            Matches found among {uploadedFiles.length} files
                          </p>
                          <p className={`text-xs ${analysisResult.similarity_score > 70 ? 'text-red-700' : 'text-gray-700'}`}>
                            {analysisResult.similarity_score}% similarity
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        analysisResult.similarity_score > 70 ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {analysisResult.similarity_score > 70 ? 'HIGH' : 'LOW'}
                      </div>
                    </div>
                    <div className="relative h-2 bg-white rounded-full overflow-hidden mb-4">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all ${analysisResult.similarity_score > 70 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${analysisResult.similarity_score}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">
                      <strong>AI Analysis:</strong> {analysisResult.analysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
