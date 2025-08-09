
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart4, 
  Receipt, 
  FileText, 
  Tag, 
  Building2, 
  CreditCard,
  TrendingUp, 
  PieChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Archive
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [investmentMenuOpen, setInvestmentMenuOpen] = useState(
    location.pathname === '/investimentos' || location.pathname === '/investimentos-vencidos'
  );

  const menuItems = [
    { 
      icon: BarChart4, 
      label: 'Painel de Contas', 
      path: '/', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100'
    },
    { 
      icon: Receipt, 
      label: 'Contas', 
      path: '/contas', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-100'
    },
    { 
      icon: FileText, 
      label: 'Relatórios', 
      path: '/relatorios', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100'
    },
    { 
      icon: Tag, 
      label: 'Categorias', 
      path: '/categorias', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
    },
    { 
      icon: Building2, 
      label: 'Bancos', 
      path: '/bancos', 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-100'
    },
    { 
      icon: CreditCard, 
      label: 'Cartões', 
      path: '/cartoes-credito', 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverBg: 'hover:bg-pink-100'
    },
    { 
      icon: PieChart, 
      label: 'Análise Gráfica', 
      path: '/analise', 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverBg: 'hover:bg-cyan-100'
    },
    { 
      icon: Settings, 
      label: 'Admin', 
      path: '/admin', 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverBg: 'hover:bg-gray-100'
    },
  ];

  const investmentItems = [
    {
      icon: TrendingUp,
      label: 'Investimentos',
      path: '/investimentos',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverBg: 'hover:bg-teal-100'
    },
    {
      icon: Archive,
      label: 'Investimentos Vencidos',
      path: '/investimentos-vencidos',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
    }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-50 to-white shadow-lg border-r h-screen">
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? `${item.bgColor} ${item.color} shadow-sm border-l-4 border-current`
                    : `text-gray-600 ${item.hoverBg} hover:text-gray-900 hover:shadow-sm`
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? item.color : 'text-gray-500'}`} />
                {item.label}
              </Link>
            );
          })}

          {/* Menu de Investimentos com submenu */}
          <div>
            <button
              onClick={() => setInvestmentMenuOpen(!investmentMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === '/investimentos' || location.pathname === '/investimentos-vencidos'
                  ? 'bg-teal-50 text-teal-600 shadow-sm border-l-4 border-current'
                  : 'text-gray-600 hover:bg-teal-100 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className={`h-5 w-5 mr-3 ${
                  location.pathname === '/investimentos' || location.pathname === '/investimentos-vencidos' 
                    ? 'text-teal-600' 
                    : 'text-gray-500'
                }`} />
                Investimentos
              </div>
              {investmentMenuOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {investmentMenuOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {investmentItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : `text-gray-600 ${item.hoverBg} hover:text-gray-900`
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-3 ${isActive ? item.color : 'text-gray-500'}`} />
                      {item.label === 'Investimentos' ? 'Ativos' : item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export { Sidebar };
