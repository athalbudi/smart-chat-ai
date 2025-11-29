import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquarePlus, LogOut, MessageSquare, Settings2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore"; 
import PromptManager from "./PromptManager"; 
import DocumentManager from "./DocumentManager";

export default function ChatSidebar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const { conversations, fetchConversations, createConversation, selectConversation, activeId } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="w-72 h-full bg-black border-r border-zinc-800 flex flex-col shadow-xl z-20">
      
      {/* SECTION 1: MAIN ACTION (Jelas & Terpisah) */}
      <div className="p-4 pb-2">
        <Button 
          onClick={() => createConversation()}
          className="w-full justify-start gap-2 bg-white text-black hover:bg-zinc-200 font-semibold h-10 shadow-lg shadow-white/5 transition-all"
        >
          <MessageSquarePlus size={18} />
          New Chat
        </Button>
      </div>

      {/* SECTION 2: TOOLS (Dikelompokkan, warna beda dikit) */}
      <div className="px-4 pb-4 space-y-1">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 py-2">Tools & Configuration</p>
        <PromptManager />
        <DocumentManager />
      </div>

      <Separator className="bg-zinc-800/50 mx-4 w-auto" />

      {/* SECTION 3: HISTORY (Area Luas) */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 py-2">Recent Chats</p>
          
          {conversations.length === 0 && (
            <div className="px-4 py-8 text-center">
                <p className="text-xs text-zinc-600">Belum ada riwayat chat.</p>
                <p className="text-xs text-zinc-700 mt-1">Mulai chat baru sekarang!</p>
            </div>
          )}

          {conversations.map((chat) => (
            <Button 
              key={chat.id} 
              variant="ghost"
              onClick={() => selectConversation(chat.id)}
              className={`w-full justify-start h-auto py-3 px-3 text-left transition-all ${
                activeId === chat.id 
                  ? "bg-zinc-800/80 text-white" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <MessageSquare size={16} className={`mr-3 shrink-0 ${activeId === chat.id ? "text-blue-400" : "text-zinc-600"}`} />
              <div className="truncate w-full text-sm font-medium">
                {chat.title}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-zinc-800/50" />

      {/* FOOTER: ACCOUNT */}
      <div className="p-4 bg-zinc-950">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-default">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-white truncate">My Account</span>
            <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-zinc-500 hover:text-red-400 hover:bg-red-900/10">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}