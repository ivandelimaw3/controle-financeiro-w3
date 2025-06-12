
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';
import { X, Plus } from 'lucide-react';

interface InvestmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: any) => Promise<void>;
  onAddInstitution: (name: string) => Promise<any>;
  investment?: Investment;
  institutions: InvestmentInstitution[];
  types: InvestmentType[];
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddInstitution,
  investment,
  institutions,
  types
}) => {
  const [formData, setFormData] = useState({
    name: investment?.name || '',
    institution_id: investment?.institution_id?.toString() || '',
    type_id: investment?.type_id?.toString() || '',
    invested_amount: investment?.invested_amount?.toString() || '',
    current_value: investment?.current_value?.toString() || '',
    yield_percentage: investment?.yield_percentage?.toString() || '',
    purchase_date: investment?.purchase_date || ''
  });
  
  const [newInstitution, setNewInstitution] = useState('');
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name: formData.name,
        institution_id: parseInt(formData.institution_id),
        type_id: parseInt(formData.type_id),
        invested_amount: parseFloat(formData.invested_amount),
        current_value: parseFloat(formData.current_value),
        yield_percentage: formData.yield_percentage ? parseFloat(formData.yield_percentage) : null,
        purchase_date: formData.purchase_date
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = async () => {
    if (!newInstitution.trim()) return;
    
    try {
      const institution = await onAddInstitution(newInstitution);
      setFormData({ ...formData, institution_id: institution.id.toString() });
      setNewInstitution('');
      setShowNewInstitution(false);
    } catch (error) {
      console.error('Erro ao adicionar instituição:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{investment ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: CDB Banco XYZ"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Instituição</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewInstitution(!showNewInstitution)}
              >
                <Plus size={16} />
                Nova
              </Button>
            </div>
            
            {showNewInstitution ? (
              <div className="flex gap-2">
                <Input
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="Nome da instituição"
                />
                <Button type="button" onClick={handleAddInstitution} size="sm">
                  Adicionar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewInstitution(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Select
                value={formData.institution_id}
                onValueChange={(value) => setFormData({ ...formData, institution_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a instituição" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Tipo de Investimento</Label>
            <Select
              value={formData.type_id}
              onValueChange={(value) => setFormData({ ...formData, type_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name} ({type.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invested_amount">Valor Investido</Label>
              <Input
                id="invested_amount"
                type="number"
                step="0.01"
                value={formData.invested_amount}
                onChange={(e) => setFormData({ ...formData, invested_amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="current_value">Valor Atual</Label>
              <Input
                id="current_value"
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yield_percentage">Rentabilidade (%)</Label>
              <Input
                id="yield_percentage"
                type="number"
                step="0.01"
                value={formData.yield_percentage}
                onChange={(e) => setFormData({ ...formData, yield_percentage: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Data da Compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : investment ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
