import React, { useState } from 'react';
import { Plus, CreditCard, AlertCircle, Search, Edit, Trash2, Wallet, CheckCircle, Calendar, Building2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCardForm } from '@/components/CreditCards/CreditCardForm';
import { useCreditCardsData, CreditCard as CreditCardType, CreditCardInput } from '@/hooks/useCreditCardsData';
import { useToast } from '@/hooks/use-toast';

const CartoesCredito = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');

  const { toast } = useToast();

  const {
    creditCards,
    isLoading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isCreating,
    isUpdating
  } = useCreditCardsData();

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiryToMonthYear = (date: string) => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{4}$/.test(date)) return date;
    return date;
  };

  const getStatusLabel = (value: number) => {
    return value > 0 ? 'Com Débito' : 'Sem Débito';
  };

  const getStatusColor = (value: number) => {
    return value > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  // Cálculos para os cards de resumo
  const totalCards = creditCards.length;
  const cardsWithDebt = creditCards.filter(card => card.current_value > 0).length;
  const totalDebt = creditCards.reduce((sum, card) => sum + card.current_value, 0);
  const uniqueBanks = new Set(creditCards.map(card => card.bank_name)).size;

  // Filtros
  const filteredCards = creditCards.filter(card => {
    const matchesSearch = card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.card_number.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'withDebt' && card.current_value > 0) ||
                         (statusFilter === 'noDebt' && card.current_value <= 0);
    
    const matchesBank = bankFilter === 'all' || card.bank_name === bankFilter;
    
    return matchesSearch && matchesStatus && matchesBank;
  });

  const handleCreateCard = async (cardData: CreditCardInput) => {
    await createCreditCard(cardData);
    setShowCardForm(false);
    toast({
      title: "Cartão criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateCard = async (cardData: CreditCardInput) => {
    if (editingCard) {
      await updateCreditCard({ id: editingCard.id, ...cardData });
      setEditingCard(undefined);
      setShowCardForm(false);
      toast({
        title: "Cartão atualizado com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      await deleteCreditCard(id);
      toast({
        title: "Cartão excluído com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleEditCard = (card: CreditCardType) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const closeCardForm = () => {
    setShowCardForm(false);
    setEditingCard(undefined);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando cartões...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar cartões. Tente novamente.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestão de Cartões de Crédito</h1>
              <p className="text-slate-600 mt-1">
                Gerencie seus cartões de crédito e controle seus gastos
              </p>
            </div>
            <Button
              onClick={() => setShowCardForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Cartões</p>
                <p className="text-2xl font-bold text-slate-800">{totalCards}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Sem Débito</p>
                <p className="text-2xl font-bold text-slate-800">{totalCards - cardsWithDebt}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Instituições</p>
                <p className="text-2xl font-bold text-slate-800">{uniqueBanks}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Débito Total</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalDebt)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar cartões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="withDebt">Com Débito</SelectItem>
                <SelectItem value="noDebt">Sem Débito</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Bancos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Bancos</SelectItem>
                {Array.from(new Set(creditCards.map(card => card.bank_name))).map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Cartões */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Cartão</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Banco</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Número</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Validade</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Vencimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Valor Atual</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Criado em</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card, index) => (
                  <tr key={card.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{card.card_name}</p>
                          <p className="text-sm text-slate-500">Cartão de Crédito</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {card.bank_name}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-800">{formatCardNumber(card.card_number)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-800">{formatExpiryToMonthYear(card.expiry_date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(card.due_date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${card.current_value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(card.current_value)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${card.current_value > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className={`text-sm ${getStatusColor(card.current_value)}`}>
                          {getStatusLabel(card.current_value)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(card.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCard(card)}
                          className="text-slate-600 hover:text-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCards.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                {searchTerm || statusFilter !== 'all' || bankFilter !== 'all' 
                  ? 'Nenhum cartão encontrado' 
                  : 'Nenhum cartão cadastrado'}
              </p>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== 'all' || bankFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Adicione seu primeiro cartão de crédito para começar.'}
              </p>
              {!searchTerm && statusFilter === 'all' && bankFilter === 'all' && (
                <Button
                  onClick={() => setShowCardForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dialog para Formulário de Cartão */}
        <Dialog open={showCardForm} onOpenChange={closeCardForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
              </DialogTitle>
            </DialogHeader>
            <CreditCardForm
              card={editingCard}
              onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
              onCancel={closeCardForm}
              isLoading={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CartoesCredito;