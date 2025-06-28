
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ExpiringAccountsAlert } from '@/components/Reports/ExpiringAccountsAlert';
import { TrendingUp, TrendingDown, Calendar, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccounts } from '@/contexts/AccountsContext';

const Relatorios: React.FC = () => {
  const { accounts, getTotalReceitas, getTotalDespesas, getSaldo } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');
  const [yearFilter, setYearFilter] = useState('todos');

  // Gerar lista de anos disponíveis
  const availableYears = Array.from(new Set(
    accounts.map(account => new Date(account.dueDate).getFullYear())
  )).sort((a, b) => b - a);

  // Filtrar contas baseado nos filtros
  const filteredAccounts = accounts.filter(account => {
    const accountDate = new Date(account.dueDate);
    const accountMonth = accountDate.getMonth() + 1;
    const accountYear = accountDate.getFullYear();

    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
    const matchesType = typeFilter === 'todos' || account.type === typeFilter;
    const matchesMonth = monthFilter === 'todos' || accountMonth === parseInt(monthFilter);
    const matchesYear = yearFilter === 'todos' || accountYear === parseInt(yearFilter);
    
    return matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear;
  });

  // Calcular total filtrado baseado no tipo selecionado (apenas para contas pagas/recebidas)
  const getFilteredTotal = () => {
    if (typeFilter === 'receita') {
      return filteredAccounts
        .filter(account => account.type === 'receita' && account.status === 'recebido')
        .reduce((sum, account) => sum + account.amount, 0);
    } else if (typeFilter === 'despesa') {
      return filteredAccounts
        .filter(account => account.type === 'despesa' && account.status === 'pago')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    }
    return null;
  };

  // Calcular total baseado no status selecionado
  const getStatusTotal = () => {
    if (statusFilter === 'pendente') {
      return filteredAccounts
        .filter(account => account.status === 'pendente')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    } else if (statusFilter === 'pago') {
      return filteredAccounts
        .filter(account => account.status === 'pago')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
    } else if (statusFilter === 'recebido') {
      return filteredAccounts
        .filter(account => account.status === 'recebido')
        .reduce((sum, account) => sum + account.amount, 0);
    }
    return null;
  };

  // Calcular saldo da seleção de mês/ano (apenas para contas pagas/recebidas)
  const getFilteredBalance = () => {
    if (monthFilter !== 'todos' || yearFilter !== 'todos') {
      const receitas = filteredAccounts
        .filter(account => account.type === 'receita' && account.status === 'recebido')
        .reduce((sum, account) => sum + account.amount, 0);
      
      const despesas = filteredAccounts
        .filter(account => account.type === 'despesa' && account.status === 'pago')
        .reduce((sum, account) => sum + Math.abs(account.amount), 0);
      
      return receitas - despesas;
    }
    return null;
  };

  const filteredTotal = getFilteredTotal();
  const statusTotal = getStatusTotal();
  const filteredBalance = getFilteredBalance();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'recebido':
        return 'Recebido';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Relatórios</h1>
            <p className="text-slate-600">Análise detalhada das suas finanças</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
            <Download size={20} className="mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Alerta de Despesas Vencendo */}
        <ExpiringAccountsAlert />

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total de Receitas</h3>
                <p className="text-2xl font-bold text-green-600">R$ {getTotalReceitas().toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">+12% vs mês anterior</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total de Despesas</h3>
                <p className="text-2xl font-bold text-red-600">R$ {getTotalDespesas().toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">+5% vs mês anterior</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Saldo do Período</h3>
                <p className={`text-2xl font-bold ${getSaldo() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {getSaldo().toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">-18% vs mês anterior</p>
          </div>
        </div>

        {/* Planilha de Contas */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Todas as Contas</h3>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Pesquisar contas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de Data */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar size={16} className="mr-2" />
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Meses</SelectItem>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar size={16} className="mr-2" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Anos</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de Total por Status */}
            {statusTotal !== null && (
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Total de Contas {statusFilter === 'pendente' ? 'Pendentes' : statusFilter === 'pago' ? 'Pagas' : 'Recebidas'}:
                  </span>
                  <span className={`text-xl font-bold ${
                    statusFilter === 'recebido' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    R$ {statusTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  * Total filtrado por status: {statusFilter}
                </div>
              </div>
            )}

            {/* Campo de Total Filtrado por Tipo */}
            {filteredTotal !== null && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Total de {typeFilter === 'receita' ? 'Receitas Recebidas' : 'Despesas Pagas'} Filtradas:
                  </span>
                  <span className={`text-xl font-bold ${
                    typeFilter === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {filteredTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  * Não inclui contas pendentes no cálculo
                </div>
              </div>
            )}

            {/* Campo de Saldo da Seleção de Mês/Ano */}
            {filteredBalance !== null && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Saldo do Período Selecionado:
                  </span>
                  <span className={`text-xl font-bold ${
                    filteredBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {filteredBalance.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {monthFilter !== 'todos' && `Mês: ${monthFilter}`}
                  {monthFilter !== 'todos' && yearFilter !== 'todos' && ' • '}
                  {yearFilter !== 'todos' && `Ano: ${yearFilter}`}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  * Saldo calculado apenas com contas pagas/recebidas
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data de Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.description}</TableCell>
                    <TableCell>{account.category}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        account.type === 'receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        account.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.type === 'receita' ? '+' : '-'}R$ {Math.abs(account.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(account.dueDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(account.status)}`}>
                        {getStatusLabel(account.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Nenhuma conta encontrada com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
