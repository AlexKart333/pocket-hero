import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { translate } from '../i18n';
import { useGameStore } from '../store/gameStore';

export function Toast() {
  const toast = useGameStore((state) => state.toast);
  const language = useGameStore((state) => state.language);
  const clearToast = useGameStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className={`fixed left-4 right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glow ${toast.type === 'error' ? 'border-danger/40 bg-danger/80' : toast.type === 'success' ? 'border-success/40 bg-success/80' : 'border-white/10 bg-card/95'}`}
        >
          {translate(language, toast.key, toast.values)}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
