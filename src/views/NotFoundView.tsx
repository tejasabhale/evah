import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-evah-text">
            EVAH
          </h1>
          <p className="text-[16px] text-evah-muted font-normal">
            Page not found.
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-[15px] font-medium text-evah-text bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-evah-secondary" />
            <span>Return Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
