import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { toast } from "sonner"; // Import Toast

export default function DocumentManager() {
  const { uploadDocument, isUploading, uploadProgress } = useDocumentStore();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // 1. Tampilkan Toast Loading
    const toastId = toast.loading("Uploading and analyzing document...");

    try {
      await uploadDocument(file);
      
      // 2. Tampilkan Toast Sukses
      toast.success("Knowledge added successfully!", { id: toastId });
      
      setFile(null); // Reset file setelah upload
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (error) {
      // 3. Tampilkan Toast Error
      toast.error("Failed to process document.", { id: toastId });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <FileText size={18} className="text-purple-500" />
          Knowledge Base
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Knowledge</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Upload PDF documents (e.g., papers, reports) so the AI can read and answer questions about them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Area Input File */}
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-950/50 hover:bg-zinc-950 transition-colors">
            <Upload className="h-10 w-10 text-zinc-500 mb-2" />
            <Input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="text-sm text-blue-500 cursor-pointer hover:underline"
            >
              Click to select PDF
            </label>
            {file && (
              <p className="mt-2 text-sm text-zinc-300 font-medium flex items-center gap-2">
                <FileText size={14} /> {file.name}
              </p>
            )}
          </div>

          {/* Status Bar Visual (Tetap ada sebagai pelengkap Toast) */}
          {uploadProgress && (
            <div className={`p-3 rounded text-sm font-medium flex items-center gap-2 ${
              uploadProgress.includes('Failed') ? 'bg-red-900/20 text-red-400' : 
              uploadProgress.includes('Success') ? 'bg-green-900/20 text-green-400' : 'bg-blue-900/20 text-blue-400'
            }`}>
               {uploadProgress.includes('Success') ? <CheckCircle2 size={16} /> : <Loader2 size={16} className={isUploading ? "animate-spin" : ""} />}
               {uploadProgress}
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {isUploading ? 'Processing...' : 'Upload & Embed'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}