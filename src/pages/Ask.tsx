import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

type Citation = {
  documentName: string;
  page: number;
  snippet: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isError?: boolean;
};

export default function Ask() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/query', { query: userMessage.content });
      
      const isRestricted = res.data.answer.includes("ACCESS RESTRICTED");
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations,
        isError: isRestricted
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error connecting to TriGuard Intelligence. Please try again later.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161618] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 bg-graphite_light flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wider flex items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald_auth mr-2" />
            SECURE QUERY
          </h2>
          <p className="text-sm text-gray-400 mt-1">Queries are monitored and access-controlled</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Send className="w-12 h-12 mb-4 opacity-20" />
            <p>Ask a question based on indexed documents.</p>
            <p className="text-sm mt-2">Example: "What is the leave policy?"</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user' 
                  ? 'bg-cyan_ai/10 border border-cyan_ai/30 text-white' 
                  : msg.isError 
                    ? 'bg-red-900/20 border border-red_blocked text-red-100'
                    : 'bg-graphite_light border border-gray-700 text-gray-200'
              }`}>
                {msg.role === 'assistant' && msg.isError && (
                  <div className="flex items-center text-red_blocked mb-2 font-bold text-sm tracking-wider">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    SECURITY INTERVENTION
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Authorized Sources</p>
                    <div className="space-y-2">
                      {msg.citations.map((cit, idx) => (
                        <div key={idx} className="text-xs bg-[#111] p-2 rounded border border-gray-800 flex items-start">
                          <CheckCircle2 className="w-3 h-3 text-emerald_auth mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-cyan-200">{cit.documentName}</span>
                            <span className="text-gray-500 ml-2">Page {cit.page}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-graphite_light border border-gray-700 rounded-lg p-4 flex items-center text-cyan_ai">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              Retrieving authorized context...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-graphite">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query secure intelligence..."
            className="w-full bg-[#111] border border-gray-700 rounded-lg py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan_ai focus:ring-1 focus:ring-cyan_ai transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 p-2 bg-cyan_ai text-black rounded-md hover:bg-cyan-400 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
