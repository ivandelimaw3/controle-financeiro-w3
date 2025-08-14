
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface InvestmentCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  onClick?: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  bgColor,
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 sm:p-3 rounded-xl ${bgColor}`}>
          <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp size={14} className="sm:w-4 sm:h-4" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4" />}
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-600 text-xs sm:text-sm font-medium mb-1 line-clamp-2">
        {title}
      </h3>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
        {value}
      </p>
    </div>
  );
};
