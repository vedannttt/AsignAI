import { useState } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, Users, BookOpen, BrainCircuit } from 'lucide-react';

const mockInsights = [
  { topic: 'Software testing and quality assurance (STQA)', failed: 65, passed: 35, severity: 'high', suggestion: 'Schedule a dedicated revision session on boundary value analysis.' },
  { topic: 'Probabilistic Graphical Model (PGM)', failed: 45, passed: 55, severity: 'medium', suggestion: 'Provide additional practice worksheets focusing on Bayesian networks.' },
  { topic: 'Cloud Computing (CC)', failed: 25, passed: 75, severity: 'low', suggestion: 'Class grasp on cloud architecture is solid.' },
  { topic: 'Startup planing development (MDM)', failed: 15, passed: 85, severity: 'low', suggestion: 'Performance on business models is exceptionally high.' },
  { topic: 'Software Computing (SC)', failed: 55, passed: 45, severity: 'high', suggestion: 'Review heuristic Search Algorithms urgently.' }
];

export function ClassInsights() {
  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto dark:text-gray-200">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Class Insights</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-driven macro view of overall class performance and learning gaps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400"><TrendingDown className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Critical Struggle Area</p>
            <h3 className="text-xl font-bold dark:text-white">STQA</h3>
            <p className="text-xs text-red-500 mt-1">-15% since last week</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400"><TrendingUp className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Strongest Area</p>
            <h3 className="text-xl font-bold dark:text-white">MDM</h3>
            <p className="text-xs text-green-500 mt-1">+8% since last week</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Participation</p>
            <h3 className="text-xl font-bold dark:text-white">92%</h3>
            <p className="text-xs text-indigo-500 mt-1">High engagement recorded</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <BrainCircuit className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold dark:text-white">AI Diagnostic Report</h2>
        </div>

        <div className="space-y-6">
          {mockInsights.map((insight, idx) => (
             <div key={idx} className="p-4 border rounded-xl border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     {insight.severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                     {insight.severity === 'medium' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                     {insight.severity === 'low' && <BookOpen className="w-5 h-5 text-green-500" />}
                     <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{insight.topic}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${insight.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {insight.severity} Priority
                  </span>
               </div>
               
               <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                     <span className="text-red-500 font-medium">{insight.failed}% Struggling</span>
                     <span className="text-green-500 font-medium">{insight.passed}% Mastered</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-green-100 flex overflow-hidden">
                     <div className="bg-red-500 h-full transition-all" style={{width: `${insight.failed}%`}}></div>
                     <div className="bg-green-500 h-full transition-all" style={{width: `${insight.passed}%`}}></div>
                  </div>
               </div>

               <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex-shrink-0 flex justify-center items-center mt-0.5">
                     <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold text-purple-700 dark:text-purple-400">AI Suggestion: </span>{insight.suggestion}</p>
               </div>
             </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold dark:text-white">A.I. Smart-Grouping (Study Pods)</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Based on recent submission cluster analysis, the AI has grouped students struggling with similar concepts into recommended study pods.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-5 bg-indigo-50/50 dark:bg-indigo-900/20">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Group A - CC Overlap</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">Students exhibiting high failure rates specifically in <span className="font-bold">Cloud Computing (CC)</span> architecture components.</p>
              <div className="flex flex-wrap gap-2">
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Alex M.</span>
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Sarah J.</span>
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">David K.</span>
              </div>
           </div>
           
           <div className="border border-pink-100 dark:border-pink-900/50 rounded-xl p-5 bg-pink-50/50 dark:bg-pink-900/20">
              <h3 className="font-semibold text-pink-900 dark:text-pink-200 mb-2">Group B - PGM Overlap</h3>
              <p className="text-sm text-pink-700 dark:text-pink-300 mb-4">Students exhibiting high failure rates specifically in <span className="font-bold">Probabilistic Graphical Model (PGM)</span> evaluations.</p>
              <div className="flex flex-wrap gap-2">
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Michael T.</span>
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Emma W.</span>
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Chris L.</span>
                 <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-full text-xs font-medium dark:text-gray-200 shadow-sm">Jessica R.</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Temporary inline sparkes icon override
function Sparkles(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
