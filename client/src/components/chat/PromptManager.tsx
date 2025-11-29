import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription // <--- Import Baru
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Pin, Plus } from "lucide-react";
import { usePromptStore } from "@/store/usePromptStore";
import { cn } from "@/lib/utils";

export default function PromptManager() {
  const { prompts, fetchPrompts, createPrompt, togglePin } = usePromptStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isOpen) fetchPrompts();
  }, [isOpen]);

  const handleSave = async () => {
    if (!title || !content) return;
    await createPrompt(title, content);
    setMode('list');
    setTitle("");
    setContent("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Sparkles size={18} className="text-yellow-500" />
          Master Prompts
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Personas</span>
            {mode === 'list' && (
              <Button size="sm" onClick={() => setMode('create')} className="gap-1 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} /> New
              </Button>
            )}
          </DialogTitle>
          
          {/* --- BAGIAN INI MENYELESAIKAN WARNING CONSOLE --- */}
          <DialogDescription className="text-zinc-400 text-sm">
            Create, edit, and pin custom instructions to change how the AI behaves.
          </DialogDescription>
          {/* ----------------------------------------------- */}
        </DialogHeader>

        {mode === 'create' ? (
          <div className="space-y-4 py-2">
            <Input 
              placeholder="Title (e.g., English Teacher)" 
              className="bg-zinc-950 border-zinc-700 text-zinc-100"
              value={title} onChange={e => setTitle(e.target.value)}
            />
            <Textarea 
              placeholder="System Instruction (e.g., You are an English teacher...)" 
              className="bg-zinc-950 border-zinc-700 min-h-[150px] text-zinc-100"
              value={content} onChange={e => setContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setMode('list')}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Prompt</Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {prompts.length === 0 && (
                <p className="text-center text-zinc-500 py-8">No prompts yet.</p>
              )}
              {prompts.map(prompt => (
                <div key={prompt.id} className={cn(
                  "p-3 rounded-lg border flex items-center justify-between transition-colors",
                  prompt.isPinned 
                    ? "bg-blue-900/20 border-blue-500/50" 
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                )}>
                  <div className="flex-1 mr-2">
                    <h4 className="font-semibold text-sm text-zinc-200">{prompt.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">{prompt.content}</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => togglePin(prompt.id)}
                    className={prompt.isPinned ? "text-blue-400 hover:text-blue-300" : "text-zinc-600 hover:text-zinc-300"}
                  >
                    <Pin size={18} fill={prompt.isPinned ? "currentColor" : "none"} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}