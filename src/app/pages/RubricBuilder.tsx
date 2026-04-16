import { useState } from 'react';
import { Settings, Plus, Trash2, Save, Sparkles, CheckCircle } from 'lucide-react';

interface RubricItem {
  id: number;
  criterion: string;
  points: number;
  description: string;
}

export function RubricBuilder() {
  const [rubrics, setRubrics] = useState<RubricItem[]>([
    { id: 1, criterion: 'Conceptual Accuracy', points: 40, description: 'Demonstrates clear understanding of core concepts.' },
    { id: 2, criterion: 'Formatting & Grammar', points: 20, description: 'No major grammatical errors, proper formatting applied.' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    setRubrics([...rubrics, { id: Date.now(), criterion: '', points: 10, description: '' }]);
  };

  const handleRemove = (id: number) => {
    setRubrics(rubrics.filter(r => r.id !== id));
  };

  const handleChange = (id: number, field: keyof RubricItem, value: string | number) => {
    setRubrics(rubrics.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const totalPoints = rubrics.reduce((sum, r) => sum + Number(r.points), 0);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto dark:text-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">AI Rubric Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Define dynamic grading criteria to guide the AI evaluator precisely.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Grading Criteria</h2>
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${totalPoints === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Total Points: {totalPoints}/100 {totalPoints !== 100 && '(Must equal 100)'}
            </div>
         </div>

         <div className="space-y-4">
            {rubrics.map((rubric, index) => (
              <div key={rubric.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex gap-4 items-start relative group transition-all hover:border-pink-300">
                 <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Criterion Name</label>
                          <input type="text" value={rubric.criterion} onChange={e => handleChange(rubric.id, 'criterion', e.target.value)} placeholder="e.g. Critical Thinking" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 dark:bg-gray-800" />
                       </div>
                       <div className="w-24">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Points</label>
                          <input type="number" min="0" max="100" value={rubric.points} onChange={e => handleChange(rubric.id, 'points', e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 dark:bg-gray-800" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">AI Evaluation Instructions (How should AI grade this?)</label>
                       <textarea rows={2} value={rubric.description} onChange={e => handleChange(rubric.id, 'description', e.target.value)} placeholder="Explain what constitutes full marks..." className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 dark:bg-gray-800 resize-none"></textarea>
                    </div>
                 </div>
                 <button onClick={() => handleRemove(rubric.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors mt-6">
                    <Trash2 className="w-5 h-5"/>
                 </button>
              </div>
            ))}
         </div>

         <div className="mt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-6">
            <button onClick={handleAdd} className="flex items-center gap-2 text-pink-600 font-medium hover:bg-pink-50 px-4 py-2 rounded-lg transition-colors">
               <Plus className="w-4 h-4"/> Add Criterion
            </button>

            <button onClick={handleSave} disabled={isSaving || totalPoints !== 100} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
               {isSaving ? <Sparkles className="w-4 h-4 animate-pulse" /> : saved ? <CheckCircle className="w-4 h-4 text-green-500"/> : <Save className="w-4 h-4" />}
               {isSaving ? 'Syncing with AI Model...' : saved ? 'Activated' : 'Save & Activate Rubric'}
            </button>
         </div>

      </div>
    </div>
  );
}
