import React, { useState } from 'react';
import { useEvahStore } from '../store/useEvahStore';
import { Plus, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const NotesView: React.FC = () => {
  const { notes, activeNoteId, setActiveNoteId, updateNoteContent, createNote } = useEvahStore();

  const currentNote = notes.find((n) => n.id === activeNoteId) || notes[0];
  const [saveIndicator, setSaveIndicator] = useState(false);

  const handleContentChange = (val: string) => {
    if (!currentNote) return;
    updateNoteContent(currentNote.id, val);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 1200);
  };

  const handleCreateNew = () => {
    createNote('Ideas');
    toast.success('New note created');
  };

  const wordCount = currentNote ? currentNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = currentNote ? currentNote.content.length : 0;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden border border-evah-border rounded-xl bg-evah-surface/30 backdrop-blur-md m-6 select-none">
      {/* Left Sidebar: Notes List */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-evah-border flex flex-col shrink-0 bg-white/[0.01]">
        {/* Header (comfortable 52px height) */}
        <div className="h-[52px] px-4 border-b border-evah-border flex items-center justify-between">
          <span className="text-[17px] font-medium text-evah-text">
            Notes
          </span>
          <button
            onClick={handleCreateNew}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-evah-muted hover:text-evah-text hover:bg-white/[0.04] transition-colors"
            title="Create note"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Note List Items (comfortable 48px height) */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {notes.map((note) => {
            const isSelected = note.id === currentNote?.id;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left h-[50px] px-3.5 rounded-lg transition-colors duration-150 group flex flex-col justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-white/[0.08] text-evah-text font-medium'
                    : 'text-evah-secondary hover:text-evah-text hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate text-[15px]">{note.title}</span>
                </div>
                <span className="text-[12.5px] font-mono text-evah-muted">
                  {note.modified}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Note Content Editor */}
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Editor Sub-header (comfortable 52px height) */}
        <div className="h-[52px] px-6 border-b border-evah-border flex items-center justify-between shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-evah-accent" />
            <span className="text-[16px] font-medium text-evah-text">
              {currentNote?.title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[13px] font-mono text-evah-muted">
            {saveIndicator ? (
              <span className="flex items-center gap-1.5 text-evah-success">
                <Check size={16} />
                <span>Saved</span>
              </span>
            ) : (
              <span>Autosaved</span>
            )}
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Text Area (comfortable 15px font, spacious padding) */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentNote ? (
            <textarea
              value={currentNote.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full bg-transparent text-[15px] text-evah-text font-mono leading-relaxed outline-none resize-none selection:bg-evah-accent/20 placeholder:text-evah-muted"
              placeholder="Start writing..."
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[15px] text-evah-muted font-mono">
              Select or create a note.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
