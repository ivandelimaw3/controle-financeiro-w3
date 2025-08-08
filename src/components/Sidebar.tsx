
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Tags, 
  BarChart3, 
  Building, 
  TrendingUp, 
  CreditCard,
  Settings,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Contas', path: '/contas' },
    { icon: Tags, label: 'Categorias', path: '/categorias' },
    { icon: Building, label: 'Bancos', path: '/bancos' },
    { icon: TrendingUp, label: 'Investimentos', path: '/investimentos' },
    { icon: CreditCard, label: 'Cartões', path: '/cartoes-credito' },
    { icon: BarChart3, label: 'Análise', path: '/analise' },
    { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
    { icon: Settings, label: 'Admin', path: '/admin' },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">FinanceApp</h2>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export { Sidebar };
