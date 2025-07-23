// CartoesPage-banks.tsx - Página adaptada para a tabela banks
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  Building2, 
  DollarSign,
  RefreshCw,
  Hash,
  User
} from 'lucide-react';
import { useCartoes } from './useCartoes-banks';
import { CartaoForm } from './CartaoForm-banks';
import type { CartaoCredito, CartaoFilters, SortOptions } from './types-banks';

export const CartoesPage: React.FC = () => {
  const {
    cartoes,
    banks,
    loading,
    error,
    fetchCartoes,
    createCartao,
    updateCartao,
    deleteCartao
  } = useCartoes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CartaoFilters>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'created_at',
    direction: 'desc'
  });
  const [selectedCartao, setSelectedCartao] = useState<CartaoCredito | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar cartões baseado na busca e filtros
  const filteredCartoes = cartoes.filter(cartao => {
    const matchesSearch = cartao.nome_cartao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.numero_cartao.includes(searchTerm) ||
                         cartao.bank?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cartao.bank?.nickname?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Formatar número do cartão para exibição
  const formatCardNumber = (numero: string): string => {
    return numero.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Verificar se cartão está próximo do vencimento
  const isNearExpiry = (dataValidade: string): boolean => {
    const today = new Date();
    const expiry = new Date(dataValidade);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0; // Próximo de vencer em 90 dias
  };

  // Verificar se cartão está vencido
  const isExpired = (dataValidade: string): boolean => {
    const today = new Date();
    const expiry = new Date(dataValidade);
    return expiry < today;
  };

  // Formatar exibição da conta bancária
  const formatBankDisplay = (bank: any): string => {
    if (!bank) return 'Conta não encontrada';
    return `${bank.name} - ${bank.nickname || bank.account_type}`;
  };

  // Manipular criação de cartão
  const handleCreateCartao = async (formData: any) => {
    const success = await createCartao(formData);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  // Manipular edição de cartão
  const handleUpdateCartao = async (formData: any) => {
    if (!selectedCartao) return false;
    
    const success = await updateCartao({
      id: selectedCartao.id,
      ...formData
    });
    
    if (success) {
      setShowForm(false);
      setSelectedCartao(null);
    }
    return success;
  };

  // Manipular exclusão de cartão
  const handleDeleteCartao = async (cartaoId: string) => {
    await deleteCartao(cartaoId);
  };

  // Aplicar filtros
  const applyFilters = () => {
    fetchCartoes(filters, sortOptions);
    setShowFilters(false);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({});
    setSortOptions({ field: 'created_at', direction: 'desc' });
    fetchCartoes();
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Meus Cartões de Crédito
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões de crédito vinculados às suas contas bancárias
          </p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCartao(null)} disabled={banks.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCartao ? 'Editar Cartão' : 'Novo Cartão'}
              </DialogTitle>
              <DialogDescription>
                {selectedCartao 
                  ? 'Atualize as informações do cartão selecionado'
                  : 'Adicione um novo cartão de crédito vinculado a uma de suas contas bancárias'
                }
              </DialogDescription>
            </DialogHeader>
            <CartaoForm
              cartao={selectedCartao}
              banks={banks}
              onSubmit={selectedCartao ? handleUpdateCartao : handleCreateCartao}
              onCancel={() => {
                setShowForm(false);
                setSelectedCartao(null);
              }}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerta se não há contas bancárias */}
      {banks.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Nenhuma conta bancária encontrada</span>
            </div>
            <p className="text-yellow-700 mt-1">
              Você precisa cadastrar pelo menos uma conta bancária antes de criar cartões de crédito.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Barra de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, número ou conta bancária..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtros</DialogTitle>
                <DialogDescription>
                  Configure os filtros para refinar sua busca
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Conta Bancária</label>
                  <Select
                    value={filters.bank_id?.toString() || ''}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      bank_id: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as contas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as contas</SelectItem>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          {formatBankDisplay(bank)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Dia do Pagamento</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Qualquer dia"
                    value={filters.data_pagamento || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      data_pagamento: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Valor Mínimo</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={filters.valor_min || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        valor_min: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor Máximo</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="R$ 999.999,99"
                      value={filters.valor_max || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        valor_max: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={applyFilters} className="flex-1">
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => fetchCartoes()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Cartões</p>
                <p className="text-2xl font-bold">{cartoes.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(cartoes.reduce((sum, cartao) => sum + cartao.valor_atual, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos ao Vencimento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {cartoes.filter(cartao => isNearExpiry(cartao.data_validade)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {cartoes.filter(cartao => isExpired(cartao.data_validade)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de cartões */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando cartões...</span>
        </div>
      ) : filteredCartoes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cartão encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Tente ajustar os filtros ou termo de busca'
                : banks.length === 0
                ? 'Cadastre uma conta bancária primeiro para poder criar cartões'
                : 'Comece adicionando seu primeiro cartão de crédito'
              }
            </p>
            {!searchTerm && Object.keys(filters).length === 0 && banks.length > 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cartão
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCartoes.map((cartao) => (
            <Card key={cartao.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{cartao.nome_cartao}</CardTitle>
                  <div className="flex gap-1">
                    {isExpired(cartao.data_validade) && (
                      <Badge variant="destructive">Vencido</Badge>
                    )}
                    {isNearExpiry(cartao.data_validade) && !isExpired(cartao.data_validade) && (
                      <Badge variant="secondary">Próximo ao vencimento</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {formatCardNumber(cartao.numero_cartao)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{formatBankDisplay(cartao.bank)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span>Ag: {cartao.bank?.agency} / Conta: {cartao.bank?.account_number}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Vence em: {formatDate(cartao.data_validade)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Pagamento dia: {cartao.data_pagamento}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    {formatCurrency(cartao.valor_atual)}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCartao(cartao);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o cartão "{cartao.nome_cartao}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCartao(cartao.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

