import React from 'react';
import { CategoryTreeSelect } from './CategoryTreeSelect';
import { Category } from '@/hooks/useCategoriesData';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  accountType: 'receita' | 'despesa';
  onRefresh: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string; parent_id?: number }) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  categories,
  accountType,
  onRefresh,
  onAddCategory
}) => {
  return (
    <CategoryTreeSelect
      value={value}
      onValueChange={onValueChange}
      categories={categories}
      accountType={accountType}
      onRefresh={onRefresh}
      onAddCategory={onAddCategory}
    />
  );
};