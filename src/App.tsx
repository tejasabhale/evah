import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { DesktopLayout } from './components/layout/DesktopLayout';
import { useEvahStore } from './store/useEvahStore';

// Views
import { HomeView } from './views/HomeView';
import { FilesView } from './views/FilesView';
import { VaultView } from './views/VaultView';
import { BrowserView } from './views/BrowserView';
import { NotesView } from './views/NotesView';
import { SecurityView } from './views/SecurityView';
import { SettingsView } from './views/SettingsView';
import { NotFoundView } from './views/NotFoundView';

const GlobalShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const { toggleAiPanel, lockSession } = useEvahStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Alt + 1..7 or Ctrl + 1..7: Switch Workspaces
      if (e.altKey || (e.ctrlKey && !isInput)) {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= 7) {
          e.preventDefault();
          const routes = ['/home', '/files', '/vault', '/browser', '/notes', '/security', '/settings'];
          const targetRoute = routes[keyNum - 1];
          if (targetRoute) {
            navigate(targetRoute);
          }
        }
      }

      // Cmd+J / Ctrl+J: Ask EVAH Assistant
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleAiPanel();
      }

      // Cmd+L / Ctrl+L: Lock Session
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l' && !isInput) {
        e.preventDefault();
        lockSession();
        toast.info('Session locked');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleAiPanel, lockSession]);

  return null;
};

export const App: React.FC = () => {
  return (
    <Router>
      <GlobalShortcuts />
      <Routes>
        <Route path="/" element={<DesktopLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomeView />} />
          <Route path="files" element={<FilesView />} />
          <Route path="vault" element={<VaultView />} />
          <Route path="browser" element={<BrowserView />} />
          <Route path="notes" element={<NotesView />} />
          <Route path="security" element={<SecurityView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<NotFoundView />} />
        </Route>
      </Routes>

      {/* Restrained desktop notification toasts */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0D1117',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#F2F4F7',
            fontSize: '14px',
            fontFamily: 'Geist, Inter, sans-serif',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          },
        }}
      />
    </Router>
  );
};
