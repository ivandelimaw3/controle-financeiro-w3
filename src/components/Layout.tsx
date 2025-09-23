
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  onToggleSidebar?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onToggleSidebar }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(!isMobile);
  
  const collapsiblePages = [
    '/contas',
    '/categorias', 
    '/relatorios',
    '/analise',
    '/bancos',
    '/cartoes-credito',
    '/card-accounts',
    '/investimentos',
    '/investimentos-vencidos'
  ];
  
  const isCollapsiblePage = collapsiblePages.includes(location.pathname);

  useEffect(() => {
    if (!isCollapsiblePage) {
      setSidebarCollapsed(!isMobile);
    } else {
      setSidebarCollapsed(!isMobile);
    }
  }, [isCollapsiblePage, isMobile]);

  const handleMainContentHover = () => {
    if (isCollapsiblePage && !isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const handleSidebarHover = () => {
    if (isCollapsiblePage && !isMobile) {
      setSidebarCollapsed(false);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    onToggleSidebar?.();
  };

  if (isCollapsiblePage) {
    return (
      <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
          <div onMouseEnter={handleSidebarHover}>
            <AppSidebar />
          </div>
          <div className="flex-1 flex flex-col">
          <Header />
            <main 
              className={`flex-1 p-6 ${isMobile && !sidebarCollapsed ? 'opacity-50 pointer-events-none' : ''}`}
              onMouseEnter={handleMainContentHover}
            >
              {React.cloneElement(children as React.ReactElement, { onToggleSidebar: handleToggleSidebar })}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className={`flex-1 p-6 ${isMobile && !sidebarCollapsed ? 'opacity-50 pointer-events-none' : ''}`}>
            {React.cloneElement(children as React.ReactElement, { onToggleSidebar: handleToggleSidebar })}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
