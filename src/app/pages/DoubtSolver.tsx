import { useState } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'student' | 'agent';
  text: string;
}

export function DoubtSolver() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'agent',
      text: "Hello! I am your AI Teacher Agent. If you have any doubts about your assignments or study topics, feel free to ask. I'm here to guide you step-by-step!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Optimistic UI update
    const newMessages = [...messages, { role: 'student' as const, text: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
        const response = await fetch('http://localhost:8000/solve-doubt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                // Do not send the initial greeting as part of history to save tokens
                history: newMessages.slice(1, -1)
            })
        });
        
        if (!response.ok) {
            throw new Error('API Error');
        }
        
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'agent', text: data.reply }]);
    } catch (e) {
        // Fallback or error state
        setMessages(prev => [...prev, { role: 'agent', text: "I'm sorry, my systems are currently taking a quick break. Feel free to ask again in a moment, or try framing the math/physics question slightly differently." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Doubt Solver Bot</h1>
        <p className="text-gray-600">Get instant AI guidance for your academic questions</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-purple-50/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                 <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                 <h2 className="font-semibold text-gray-900 leading-tight">AI Teacher Agent</h2>
                 <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                 </p>
              </div>
           </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
           {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'student' ? 'ml-auto flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                       msg.role === 'student' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-600 text-white'
                   }`}>
                       {msg.role === 'student' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                   </div>
                   <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                       msg.role === 'student' 
                           ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200' 
                           : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                   }`}>
                       {msg.text}
                   </div>
               </div>
           ))}
           {isTyping && (
               <div className="flex gap-4 max-w-[85%]">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-purple-600 text-white">
                       <Sparkles className="w-4 h-4" />
                   </div>
                   <div className="p-4 rounded-2xl bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm flex items-center gap-1">
                       <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                       <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                   </div>
               </div>
           )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100">
           <div className="flex items-end gap-3 relative max-w-3xl mx-auto">
               <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSend();
                     }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none max-h-32 text-gray-700"
                  placeholder="Ask a question about your assignment..."
                  rows={1}
               />
               <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-200"
               >
                  <Send className="w-5 h-5 ml-1" />
               </button>
           </div>
           <p className="text-center text-xs text-gray-400 mt-2">
               AI Agent guides you to the answer instead of direct solving to promote learning.
           </p>
        </div>
      </div>
    </div>
  );
}
