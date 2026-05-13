import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/80 p-6 text-center shadow-lg">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-3xl">{icon ?? '🕯️'}</div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/60">{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
