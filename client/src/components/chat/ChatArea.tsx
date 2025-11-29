import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2, Sparkles, BookOpen, Terminal, Coffee } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatArea() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, activeId, isLoading } = useChatStore();
  const user = useAuthStore((state) => state.user);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || !activeId) return;
    setInput(""); 
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- KOMPONEN WELCOME SCREEN (MENGISI KEKOSONGAN) ---
  if (!activeId || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-500">
          
          {/* Greeting yang Ramah */}
          <div className="space-y-2">
            <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <Sparkles className="text-white h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Selamat Datang, {user?.email?.split('@')[0]}!
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Saya siap membantu Anda. Mulai dengan memilih dokumen di Knowledge Base, atau coba salah satu topik di bawah ini.
            </p>
          </div>

          {/* Kartu Saran (Suggestion Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <button 
              onClick={() => handleSend("Jelaskan konsep RAG (Retrieval Augmented Generation) dengan bahasa sederhana.")}
              className="p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300">
                  <BookOpen size={18} />
                </div>
                <span className="font-semibold text-zinc-200">Jelaskan Konsep</span>
              </div>
              <p className="text-sm text-zinc-500">"Apa itu RAG dalam AI?"</p>
            </button>

            <button 
              onClick={() => handleSend("Buatkan kerangka artikel tentang masa depan teknologi AI di Indonesia.")}
              className="p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300">
                  <Terminal size={18} />
                </div>
                <span className="font-semibold text-zinc-200">Bantu Menulis</span>
              </div>
              <p className="text-sm text-zinc-500">"Buatkan kerangka artikel..."</p>
            </button>

            <button 
              onClick={() => handleSend("Berikan saya ide kreatif untuk judul skripsi teknik informatika.")}
              className="p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:text-green-300">
                  <Sparkles size={18} />
                </div>
                <span className="font-semibold text-zinc-200">Brainstorming</span>
              </div>
              <p className="text-sm text-zinc-500">"Ide judul skripsi..."</p>
            </button>

            <button 
              onClick={() => handleSend("Mari ngobrol santai. Apa yang bisa kamu lakukan?")}
              className="p-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 group-hover:text-orange-300">
                  <Coffee size={18} />
                </div>
                <span className="font-semibold text-zinc-200">Ngobrol Santai</span>
              </div>
              <p className="text-sm text-zinc-500">"Apa kemampuanmu?"</p>
            </button>
          </div>
        </div>

        {/* Input Area Tetap Ada di Bawah */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded-xl focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-lg">
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan Anda di sini..." 
              className="min-h-[50px] max-h-[200px] border-none bg-transparent resize-none focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-500"
            />
            <Button 
              onClick={() => handleSend()}
              size="icon" 
              className="mb-1 bg-white text-black hover:bg-zinc-200 transition-colors"
              disabled={!input.trim()}
            >
              <SendHorizontal size={18} />
            </Button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">
            Smart Chat AI dapat membuat kesalahan. Selalu verifikasi informasi penting.
          </p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN CHAT AKTIF (SAAT SUDAH ADA PESAN) ---
  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-zinc-500 text-sm animate-pulse">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-75" />
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150" />
              Sedang berpikir...
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded-xl focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-lg">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Lanjutkan percakapan..." 
            className="min-h-[50px] max-h-[200px] border-none bg-transparent resize-none focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-500"
          />
          <Button 
            onClick={() => handleSend()}
            size="icon" 
            className="mb-1 bg-white text-black hover:bg-zinc-200"
            disabled={!input.trim()}
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-3">
          AI generated content may be inaccurate.
        </p>
      </div>
    </div>
  );
}