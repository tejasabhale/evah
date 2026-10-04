import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvahStore } from '../store/useEvahStore';
import { FileItem } from '../types';
import { FileText, Folder, Lock, Globe, ArrowUpRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { files } = useEvahStore();

  const recentFiles = files.slice(0, 3);

  const quickAccessItems = [
    { label: 'Files', path: '/files', icon: Folder },
    { label: 'Vault', path: '/vault', icon: Lock },
    { label: 'Browser', path: '/browser', icon: Globe },
    { label: 'Notes', path: '/notes', icon: FileText },
  ];

  const handleOpenFile = (file: FileItem) => {
    if (file.type === 'markdown') {
      navigate('/notes');
    } else {
      navigate('/files');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-8 select-none">
      {/* Title & Introduction (28px title, 16px subtitle, generous spacing) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2 mb-16"
      >
        <h1 className="text-[30px] font-medium tracking-tight text-evah-text">
          EVAH
        </h1>
        <p className="text-[17px] text-evah-muted font-normal">
          Your private workspace.
        </p>
      </motion.div>

      {/* Recent Files (18-20px section header, 46px comfortable rows) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4 mb-14"
      >
        <h2 className="text-[18px] font-medium text-evah-text tracking-tight">
          Recent
        </h2>

        <div className="flex flex-col border border-evah-border rounded-xl divide-y divide-evah-border/60 bg-evah-surface/40 backdrop-blur-md overflow-hidden">
          {recentFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => handleOpenFile(file)}
              className="flex items-center justify-between h-[48px] px-5 text-left transition-colors duration-150 hover:bg-white/[0.04] group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <FileText size={20} className="text-evah-muted group-hover:text-evah-accent transition-colors shrink-0" />
                <span className="text-[15.5px] text-evah-text truncate font-normal group-hover:text-white transition-colors">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[13.5px] font-mono text-evah-muted">
                  {file.modified.split(',')[0]}
                </span>
                <ArrowUpRight size={17} className="text-evah-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quick Access (comfortable 48px buttons, 20px icons) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <h2 className="text-[18px] font-medium text-evah-text tracking-tight">
          Quick Access
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 h-[48px] px-4 rounded-xl border border-evah-border bg-evah-surface/40 hover:bg-white/[0.05] text-left transition-all duration-150 group"
              >
                <Icon size={20} className="text-evah-muted group-hover:text-evah-accent transition-colors shrink-0" />
                <span className="text-[15px] text-evah-secondary group-hover:text-evah-text font-normal transition-colors">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
