import React from 'react';
import { Calendar, DollarSign, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from './CategorySelect';
import { Category } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string; // Novo campo para data da compra
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
  bank_id?: number;
  payment_source?: 'bank'; // Alterado para apenas 'bank'
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
  const { banksOptions, isLoading: banksLoading } = useBanksOptions();
  const { cardsOptions, loading: cardsLoading } = useCardsOptions();

  // DEBUG: Log dos dados dos cartões
  console.log('AccountForm: cardsOptions:', cardsOptions);
  console.log('AccountForm: formData.payment_source:', formData.payment_source);
  console.log('AccountForm: formData.payment_source_id:', formData.payment_source_id);

  // Verificação de segurança
  if (!formData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro: Dados do formulário não encontrados</p>
        <Button onClick={onCancel} className="mt-4">
          Fechar
        </Button>
      </div>
    );
  }

  const formatCurrencyInput = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined || value === 0) {
      return '';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrencyInput = (inputValue: string): number => {
    if (!inputValue) return 0;
    
    // Remove todos os caracteres que não são dígitos
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Se não há dígitos, retorna 0
    if (!digitsOnly) return 0;
    
    // Converte para número dividindo por 100 (para considerar os centavos)
    const numericValue = parseInt(digitsOnly) / 100;
    
    return numericValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Parse do valor digitado
    const numericValue = parseCurrencyInput(inputValue);
    
    // Atualiza o estado com o valor numérico
    setFormData({ ...formData, amount: numericValue });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleTypeChange = (value: 'receita' | 'despesa') => {
    setFormData({ 
      ...formData, 
      type: value,
      category: '' // Reset category when changing type
    });
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
    const value = parseInt(e.target.value) || 1;
    setFormData({ ...formData, qtd_parcelas: value });
  };

  const handlePaymentSourceChange = (value: 'bank') => {
    setFormData({ 
      ...formData, 
      payment_source: value,
      payment_source_id: undefined, // Reset source ID when changing source type
      payment_source_name: undefined // Reset source name when changing source type
    });
  };

  const handlePaymentSourceIdChange = (value: string) => {
    const sourceId = parseInt(value);
    let sourceName = '';

    // Obter o nome da fonte selecionada
    if (formData.payment_source === 'bank') {
      const bank = banksOptions.find(b => b.id === value);
      sourceName = bank?.name || '';
    }

    console.log('Selecionada fonte:', formData.payment_source, 'ID:', sourceId, 'Nome:', sourceName);

    setFormData({ 
      ...formData, 
      payment_source_id: sourceId,
      payment_source_name: sourceName // Adicionar o nome da fonte
    });
  };

  // Função de validação e submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação da fonte de pagamento
    if (formData.payment_source && !formData.payment_source_id) {
      alert('Por favor, selecione um banco.');
      return;
    }
    
    // Se não há fonte selecionada, limpar os campos para evitar erro no banco
    if (!formData.payment_source) {
      setFormData({
        ...formData,
        payment_source: undefined,
        payment_source_id: undefined,
        payment_source_name: undefined
      });
    }
    
    console.log('Dados enviados:', formData);
    
    // Continuar com o submit
    onSubmit(e);
  };

  // Obter o nome da fonte de pagamento selecionada
  const getSelectedSourceName = () => {
    if (!formData.payment_source_id) return '';
    
    if (formData.payment_source === 'bank') {
      const bank = banksOptions.find(b => b.id === formData.payment_source_id?.toString());
      return bank?.name || '';
    }
    
    return '';
  };

  // Obter o saldo atual da fonte de pagamento
  const getSelectedSourceBalance = () => {
    if (!formData.payment_source_id) return null;
    
    if (formData.payment_source === 'bank') {
      const bank = banksOptions.find(b => b.id === formData.payment_source_id?.toString());
      return bank ? `Saldo: R$ ${formatCurrencyInput(bank.balance)}` : null;
    }
    
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description" className="text-slate-700">Descrição</Label>
        <Input
          id="description"
          type="text"
          value={formData.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Ex: Aluguel, Salário..."
          className="mt-1"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount" className="text-slate-700">Valor Total</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
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
          <Label htmlFor="type" className="text-slate-700">Tipo</Label>
          <Select
            value={formData.type || 'despesa'}
            onValueChange={handleTypeChange}
          >
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

      {/* Fonte do Pagamento - Restringido apenas para Banco */}
      <div>
        <Label htmlFor="payment_source" className="text-slate-700">
          Fonte do Pagamento <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-1 gap-4 mt-1">
          {/* Primeiro select - Restrito apenas para Banco */}
          <Select
            value={formData.payment_source || ''}
            onValueChange={handlePaymentSourceChange}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">
                <div className="flex items-center gap-2">
                  <Building2 size={16} />
                  <span>Banco</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Segundo select - Seleção do banco específico */}
          {formData.payment_source === 'bank' && (
            <Select
              value={formData.payment_source_id?.toString() || ''}
              onValueChange={handlePaymentSourceIdChange}
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
          )}
        </div>
        
        {/* Exibir informações da fonte selecionada - Mostra nome e saldo em uma única linha */}
        {formData.payment_source_id && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {getSelectedSourceName()}
              </span>
              {getSelectedSourceBalance() && (
                <span className="text-sm text-slate-600">
                  {getSelectedSourceBalance()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <CategorySelect
        value={formData.category || ''}
        onValueChange={handleCategoryChange}
        categories={categories || []}
        accountType={formData.type || 'despesa'}
        onRefresh={onRefreshCategories}
        onAddCategory={onAddCategory}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataConta" className="text-slate-700">Data da Conta</Label>
          <div className="relative mt-1">
            <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
            <Input
              id="dataConta"
              type="date"
              value={formData.dataConta || ''}
              onChange={handleDataContaChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dueDate" className="text-slate-700">Vencimento</Label>
          <div className="relative mt-1">
            <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={handleDateChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="qtd_parcelas" className="text-slate-700">Parcelas</Label>
        <Input
          id="qtd_parcelas"
          type="number"
          min="1"
          max="60"
          value={formData.qtd_parcelas || 1}
          onChange={handleParcellasChange}
          className="mt-1"
          placeholder="1"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
        >
          {isEditing ? 'Atualizar' : 
           (formData.qtd_parcelas && formData.qtd_parcelas > 1) ? 
           `Criar ${formData.qtd_parcelas} Parcelas` : 
           'Criar'}
        </Button>
      </div>
    </form>
  );
};
