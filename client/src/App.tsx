import { useAuthStore } from '@/store/useAuthStore';
import LoginPage from '@/components/LoginPage';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import { Toaster } from "@/components/ui/sonner"; // <--- Import

function App() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster /> {/* <--- Pasang disini */}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <ChatSidebar />
      <ChatArea />
      <Toaster position="top-center" /> {/* <--- Pasang disini juga */}
    </div>
  );
}

export default App;