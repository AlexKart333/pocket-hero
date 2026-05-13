import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/90 p-3 shadow-lg">
      <div className="flex items-center gap-2 text-xs text-white/60">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
    </div>
  );
}
