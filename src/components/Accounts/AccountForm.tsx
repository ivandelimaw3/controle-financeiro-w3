import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
  bank_id?: number;
  card_id?: number;
  payment_source?: 'bank' | 'card';
  payment_source_id?: number;
}

interface AccountFormProps {
  formData: Account;
  setFormData: React.Dispatch<React.SetStateAction<Account>>;
  categories: string[];
  onAddCategory: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  setFormData,
  categories,
  onAddCategory,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const { categories: categoriesFromDB, loading: categoriesLoading, addCategory } = useCategoriesData();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'receita' | 'despesa'>('despesa');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  
  // --- CORREÇÃO APLICADA AQUI ---
  // O componente agora aguarda os dados dos bancos e cartões.
  const { banksOptions, isLoading: banksLoading } = useBanksOptions();
  const { cardsOptions, isLoading: cardsLoading } = useCardsOptions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSourceChange = (value: 'bank' | 'card' | '') => {
    setFormData(prev => ({
      ...prev,
      payment_source: value || undefined,
      payment_source_id: undefined,
      bank_id: undefined,
      card_id: undefined,
    }));
  };

  const handleNewCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() === '') return;
    await addCategory({ name: newCategoryName, type: newCategoryType, color: newCategoryColor });
    setNewCategoryName('');
    setNewCategoryType('despesa');
    setNewCategoryColor('#000000');
    setIsNewCategoryModalOpen(false);
  };

  const isFormValid = formData.description && formData.amount > 0 && formData.dueDate;

  const categoriesFilteredByType = categoriesFromDB?.filter(cat => cat.type === formData.type);
  
  const isLoadingOptions = banksLoading || cardsLoading;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Switch
          id="account-type-switch"
          checked={formData.type === 'receita'}
          onCheckedChange={(checked) => handleSelectChange('type', checked ? 'receita' : 'despesa')}
        />
        <Label htmlFor="account-type-switch" className="text-slate-700 font-semibold">
          {formData.type === 'receita' ? 'Receita' : 'Despesa'}
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Ex: Aluguel"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0,00"
            required
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vencimento</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            onValueChange={(value) => handleSelectChange('category', value)}
            value={formData.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriesFilteredByType?.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
              <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full text-left justify-start text-blue-600">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNewCategorySubmit} className="space-y-4">
                    <Input
                      placeholder="Nome da Categoria"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                    <Select onValueChange={(value) => setNewCategoryType(value as 'receita' | 'despesa')} value={newCategoryType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                    />
                    <Button type="submit">Salvar</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) => handleSelectChange('status', value)}
            value={formData.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="qtd_parcelas">Quantidade de Parcelas</Label>
          <Input
            id="qtd_parcelas"
            name="qtd_parcelas"
            type="number"
            value={formData.qtd_parcelas}
            onChange={handleInputChange}
            min="1"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="payment_source">Fonte de Pagamento</Label>
        <Select
          onValueChange={handlePaymentSourceChange}
          value={formData.payment_source || ''}
          disabled={isLoadingOptions}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingOptions ? 'Carregando...' : 'Selecione a fonte'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Conta Bancária</SelectItem>
            <SelectItem value="card">Cartão de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.payment_source === 'bank' && (
        <div className="space-y-2">
          <Label htmlFor="payment_source_id">Conta Bancária</Label>
          <Select
            onValueChange={(value) => handleSelectChange('payment_source_id', parseInt(value))}
            value={formData.payment_source_id?.toString() || ''}
            disabled={banksLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={banksLoading ? 'Carregando...' : 'Selecione a conta'} />
            </SelectTrigger>
            <SelectContent>
              {banksOptions.map(bank => (
                <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.payment_source === 'card' && (
        <div className="space-y-2">
          <Label htmlFor="payment_source_id">Cartão de Crédito</Label>
          <Select
            onValueChange={(value) => handleSelectChange('payment_source_id', parseInt(value))}
            value={formData.payment_source_id?.toString() || ''}
            disabled={cardsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={cardsLoading ? 'Carregando...' : 'Selecione o cartão'} />
            </SelectTrigger>
            <SelectContent>
              {cardsOptions.map(card => (
                <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={!isFormValid || isLoadingOptions}>
          {isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}
          {(banksLoading || cardsLoading) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </form>
  );
};
