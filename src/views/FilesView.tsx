import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { FileItem } from '../types';
import { 
  Search, 
  FileText, 
  FileCode, 
  FileArchive, 
  File, 
  X, 
  Copy, 
  ExternalLink,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export const FilesView: React.FC = () => {
  const navigate = useNavigate();
  const { files } = useEvahStore();
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'markdown':
        return <FileText size={20} className="text-evah-accent/80 shrink-0" />;
      case 'json':
      case 'code':
        return <FileCode size={20} className="text-evah-success/80 shrink-0" />;
      case 'archive':
        return <FileArchive size={20} className="text-evah-warning/80 shrink-0" />;
      default:
        return <File size={20} className="text-evah-secondary/80 shrink-0" />;
    }
  };

  const handleCopyContent = (content?: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('File content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInEditor = (file: FileItem) => {
    if (file.type === 'markdown') {
      navigate('/notes');
      setSelectedFile(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-14 px-8">
      {/* Top Header & Search (30px page title, 44px search input) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <h1 className="text-[30px] font-medium tracking-tight text-evah-text">
          Files
        </h1>

        {/* Minimal Search Input (44px height) */}
        <div className="relative w-full sm:w-72">
          <Search size={18} className="text-evah-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full h-11 bg-evah-surface/60 border border-evah-border rounded-lg pl-10 pr-4 text-[14.5px] text-evah-text placeholder:text-evah-muted outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </motion.div>

      {/* File List Table Header */}
      <div className="border border-evah-border rounded-xl overflow-hidden bg-evah-surface/30 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 h-11 text-[13.5px] font-mono text-evah-muted border-b border-evah-border/60 bg-white/[0.01]">
          <span className="w-2/3">Name</span>
          <span className="w-1/3 text-right">Modified</span>
        </div>

        {/* File Rows (48px row height, 20px icon, 15.5px name) */}
        <div className="divide-y divide-evah-border/40">
          {filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-evah-muted font-mono">
              No files matching "{search}"
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <motion.button
                key={file.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedFile(file)}
                className="w-full flex items-center justify-between h-[48px] px-5 text-left text-[15px] hover:bg-white/[0.04] transition-colors duration-150 group"
              >
                <div className="flex items-center gap-3.5 w-2/3 min-w-0 pr-4">
                  {getFileIcon(file.type)}
                  <span className="truncate text-evah-text font-normal group-hover:text-white text-[15.5px]">
                    {file.name}
                  </span>
                  <span className="hidden sm:inline-block text-[13px] font-mono text-evah-muted">
                    {file.size}
                  </span>
                </div>

                <div className="w-1/3 text-right text-[13.5px] font-mono text-evah-muted group-hover:text-evah-secondary transition-colors">
                  {file.modified.split(',')[0]}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Lightweight Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-evah-surface border border-evah-border rounded-xl shadow-panel overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header (comfortable 52px height) */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-evah-border bg-white/[0.01]">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(selectedFile.type)}
                  <span className="text-[16px] font-medium text-evah-text truncate">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="w-9 h-9 flex items-center justify-center text-evah-muted hover:text-evah-text rounded-lg hover:bg-white/[0.04]"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Meta */}
              <div className="px-5 py-2.5 border-b border-evah-border/60 bg-white/[0.01] flex items-center gap-5 text-[13px] font-mono text-evah-muted">
                <span>Size: {selectedFile.size}</span>
                <span>Category: {selectedFile.category}</span>
                <span>Modified: {selectedFile.modified}</span>
              </div>

              {/* Preview Content */}
              <div className="p-5 max-h-80 overflow-y-auto">
                <pre className="text-[14px] font-mono text-evah-secondary leading-relaxed whitespace-pre-wrap selection:bg-evah-accent/20">
                  {selectedFile.content || '[Binary file - no direct text preview]'}
                </pre>
              </div>

              {/* Footer Actions (42px min buttons) */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-evah-border bg-white/[0.01]">
                <button
                  onClick={() => handleCopyContent(selectedFile.content)}
                  className="h-10 px-4 rounded-lg text-[14px] font-medium text-evah-secondary hover:text-evah-text bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={18} className="text-evah-success" /> : <Copy size={18} />}
                  <span>{copied ? 'Copied' : 'Copy Content'}</span>
                </button>

                {selectedFile.type === 'markdown' && (
                  <button
                    onClick={() => handleOpenInEditor(selectedFile)}
                    className="h-10 px-4 rounded-lg text-[14px] font-medium text-evah-text bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors flex items-center gap-2"
                  >
                    <span>Open in Notes</span>
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
