
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-6 min-h-[calc(100vh-4rem)] w-full overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
