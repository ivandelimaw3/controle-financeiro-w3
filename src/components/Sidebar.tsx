
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
  BarChart3,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRoles();
  const [showCategoriasSubmenu, setShowCategoriasSubmenu] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel de Negócios', path: '/' },
    { icon: CreditCard, label: 'Contas', path: '/contas' },
    { icon: Building2, label: 'Bancos', path: '/bancos' },
    { icon: PieChart, label: 'Investimentos', path: '/investimentos' },
    { icon: BarChart3, label: 'Análise Gráfica', path: '/analise' },
    { icon: TrendingUp, label: 'Relatórios', path: '/relatorios' },
  ];

  const categoriasItems = [
    { icon: FolderOpen, label: 'Categorias', path: '/categorias' },
    { icon: RotateCcw, label: 'Recorrências', path: '/recorrencias' },
    { icon: CreditCard, label: 'Métodos Pagamento', path: '/metodos-pagamento' }
  ];

  React.useEffect(() => {
    // Manter submenu aberto se estiver em uma das páginas de categorias
    if (location.pathname === '/categorias' || location.pathname === '/recorrencias' || location.pathname === '/metodos-pagamento') {
      setShowCategoriasSubmenu(true);
    }
  }, [location.pathname]);


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
          
          {/* Categorias com Submenu */}
          <li>
            <button
              onClick={() => setShowCategoriasSubmenu(!showCategoriasSubmenu)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                (location.pathname === '/categorias' || location.pathname === '/recorrencias' || location.pathname === '/metodos-pagamento')
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FolderOpen size={20} />
              Gestão
              {showCategoriasSubmenu ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />}
            </button>
            
            {showCategoriasSubmenu && (
              <ul className="ml-6 mt-2 space-y-1">
                {categoriasItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        location.pathname === item.path
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
          
          {/* Admin menu item */}
          {isAdmin && (
            <li>
              <button
                onClick={() => navigate('/admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Shield size={20} />
                Administração
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};
