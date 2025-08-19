import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart3, Receipt, CreditCard } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard'
    },
    {
      name: 'Contas',
      icon: Receipt,
      path: '/contas'
    },
    {
      name: 'Contas Cartões',
      icon: CreditCard,
      path: '/contas-cartoes'
    },
    {
      name: 'Cartões de Crédito',
      icon: CreditCard,
      path: '/cartoes-credito'
    },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full py-4 px-3">
      <div className="font-bold text-lg mb-4">Menu</div>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 ${location.pathname === item.path ? 'bg-gray-100 font-medium' : ''
                }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
