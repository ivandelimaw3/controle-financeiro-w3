
import React, { useState, useEffect } from 'react';
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
  onAddType: (name: string, category: string) => Promise<any>;
  investment?: Investment;
  institutions: InvestmentInstitution[];
  types: InvestmentType[];
}

const initialFormData = {
  name: '',
  institution_id: '',
  type_id: '',
  invested_amount: '',
  current_value: '',
  yield_percentage: '',
  purchase_date: '',
  maturity_date: '',
  investor_name: ''
};

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAddInstitution,
  onAddType,
  investment,
  institutions,
  types
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [newInstitution, setNewInstitution] = useState('');
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [newType, setNewType] = useState({ name: '', category: '' });
  const [showNewType, setShowNewType] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or when investment changes
  useEffect(() => {
    if (isOpen) {
      if (investment) {
        // Editing existing investment
        setFormData({
          name: investment.name || '',
          institution_id: investment.institution_id?.toString() || '',
          type_id: investment.type_id?.toString() || '',
          invested_amount: investment.invested_amount?.toString() || '',
          current_value: investment.current_value?.toString() || '',
          yield_percentage: investment.yield_percentage?.toString() || '',
          purchase_date: investment.purchase_date || '',
          maturity_date: investment.maturity_date || '',
          investor_name: investment.investor_name || ''
        });
      } else {
        // Creating new investment - reset to initial state
        setFormData(initialFormData);
      }
      // Reset other form states
      setNewInstitution('');
      setShowNewInstitution(false);
      setNewType({ name: '', category: '' });
      setShowNewType(false);
    }
  }, [isOpen, investment]);

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
        purchase_date: formData.purchase_date,
        maturity_date: formData.maturity_date || null,
        investor_name: formData.investor_name || null
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

  const handleAddType = async () => {
    if (!newType.name.trim() || !newType.category.trim()) return;
    
    try {
      const type = await onAddType(newType.name, newType.category);
      setFormData({ ...formData, type_id: type.id.toString() });
      setNewType({ name: '', category: '' });
      setShowNewType(false);
    } catch (error) {
      console.error('Erro ao adicionar tipo:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{investment ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investor_name">Nome do Investidor</Label>
              <Input
                id="investor_name"
                value={formData.investor_name}
                onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
                placeholder="Nome do investidor"
              />
            </div>

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
            <div className="flex items-center justify-between mb-2">
              <Label>Tipo de Investimento</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewType(!showNewType)}
              >
                <Plus size={16} />
                Novo
              </Button>
            </div>
            
            {showNewType ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    placeholder="Nome do tipo"
                  />
                  <Select
                    value={newType.category}
                    onValueChange={(value) => setNewType({ ...newType, category: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                      <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                      <SelectItem value="fundos">Fundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleAddType} size="sm" className="flex-1">
                    Adicionar Tipo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewType(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
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

          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <Label htmlFor="maturity_date">Vencimento</Label>
              <Input
                id="maturity_date"
                type="date"
                value={formData.maturity_date}
                onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                placeholder="Data de vencimento"
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
