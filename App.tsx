
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, SessionContext, Intent, Level } from './types';
import { processChat } from './services/geminiService';
import { dbService } from './services/dbService';
import { CourseCard, MaterialCard, PQCard } from './components/ResponseCards';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Academic AI Assistant. I can help you find curriculum details, study materials, and past questions tailored to your level. What is your department and current level?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<SessionContext>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic with smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      };
      scrollRef.current.scrollTo(scrollOptions);
    }
  }, [messages, isLoading]);

  const clearSession = () => {
    if (window.confirm("Are you sure you want to clear your session context?")) {
      setContext({});
      setMessages([{
        role: 'assistant',
        content: "Context cleared. How else can I help you today? Please mention your level and department if you need specific course info.",
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputValue.trim();
    if (!cleanInput || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: cleanInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const aiResponse = await processChat(cleanInput, chatHistory, context);

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

      // Strategic Data Fetching
      switch (aiResponse.intent) {
        case Intent.COURSE_INFO:
          const dept = aiResponse.parameters.department || context.department;
          const lvl = (aiResponse.parameters.level as Level) || context.level;
          if (dept || lvl) {
            data = await dbService.getCourses(dept, lvl);
            if (data.length === 0) extraAnswer = "\n\n(I couldn't find specific courses matching those details in our catalog yet.)";
          }
          break;
        case Intent.MATERIAL_SEARCH:
          const code = aiResponse.parameters.courseCode || context.lastCourseCode;
          if (code) {
            data = await dbService.getMaterials(code);
            if (data.length === 0) extraAnswer = `\n\n(No supplementary materials found for ${code} at this time.)`;
          }
          break;
        case Intent.PAST_QUESTIONS:
          const pqCode = aiResponse.parameters.courseCode || context.lastCourseCode;
          if (pqCode) {
            data = await dbService.getPastQuestions(pqCode);
            if (data.length === 0) extraAnswer = `\n\n(No past questions available for ${pqCode} yet.)`;
          }
          break;
        case Intent.STUDY_ADVICE:
          const levelToAdvise = (aiResponse.parameters.level as Level) || context.level;
          if (levelToAdvise) {
            const advice = await dbService.getStudyAdvice(levelToAdvise);
            extraAnswer = `\n\n💡 **Level Guidance for ${levelToAdvise}:** ${advice}`;
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
      console.error("Chat Processing Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm experiencing some technical difficulties connecting to my brain. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col w-80 glass border-r border-slate-200/50 shadow-sm z-20">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg leading-tight tracking-tight">Academic AI</h1>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Campus Edition</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-8 pt-2 space-y-8 overflow-y-auto custom-scrollbar">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Context</h3>
              <button 
                onClick={clearSession}
                className="text-[10px] text-red-400 hover:text-red-600 font-bold transition-colors uppercase tracking-widest"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2">
              <div className="bg-white/50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9px] block text-slate-400 font-bold uppercase mb-1">Department</span>
                <span className="text-sm font-semibold text-slate-700">{context.department || 'Not specified'}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9px] block text-slate-400 font-bold uppercase mb-1">Current Level</span>
                <span className="text-sm font-semibold text-slate-700">{context.level || 'Not specified'}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Discovery</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: '300L Courses', query: 'What courses are in 300L?' },
                { label: 'Study Advice', query: 'Give me study advice for my level' },
                { label: 'Materials', query: 'Show me materials for my major' }
              ].map(item => (
                <button 
                  key={item.label}
                  onClick={() => setInputValue(item.query)}
                  className="w-full text-left px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-slate-200/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">System Operational</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Developed to empower students through technology and AI.
          </p>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.05)] relative lg:my-3 lg:mr-3 lg:rounded-[2rem] overflow-hidden border border-slate-200/50">
        
        {/* Header - Mobile Only */}
        <header className="lg:hidden px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <h1 className="font-bold text-slate-800 tracking-tight">Academic AI</h1>
          </div>
          <button onClick={clearSession} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        </header>

        {/* Chat Canvas */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar bg-gradient-to-b from-white to-slate-50/30"
          role="log"
          aria-live="polite"
        >
          {messages.map((msg, idx) => (
            <article 
              key={`${idx}-${msg.timestamp.getTime()}`} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-animate`}
            >
              <div className={`max-w-[90%] lg:max-w-[75%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                <div className={`p-4 lg:p-5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  <p className="text-sm lg:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                  
                  {/* Results components */}
                  {msg.data && msg.intent === Intent.COURSE_INFO && <CourseCard courses={msg.data} />}
                  {msg.data && msg.intent === Intent.MATERIAL_SEARCH && <MaterialCard materials={msg.data} />}
                  {msg.data && msg.intent === Intent.PAST_QUESTIONS && <PQCard pqs={msg.data} />}
                </div>
                <time className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
            </article>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div className="p-6 lg:p-10 bg-white/50 backdrop-blur-md">
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-3 bg-white border border-slate-200 rounded-[1.25rem] pl-6 pr-2 py-2 shadow-lg shadow-slate-100 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 transition-all duration-300"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything academic..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm lg:text-base py-2.5 text-slate-700 placeholder-slate-400 outline-none font-medium"
              aria-label="Ask your academic question"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="group p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-indigo-100 active:scale-90"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-[10px] text-slate-400 font-medium">Context-aware Chat</span>
            <span className="text-[10px] text-slate-400 font-medium">Gemini 3 Flash Powered</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
