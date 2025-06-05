
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  FolderOpen, 
  TrendingUp,
  User,
  LogOut 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CreditCard, label: 'Contas', path: '/contas' },
    { icon: FolderOpen, label: 'Categorias', path: '/categorias' },
    { icon: TrendingUp, label: 'Relatórios', path: '/relatorios' },
  ];

  return (
    <div className="w-64 bg-white shadow-xl border-r border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          FinanceControl
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gestão Financeira</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Usuário</p>
            <p className="text-xs text-slate-500">user@example.com</p>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
