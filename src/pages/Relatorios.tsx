
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ExpiringAccountsAlert } from '@/components/Reports/ExpiringAccountsAlert';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { TrendingUp, TrendingDown, Calendar, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccounts } from '@/contexts/AccountsContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Relatorios: React.FC = () => {
  const { accounts, getTotalReceitas, getTotalDespesas, getSaldo } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  
  // Inicializar com mês atual
  const today = new Date();
  const [monthFilter, setMonthFilter] = useState((today.getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

  const { toast } = useToast();

  // Para o MonthNavigator (que usa 0-11 para meses)
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10) - 1;
  const currentYear = parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos';

  // Funções para o MonthNavigator
  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter((month + 1).toString()); // MonthNavigator usa 0-11, nossos filtros usam 1-12
    setYearFilter(year.toString());
  };

  const handleShowAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Financeiro', 105, 15, { align: 'center' });
      
      // Período
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const periodo = monthFilter === 'todos' 
        ? 'Todos os períodos' 
        : `${monthFilter}/${yearFilter}`;
      doc.text(`Período: ${periodo}`, 105, 22, { align: 'center' });
      
      // Data de geração
      const dataGeracao = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(9);
      doc.text(`Gerado em: ${dataGeracao}`, 105, 28, { align: 'center' });
      
      // Resumo Financeiro
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo do Período', 14, 38);
      
      // Cards de resumo
      const resumoData = [
        ['Total de Receitas', `R$ ${filteredReceitas.toFixed(2)}`],
        ['Total de Despesas', `R$ ${filteredDespesas.toFixed(2)}`],
        ['Saldo do Período', `R$ ${filteredSaldo.toFixed(2)}`]
      ];
      
      autoTable(doc, {
        startY: 42,
        head: [['Descrição', 'Valor']],
        body: resumoData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        }
      });
      
      // Detalhamento das Contas
      const finalY = (doc as any).lastAutoTable.finalY || 42;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento das Contas', 14, finalY + 10);
      
      // Preparar dados da tabela
      const tableData = filteredAccounts.map(account => [
        account.description,
        account.category,
        account.type === 'receita' ? 'Receita' : 'Despesa',
        `${account.type === 'receita' ? '+' : '-'}R$ ${Math.abs(account.amount).toFixed(2)}`,
        formatDate(account.dueDate),
        getStatusLabel(account.status)
      ]);
      
      autoTable(doc, {
        startY: finalY + 14,
        head: [['Descrição', 'Categoria', 'Tipo', 'Valor', 'Vencimento', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [59, 130, 246],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 25 },
          5: { cellWidth: 22 }
        },
        didParseCell: function(data) {
          // Colorir valores
          if (data.column.index === 3 && data.section === 'body') {
            const valor = tableData[data.row.index][3];
            if (valor.startsWith('+')) {
              data.cell.styles.textColor = [34, 197, 94]; // verde
            } else {
              data.cell.styles.textColor = [239, 68, 68]; // vermelho
            }
          }
        }
      });
      
      // Salvar PDF
      const nomeArquivo = `relatorio-financeiro-${periodo.replace(/\//g, '-')}.pdf`;
      doc.save(nomeArquivo);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo ${nomeArquivo} baixado.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Filtrar contas baseado nos filtros
  const filteredAccounts = accounts.filter(account => {
    const accountDate = new Date(account.dueDate);
    const accountMonth = accountDate.getMonth() + 1;
    const accountYear = accountDate.getFullYear();

    // Melhorar a pesquisa por texto - buscar tanto na descrição quanto na categoria
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' || 
                         account.description.toLowerCase().includes(searchLower) ||
                         account.category.toLowerCase().includes(searchLower);
    
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

  // Calcular valores filtrados para os cards
  const getFilteredReceitas = () => {
    return filteredAccounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const getFilteredDespesas = () => {
    return filteredAccounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const getFilteredSaldo = () => {
    return getFilteredReceitas() - getFilteredDespesas();
  };

  const filteredTotal = getFilteredTotal();
  const statusTotal = getStatusTotal();
  const filteredReceitas = getFilteredReceitas();
  const filteredDespesas = getFilteredDespesas();
  const filteredSaldo = getFilteredSaldo();

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
    if (!dateString) return '-';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-start items-center">
          <Button 
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
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
                <p className="text-2xl font-bold text-green-600">R$ {filteredReceitas.toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-red-600">R$ {filteredDespesas.toFixed(2)}</p>
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
                <p className={`text-2xl font-bold ${filteredSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {filteredSaldo.toFixed(2)}
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
                  placeholder="Pesquisar por descrição ou categoria..."
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

            {/* MonthNavigator substituindo os filtros de data */}
            <MonthNavigator
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              onShowAll={handleShowAll}
              isShowingAll={isShowingAll}
            />

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


            {/* Mostrar informação da pesquisa quando há termo de busca */}
            {searchTerm && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Resultados para: "<strong>{searchTerm}</strong>" - {filteredAccounts.length} conta(s) encontrada(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700 py-2 w-[30%]">Descrição</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 w-[15%]">Categoria</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 w-[10%]">Tipo</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 w-[15%]">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 w-[15%]">Data de Vencimento</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-2 w-[15%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-slate-50/30 transition-colors h-12">
                    <TableCell className="font-medium py-2 max-w-0">
                      <div className="truncate" title={account.description}>
                        {account.description}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">{account.category}</TableCell>
                    <TableCell className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        account.type === 'receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className={`font-semibold ${
                        account.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.type === 'receita' ? '+' : '-'}R$ {Math.abs(account.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">{formatDate(account.dueDate)}</TableCell>
                    <TableCell className="py-2">
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
              {searchTerm ? 
                `Nenhuma conta encontrada para "${searchTerm}".` : 
                'Nenhuma conta encontrada com os filtros aplicados.'
              }
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
