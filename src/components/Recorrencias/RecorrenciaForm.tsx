import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recorrencia } from '@/hooks/useRecorrenciasData';
import { calcularProximaExecucao } from '@/lib/dateUtils';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useBanksData } from '@/hooks/useBanksData';
import { usePaymentMethodsData } from '@/hooks/usePaymentMethodsData';

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
  const { paymentMethods } = usePaymentMethodsData();
  const [formData, setFormData] = useState({
    tipo: initialData?.tipo || 'receita' as 'receita' | 'despesa',
    titulo: initialData?.titulo || '',
    valor: initialData?.valor || 0,
    categoria: initialData?.categoria || '',
    data_inicio: initialData?.data_inicio || new Date().toISOString().split('T')[0],
    frequencia: initialData?.frequencia || 'mensal' as 'mensal' | 'semanal' | 'anual',
    bank_id: initialData?.bank_id || null,
    payment_method_id: initialData?.payment_method_id || '',
    installments: initialData?.installments || 1,
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.categoria || formData.valor <= 0) {
      return;
    }

    setLoading(true);
    
    const proximaExecucao = calcularProximaExecucao(formData.data_inicio, formData.frequencia);
    
    const success = await onSubmit({
      ...formData,
      proxima_execucao: proximaExecucao
    });
    
    if (success && !isEditing) {
      setFormData({
        tipo: 'receita',
        titulo: '',
        valor: 0,
        categoria: '',
        data_inicio: new Date().toISOString().split('T')[0],
        frequencia: 'mensal',
        bank_id: null,
        payment_method_id: '',
        installments: 1,
      });
    }
    
    setLoading(false);
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.tipo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Recorrência' : 'Nova Recorrência'}</CardTitle>
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

            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

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

            <div>
              <Label htmlFor="bank_id">Banco de Origem</Label>
              <Select
                value={formData.bank_id?.toString() || ''}
                onValueChange={(value) => 
                  setFormData({ ...formData, bank_id: value ? parseInt(value) : null })
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
              <Select
                value={formData.payment_method_id}
                onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="installments">Número de Parcelas</Label>
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Recorrência'}
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