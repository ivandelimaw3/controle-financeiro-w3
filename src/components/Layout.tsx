
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isContasPage = location.pathname === '/contas';

  useEffect(() => {
    if (!isContasPage) {
      setSidebarCollapsed(false);
    }
  }, [isContasPage]);

  const handleMainContentHover = () => {
    if (isContasPage) {
      setSidebarCollapsed(true);
    }
  };

  const handleSidebarHover = () => {
    if (isContasPage) {
      setSidebarCollapsed(false);
    }
  };

  if (isContasPage) {
    return (
      <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
          <div onMouseEnter={handleSidebarHover}>
            <AppSidebar />
          </div>
          <div className="flex-1 flex flex-col">
            <Header />
            <SidebarTrigger className="fixed top-4 left-4 z-50" />
            <main 
              className="flex-1 p-6"
              onMouseEnter={handleMainContentHover}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
