import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Toast } from './Toast';
import { TopBar } from './TopBar';

export function Layout() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="safe-bottom mx-auto max-w-md px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
