import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recorrencia } from '@/hooks/useRecorrenciasData';
import { format } from 'date-fns';
import { useBanksData } from '@/hooks/useBanksData';
import { usePaymentMethodsData } from '@/hooks/usePaymentMethodsData';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PaymentMethodForm } from '@/components/PaymentMethods/PaymentMethodForm';
import { Plus } from 'lucide-react';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { calcularProximaExecucao } from '@/lib/dateUtils';

interface RecorrenciaFormProps {
  onSubmit: (data: Omit<Recorrencia, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onCancel?: () => void;
  initialData?: Partial<Recorrencia>;
  isEditing?: boolean;
}

export const RecorrenciaForm: React.FC<RecorrenciaFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const { categories } = useCategoriesData();
  const { banks } = useBanksData();
  const { paymentMethods, createPaymentMethod, fetchPaymentMethods } = usePaymentMethodsData();
  const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Recorrencia>>({
    titulo: initialData?.titulo || '',
    valor: initialData?.valor || 0,
    categoria: initialData?.categoria || '',
    tipo: initialData?.tipo || 'despesa',
    frequencia: initialData?.frequencia || 'mensal',
    data_inicio: initialData?.data_inicio || format(new Date(), 'yyyy-MM-dd'),
    bank_id: initialData?.bank_id || undefined,
    payment_method_id: initialData?.payment_method_id || undefined,
    installments: initialData?.installments || 1
  });

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

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Parse do valor digitado
    const numericValue = parseCurrencyInput(inputValue);
    
    // Atualiza o estado com o valor numérico
    setFormData({ ...formData, valor: numericValue });
  };

  const handleCreatePaymentMethod = async (data: Omit<any, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const success = await createPaymentMethod(data);
    if (success) {
      setShowPaymentMethodForm(false);
      fetchPaymentMethods();
    }
    return success;
  };
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.categoria || !formData.valor || formData.valor <= 0) {
      return;
    }

    setLoading(true);
    
    const proximaExecucao = calcularProximaExecucao(formData.data_inicio!, formData.frequencia!);
    
    const success = await onSubmit({
      ...formData,
      proxima_execucao: proximaExecucao
    } as Omit<Recorrencia, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    
    if (success && !isEditing) {
      setFormData({
        titulo: '',
        valor: 0,
        categoria: '',
        tipo: 'despesa',
        frequencia: 'mensal',
        data_inicio: format(new Date(), 'yyyy-MM-dd'),
        bank_id: undefined,
        payment_method_id: undefined,
        installments: 1
      });
    }
    
    setLoading(false);
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.tipo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Conta Recorrente' : 'Nova Conta Recorrente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'receita' | 'despesa') => 
                  setFormData({ ...formData, tipo: value, categoria: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Salário, Aluguel..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor Total</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
                <Input
                  id="valor"
                  type="text"
                  value={formatCurrencyInput(formData.valor || 0)}
                  onChange={handleValorChange}
                  className="pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                max="60"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequencia">Frequência</Label>
              <Select
                value={formData.frequencia}
                onValueChange={(value: 'mensal' | 'semanal' | 'anual') => 
                  setFormData({ ...formData, frequencia: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="valor_parcela">Valor da Parcela</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
                <Input
                  id="valor_parcela"
                  type="text"
                  value={formatCurrencyInput((formData.valor || 0) / (formData.installments || 1))}
                  className="pl-10 bg-slate-50"
                  placeholder="0,00"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_id">Banco de Origem</Label>
              <Select
                value={formData.bank_id?.toString() || ''}
                onValueChange={(value) => 
                  setFormData({ ...formData, bank_id: value ? parseInt(value) : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.nickname || bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method_id">Método de Pagamento</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.payment_method_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um método de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} ({method.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showPaymentMethodForm} onOpenChange={setShowPaymentMethodForm}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <PaymentMethodForm
                      onSubmit={handleCreatePaymentMethod}
                      onCancel={() => setShowPaymentMethodForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Conta Recorrente'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};