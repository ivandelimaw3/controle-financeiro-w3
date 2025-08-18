import React from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from './CategorySelect';
import { Category } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
  bank_id?: number;
  payment_source?: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

interface AccountFormProps {
  formData: Account;
  setFormData: React.Dispatch<React.SetStateAction<Account>>;
  categories: Category[];
  onRefreshCategories: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  setFormData,
  categories,
  onRefreshCategories,
  onAddCategory,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const { banksOptions } = useBanksOptions();

  // Sempre fixa como banco
  React.useEffect(() => {
    if (formData.payment_source !== 'bank') {
      setFormData(prev => ({ ...prev, payment_source: 'bank' }));
    }
  }, [formData.payment_source, setFormData]);

  const formatCurrencyInput = (value: number): string => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const numericValue = digitsOnly ? parseInt(digitsOnly) / 100 : 0;
    setFormData({ ...formData, amount: numericValue });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleTypeChange = (value: 'receita' | 'despesa') => {
    setFormData({ ...formData, type: value, category: '' });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, dueDate: e.target.value });
  };

  const handleDataContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, dataConta: e.target.value });
  };

  const handleParcellasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, qtd_parcelas: parseInt(e.target.value) || 1 });
  };

  const handleBankChange = (value: string) => {
    const bank = banksOptions.find(b => b.id === value);
    setFormData({
      ...formData,
      payment_source_id: parseInt(value),
      payment_source_name: bank?.name || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payment_source_id) {
      alert('Por favor, selecione um banco.');
      return;
    }
    onSubmit(e);
  };

  const getSelectedBankBalance = () => {
    const bank = banksOptions.find(b => b.id === formData.payment_source_id?.toString());
    return bank ? `Saldo: R$ ${formatCurrencyInput(bank.balance)}` : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          type="text"
          value={formData.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Ex: Aluguel, Salário..."
          required
        />
      </div>

      {/* Valor e Tipo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Valor Total</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-3 text-slate-400">R$</span>
            <Input
              id="amount"
              type="text"
              value={formatCurrencyInput(formData.amount || 0)}
              onChange={handleAmountChange}
              className="pl-10"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type || 'despesa'} onValueChange={handleTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Banco */}
      <div>
        <Label htmlFor="bank">Banco <span className="text-red-500">*</span></Label>
        <Select
          value={formData.payment_source_id?.toString() || ''}
          onValueChange={handleBankChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o banco" />
          </SelectTrigger>
          <SelectContent>
            {banksOptions.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Nome + saldo */}
        {formData.payment_source_id && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{formData.payment_source_name}</span>
              <span className="text-sm text-slate-600">{getSelectedBankBalance()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Categoria */}
      <CategorySelect
        value={formData.category || ''}
        onValueChange={handleCategoryChange}
        categories={categories || []}
        accountType={formData.type || 'despesa'}
        onRefresh={onRefreshCategories}
        onAddCategory={onAddCategory}
      />

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataConta">Data da Conta</Label>
          <Input
            id="dataConta"
            type="date"
            value={formData.dataConta || ''}
            onChange={handleDataContaChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Vencimento</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ''}
            onChange={handleDateChange}
            required
          />
        </div>
      </div>

      {/* Parcelas */}
      <div>
        <Label htmlFor="qtd_parcelas">Parcelas</Label>
        <Input
          id="qtd_parcelas"
          type="number"
          min="1"
          max="60"
          value={formData.qtd_parcelas || 1}
          onChange={handleParcellasChange}
          placeholder="1"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-green-500">
          {isEditing ? 'Atualizar' : 
           (formData.qtd_parcelas && formData.qtd_parcelas > 1) 
             ? `Criar ${formData.qtd_parcelas} Parcelas` 
             : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
