
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminControl } from '@/hooks/useAdminControl';
import { 
  LayoutDashboard, 
  CreditCard, 
  FolderOpen, 
  TrendingUp,
  Building2,
  PieChart,
  Shield
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdminControl();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel de Negócios', path: '/' },
    { icon: CreditCard, label: 'Contas', path: '/contas' },
    { icon: Building2, label: 'Bancos', path: '/bancos' },
    { icon: PieChart, label: 'Investimentos', path: '/investimentos' },
    { icon: FolderOpen, label: 'Categorias', path: '/categorias' },
    { icon: TrendingUp, label: 'Relatórios', path: '/relatorios' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Administração', path: '/admin' });
  }

  return (
    <div className="w-64 bg-white shadow-xl border-r border-slate-200">
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
    </div>
  );
};
