import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  FolderOpen, 
  TrendingUp,
  Building2,
  PieChart,
  Shield,
  BarChart3
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRoles();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel de Negócios', path: '/' },
    { icon: CreditCard, label: 'Contas', path: '/contas' },
    { icon: FolderOpen, label: 'Categorias', path: '/categorias' },
    { icon: CreditCard, label: 'Cartões Novo', path: '/cartoes-novo' },
    { icon: TrendingUp, label: 'Relatórios', path: '/relatorios' },
    { icon: Building2, label: 'Bancos', path: '/bancos' },
    { icon: PieChart, label: 'Investimentos', path: '/investimentos' },
    { icon: BarChart3, label: 'Análise Gráfica', path: '/analise' },
  ];

  // Adicionar item de admin apenas se o usuário for admin
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
