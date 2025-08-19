import React from 'react';
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
  Archive,
  FileSearch
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      icon: FileSearch, 
      label: 'Visão Geral', 
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
      icon: Tag, 
      label: 'Categorias', 
      path: '/categorias', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
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
      icon: PieChart, 
      label: 'Análise Gráfica', 
      path: '/analise', 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverBg: 'hover:bg-cyan-100'
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
      icon: TrendingUp, 
      label: 'Investimentos', 
      path: '/investimentos', 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverBg: 'hover:bg-teal-100'
    },
    { 
      icon: Archive, 
      label: 'Invest.Vencidos', 
      path: '/investimentos-vencidos', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100'
    },
    { 
      icon: Settings, 
      label: 'Administração', 
      path: '/admin', 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverBg: 'hover:bg-gray-100'
    },
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
        </div>
      </nav>
    </div>
  );
};

export { Sidebar };
