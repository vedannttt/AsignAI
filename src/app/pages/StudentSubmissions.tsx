import { useState, useEffect } from 'react';
import { File, Download, Search, CheckCircle2 } from 'lucide-react';
import { Feedback } from './Feedback';

export function StudentSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [copyDetectionResult, setCopyDetectionResult] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/assignments')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Backend returned non-array:', data);
          return;
        }
        const formatted = data.map((item: any) => ({
          title: item.name,
          studentName: item.studentName || "Student",
          uploadedAt: new Date(item.uploadedAt).toLocaleString(),
          urgency: 'high',
          dataUrl: item.url,
          status: 'on_time'
        }));
        setSubmissions(formatted);
      })
      .catch(err => console.error('Failed to fetch assignments:', err));
  }, []);

  const handleDownload = (dataUrl: string, title: string) => {
    if (!dataUrl) {
      alert("This is a dummy submission, there is no file to download.");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = title;
    a.click();
  };

  const handleView = (dataUrl?: string, title?: string) => {
    if (dataUrl) {
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
          window.open(dataUrl, '_blank');
      } else if (dataUrl.includes('data:application/pdf')) {
          const win = window.open();
          if (win) {
              win.document.write(`<title>${title}</title><iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; position:absolute;" allowfullscreen></iframe>`);
          }
      } else if (dataUrl.includes('data:image/')) {
          const win = window.open();
          if (win) {
              win.document.write(`<title>${title}</title><div style="text-align:center; padding:20px;"><img src="${dataUrl}" style="max-width:100%;"/></div>`);
          }
      } else if (dataUrl.includes('data:text/')) {
          try {
              const base64Data = dataUrl.split(',')[1];
              const textContent = decodeURIComponent(escape(atob(base64Data)));
              const win = window.open();
              if (win) {
                  win.document.write(`<title>${title}</title><div style="font-family:sans-serif; padding:20px; white-space:pre-wrap; max-width:800px; margin:auto;">${textContent}</div>`);
              }
          } catch (e) {
              handleDownload(dataUrl, title || "document");
          }
      } else {
          // Download unsupported formats like .docx
          handleDownload(dataUrl, title || "document.docx");
      }
    } else {
       const win = window.open();
       if (win) {
          win.document.write(`<title>${title}</title><div style="font-family:sans-serif; padding:40px; max-width:800px; margin:auto;"><h1>Dummy Submission: ${title}</h1><p><b>Dummy Data Mode:</b> No actual file was attached for this item by the student.</p></div>`);
       }
    }
  };

  const dummyAssignments = JSON.parse(localStorage.getItem('student_assignments') || '[]');

  const mockSubmissions = [
    ...dummyAssignments.filter((s: any) => s.uploaderRole === 'student').map((s: any) => ({
       title: s.name,
       studentName: s.studentName || 'Student',
       uploadedAt: new Date(s.uploadedAt).toLocaleString(),
       urgency: 'high',
       dataUrl: s.url || null,
       status: 'on_time'
    })),
    ...submissions.map(s => ({
       ...s,
       status: s.status ? s.status : 'on_time'
    }))
  ];

  const handleMassCopyDetection = async () => {
    setIsDetecting(true);
    setCopyDetectionResult(null);
    try {
      const payload = mockSubmissions.map(s => ({
        studentName: s.studentName,
        title: s.title,
        dataUrl: s.dataUrl
      }));
      const res = await fetch("http://localhost:8000/mass-copy-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions: payload })
      });
      if (!res.ok) throw new Error("Copy detection failed");
      const data = await res.json();
      setCopyDetectionResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend for mass copy detection.");
    } finally {
      setIsDetecting(false);
      setTimeout(() => document.getElementById('copy-detection-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const filtered = mockSubmissions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.studentName && s.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Student Submissions</h1>
          <p className="text-gray-600">Review and download assignments submitted by your students.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleMassCopyDetection}
            disabled={isDetecting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-500/30 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isDetecting ? (
               <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
               'Run Copy Detection'
            )}
          </button>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student or file..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Feedback</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                          {sub.studentName ? sub.studentName.charAt(0) : 'S'}
                        </div>
                        <span className="font-medium text-gray-900">{sub.studentName || 'Student'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{sub.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {sub.uploadedAt}
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === 'late' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                           Late Submission
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                           On Time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => { 
                         setSelectedStudent({ name: sub.studentName || 'Student', title: sub.title }); 
                         setShowFeedback(true); 
                         setTimeout(() => window.location.hash = "feedback-section", 0);
                       }} className="text-sm px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-medium transition-colors">
                          + Generate AI Feedback
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => handleView(sub.dataUrl, sub.title)}
                        className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Feedback Section embedded directly into Submissions per user request */}
      {showFeedback && (
        <div id="feedback-section" className="pt-8 mt-8 border-t border-gray-100">
          <Feedback initialStudentName={selectedStudent?.name || ""} />
        </div>
      )}

      {/* Copy Detection Results */}
      {copyDetectionResult && (
        <div id="copy-detection-section" className="pt-8 mt-8 border-t border-gray-100">
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                 <File className="w-5 h-5" />
              </div>
              Mass Copy Detection Report
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall Score Circle */}
              <div className="lg:col-span-1 p-6 bg-gradient-to-br from-gray-50 to-purple-50/30 border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Originality Score</h3>
                 <div className="relative w-40 h-40 mt-4 mb-4">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                     <circle cx="80" cy="80" r="70" stroke="#8b5cf6" strokeWidth="12" fill="none" strokeDasharray={`${((copyDetectionResult.overall_score ?? 85) / 100) * 440} 440`} className="transition-all duration-1000" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-bold text-gray-900">{copyDetectionResult.overall_score ?? 85}%</span>
                     <span className="text-xs text-gray-500">Originality</span>
                   </div>
                 </div>
                 <p className="text-sm text-purple-700 font-medium">{100 - (copyDetectionResult.overall_score ?? 85)}% matched content detected across pool</p>
              </div>

              {/* Stacked Comparative Bar Graphs */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                   <h3 className="text-base font-semibold text-gray-900 mb-6">Similarity Match Graph - Highest Risk Pairs</h3>
                   
                   <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                       {copyDetectionResult.pairs && copyDetectionResult.pairs.length > 0 ? (
                           copyDetectionResult.pairs.map((pair: any, idx: number) => {
                               const isHigh = pair.score > 70;
                               const isMed = pair.score > 30 && pair.score <= 70;
                               const colorClasses = isHigh ? "text-red-600 bg-red-50" : (isMed ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50");
                               const barColors = isHigh ? "from-red-500 to-rose-600" : (isMed ? "from-orange-400 to-orange-500" : "from-green-400 to-green-500");
                               
                               return (
                                   <div key={idx} className={`space-y-3 ${idx > 0 ? 'pt-4 border-t border-gray-50' : ''}`}>
                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                                        <div className="flex flex-col flex-1 min-w-0 pr-4">
                                           <span className="font-medium text-gray-900 truncate" title={pair.file1}>{pair.file1}</span>
                                           <span className="text-gray-500 truncate mt-0.5" title={"vs " + pair.file2}>vs {pair.file2}</span>
                                        </div>
                                        <span className={`${colorClasses} font-bold px-3 py-1 rounded-lg text-center whitespace-nowrap`}>{pair.score}% Match</span>
                                     </div>
                                     <div className="h-4 flex rounded-full overflow-hidden bg-gray-100 w-full relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                                        <div className={`absolute left-0 top-0 h-full bg-gradient-to-r ${barColors} rounded-full transition-all duration-1000`} style={{ width: `${pair.score}%` }}></div>
                                     </div>
                                     <p className="text-xs text-gray-500 italic">{pair.detail}</p>
                                   </div>
                               );
                           })
                       ) : (
                           <div className="text-sm text-gray-500 text-center py-4">No specific file overlaps detected or insufficient data.</div>
                       )}
                   </div>
                 </div>

                 {/* Detailed AI Report Block */}
                 <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                   <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Summary Analysis</h3>
                   <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                     {copyDetectionResult.analysis}
                   </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
