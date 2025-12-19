
import React, { useState, useEffect, useRef } from 'react';
import { Message, SessionContext, Intent, Level } from './types';
import { processChat } from './services/geminiService';
import { dbService } from './services/dbService';
import { CourseCard, MaterialCard, PQCard } from './components/ResponseCards';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Campus Academic Assistant. I can help you find courses, study materials, and past questions. What is your department and level?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<SessionContext>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await processChat(inputValue, chatHistory, context);

      // Update Session Context if AI detected new parameters
      if (aiResponse.parameters) {
        setContext(prev => ({
          ...prev,
          department: aiResponse.parameters.department || prev.department,
          level: (aiResponse.parameters.level as Level) || prev.level,
          lastCourseCode: aiResponse.parameters.courseCode || prev.lastCourseCode
        }));
      }

      let data: any = null;
      let extraAnswer = '';

      // Handle Data Fetching based on Intent
      switch (aiResponse.intent) {
        case Intent.COURSE_INFO:
          if (aiResponse.parameters.level || aiResponse.parameters.department) {
            data = await dbService.getCourses(aiResponse.parameters.department, aiResponse.parameters.level as Level);
            if (data.length === 0) extraAnswer = "\n\nNo specific courses found for these parameters in our database yet.";
          }
          break;
        case Intent.MATERIAL_SEARCH:
          if (aiResponse.parameters.courseCode) {
            data = await dbService.getMaterials(aiResponse.parameters.courseCode);
            if (data.length === 0) extraAnswer = `\n\nNo materials found for ${aiResponse.parameters.courseCode}.`;
          }
          break;
        case Intent.PAST_QUESTIONS:
          if (aiResponse.parameters.courseCode) {
            data = await dbService.getPastQuestions(aiResponse.parameters.courseCode);
            if (data.length === 0) extraAnswer = `\n\nNo past questions found for ${aiResponse.parameters.courseCode}.`;
          }
          break;
        case Intent.STUDY_ADVICE:
          const levelToAdvise = aiResponse.parameters.level as Level || context.level;
          if (levelToAdvise) {
            const advice = await dbService.getStudyAdvice(levelToAdvise);
            extraAnswer = `\n\n💡 Advice for ${levelToAdvise}: ${advice}`;
          }
          break;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse.answer + extraAnswer,
        timestamp: new Date(),
        intent: aiResponse.intent,
        data: data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! I ran into an issue. Let's try that again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
            <h1 className="font-bold text-slate-800 tracking-tight">Academic AI</h1>
          </div>
          <p className="text-xs text-slate-500">Official Campus Assistant Prototype</p>
        </div>
        
        <div className="flex-1 p-6 space-y-6">
          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Session</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] block text-slate-400 font-medium">DEPARTMENT</span>
                <span className="text-sm font-semibold text-slate-700">{context.department || 'Not set'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] block text-slate-400 font-medium">LEVEL</span>
                <span className="text-sm font-semibold text-slate-700">{context.level || 'Not set'}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Shortcuts</h3>
            <div className="flex flex-wrap gap-2">
              {['Courses', 'Materials', 'Past Questions', 'Advice'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setInputValue(`Tell me about ${tag}`)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center italic">
            "An educated mind is a powerful tool."
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl relative lg:my-4 lg:mx-4 lg:rounded-3xl overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
            <h1 className="font-bold text-slate-800">Academic AI</h1>
          </div>
          <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-600">{context.level || 'Level?'}</div>
        </header>

        {/* Chat Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 custom-scrollbar scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Dynamic Result Rendering */}
                  {msg.data && msg.intent === Intent.COURSE_INFO && <CourseCard courses={msg.data} />}
                  {msg.data && msg.intent === Intent.MATERIAL_SEARCH && <MaterialCard materials={msg.data} />}
                  {msg.data && msg.intent === Intent.PAST_QUESTIONS && <PQCard pqs={msg.data} />}
                </div>
                <div className={`mt-1 text-[10px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about courses, materials, or advice..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-700 outline-none"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            AI Assistant may provide inaccurate information. Verify with your faculty handbook.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
