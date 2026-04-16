import { useState } from 'react';
import { Users, FileText, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

const mockAssignments = [
  { id: 1, title: 'Calculus Assignment 1', authorId: 'User402', status: 'pending', rubric: 'Focus on clear step-by-step logic.' },
  { id: 2, title: 'Literature Essay Draft', authorId: 'User104', status: 'reviewed', rubric: 'Check for thesis strength and citations.' },
  { id: 3, title: 'Physics Lab Report', authorId: 'User993', status: 'pending', rubric: 'Ensure proper measurement error calculations are present.' }
];

export function PeerReviewHub() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedAsg, setSelectedAsg] = useState<any>(null);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Review submitted anonymously to the moderation queue! Once the AI verifies it meets academic integrity rules, it will be shared.');
      setIsSubmitting(false);
      setSelectedAsg(null);
    }, 1500);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto dark:text-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
          <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Peer Review Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Anonymously review peer assignments based on professor rubrics.</p>
        </div>
      </div>

      {!selectedAsg ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'pending' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Pending Reviews</button>
            <button onClick={() => setActiveTab('completed')} className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'completed' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Completed</button>
          </div>
          <div className="p-6">
             {mockAssignments.filter(a => activeTab === 'pending' ? a.status === 'pending' : a.status === 'reviewed').map(item => (
                <div key={item.id} className="p-4 border rounded-xl border-gray-100 dark:border-gray-700 mb-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-indigo-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title} <span className="ml-2 text-xs text-gray-400 font-normal">By Anom#{item.authorId}</span></h4>
                      <p className="text-sm text-gray-500 mt-1">Rubric Goal: {item.rubric}</p>
                    </div>
                  </div>
                  {activeTab === 'pending' ? (
                     <button onClick={() => setSelectedAsg(item)} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors">Start Review</button>
                  ) : (
                     <span className="flex items-center gap-1 text-sm text-green-500"><CheckCircle className="w-4 h-4"/> Done</span>
                  )}
                </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedAsg(null)} className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4">← Back to Queue</button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Reviewing: {selectedAsg.title}</h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Professor's Rubric Note:</p>
                <p className="text-indigo-700 dark:text-indigo-300">"{selectedAsg.rubric}"</p>
              </div>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                 <p className="text-gray-400 text-sm">Document Viewer Placeholder...</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
               <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Evaluation</h2>
               
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score (out of 100)</label>
                 <input type="number" placeholder="Enter score..." value={reviewScore} onChange={e => setReviewScore(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:text-gray-200" />
               </div>

               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Constructive Feedback</label>
                 <textarea rows={6} placeholder="Provide thoughtful, academic feedback..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:text-gray-200 resize-none"></textarea>
               </div>
               
               <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 mb-6">
                 <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-700 dark:text-amber-400">All submissions are monitored by AI. Disrespectful language or unhelpful feedback will be rejected automatically.</p>
               </div>

               <button onClick={handleSubmit} disabled={isSubmitting || !reviewScore || !reviewComment} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                 {isSubmitting ? <span className="animate-pulse">Processing...</span> : <><MessageSquare className="w-4 h-4"/> Submit Review</>}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
