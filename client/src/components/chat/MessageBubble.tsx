import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex w-full gap-4 p-4",
      isUser ? "bg-transparent" : "bg-zinc-900/50"
    )}>
      <Avatar className="h-8 w-8 border border-zinc-700">
        <AvatarImage src={isUser ? "" : "/ai-avatar.png"} />
        <AvatarFallback className={isUser ? "bg-blue-600 text-white" : "bg-green-600 text-white"}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-sm font-semibold text-zinc-400">
          {isUser ? "You" : "Smart Chat AI"}
        </p>
        
        <div className="text-zinc-100 leading-relaxed text-sm">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // FIX: Override <p> menjadi <div> agar tidak crash saat ada block code
              p: ({children}) => <div className="mb-2 last:mb-0">{children}</div>,
              
              // Styling Code Block
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <div className="bg-zinc-950 p-3 rounded-md border border-zinc-800 my-2 overflow-x-auto">
                    <code className={cn("font-mono text-xs text-green-400", className)} {...props}>
                      {children}
                    </code>
                  </div>
                ) : (
                  <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono text-zinc-200" {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}