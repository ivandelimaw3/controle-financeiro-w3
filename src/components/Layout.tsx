
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
      setSidebarCollapsed(false);
    }
  }, [isCollapsiblePage]);

  const handleMainContentHover = () => {
    if (isCollapsiblePage) {
      setSidebarCollapsed(true);
    }
  };

  const handleSidebarHover = () => {
    if (isCollapsiblePage) {
      setSidebarCollapsed(false);
    }
  };

  if (isCollapsiblePage) {
    return (
      <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
          <div onMouseEnter={handleSidebarHover}>
            <AppSidebar />
          </div>
          <div className="flex-1 flex flex-col">
            {!isMobile && <Header />}
            <SidebarTrigger className={`fixed ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} z-50 ${isMobile ? 'bg-white/90 backdrop-blur-sm shadow-lg' : ''}`} />
            <main 
              className={`flex-1 ${isMobile ? 'p-4 pt-12' : 'p-6'}`}
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
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {!isMobile && <Header />}
          <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
