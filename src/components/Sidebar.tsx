
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  CreditCard, 
  Building2, 
  Users, 
  TrendingUp, 
  BarChart3, 
  FileBarChart, 
  Settings,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contas', href: '/contas', icon: FileText },
  { name: 'Contas Cartões', href: '/contas-cartoes', icon: Calendar },
  { name: 'Bancos', href: '/bancos', icon: Building2 },
  { name: 'Cartões de Crédito', href: '/cartoes-credito', icon: CreditCard },
  { name: 'Categorias', href: '/categorias', icon: Users },
  { name: 'Investimentos', href: '/investimentos', icon: TrendingUp },
  { name: 'Análise', href: '/analise', icon: BarChart3 },
  { name: 'Relatórios', href: '/relatorios', icon: FileBarChart },
  { name: 'Configurações', href: '/admin', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Financeiro</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-blue-500' : 'text-gray-400',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
