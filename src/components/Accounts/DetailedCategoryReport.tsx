import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import { DetailedReportMonthNavigator } from './DetailedReportMonthNavigator';

interface CategoryItem {
  description: string;
  amount: number;
}

interface CategoryData {
  category: string;
  color: string;
  items: CategoryItem[];
  total: number;
}

interface DetailedCategoryReportProps {
  accounts: any[];
  categories: any[];
}

export const DetailedCategoryReport: React.FC<DetailedCategoryReportProps> = ({ accounts, categories }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  const [isShowingAll, setIsShowingAll] = React.useState(false);
  const [monthStart, setMonthStart] = React.useState(startOfMonth(new Date()));
  const [monthEnd, setMonthEnd] = React.useState(endOfMonth(new Date()));

  const currentDate = new Date(currentYear, currentMonth, 1);
  const monthYear = isShowingAll ? 'Todos os Meses' : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const generationDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Filtrar contas do mês selecionado ou todos
  const currentMonthAccounts = React.useMemo(() => {
    if (isShowingAll) {
      return accounts.filter(acc => acc.description !== "Saldo Anterior");
    }
    return accounts.filter(acc => {
      if (!acc.due_date || acc.description === "Saldo Anterior") return false;
      const dueDate = new Date(acc.due_date);
      return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
    });
  }, [accounts, monthStart, monthEnd, isShowingAll]);

  // Agrupar por categoria (despesas e receitas juntas)
  const dataByCategory = React.useMemo(() => {
    const dataMap = new Map<string, {
      category: string;
      color: string;
      expenses: Array<{ date: string; description: string; amount: number; status: string }>;
      income: Array<{ date: string; description: string; amount: number; status: string }>;
      totalExpenses: number;
      totalIncome: number;
    }>();

    currentMonthAccounts.forEach(acc => {
      if (acc.description === "Saldo Anterior") return;
      
      const categoryName = acc.category || 'Sem Categoria';
      const categoryColor = categories.find(c => c.name === categoryName)?.color || '#94A3B8';
      
      if (!dataMap.has(categoryName)) {
        dataMap.set(categoryName, {
          category: categoryName,
          color: categoryColor,
          expenses: [],
          income: [],
          totalExpenses: 0,
          totalIncome: 0
        });
      }

      const data = dataMap.get(categoryName)!;
      const itemDate = acc.due_date ? format(new Date(acc.due_date), 'dd/MM/yyyy') : '-';
      
      if (acc.type === 'despesa') {
        const statusText = acc.status === 'pago' ? 'Pago' : 'Pendente';
        data.expenses.push({
          date: itemDate,
          description: acc.description,
          amount: Math.abs(acc.amount || 0),
          status: statusText
        });
        if (acc.status === 'pago') {
          data.totalExpenses += Math.abs(acc.amount || 0);
        }
      } else if (acc.type === 'receita') {
        const statusText = acc.status === 'recebido' ? 'Recebido' : 'Pendente';
        data.income.push({
          date: itemDate,
          description: acc.description,
          amount: acc.amount || 0,
          status: statusText
        });
        if (acc.status === 'recebido') {
          data.totalIncome += acc.amount || 0;
        }
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => 
      (b.totalIncome + b.totalExpenses) - (a.totalIncome + a.totalExpenses)
    );
  }, [currentMonthAccounts, categories]);

  const totalIncome = dataByCategory.reduce((sum, cat) => sum + cat.totalIncome, 0);
  const totalExpenses = dataByCategory.reduce((sum, cat) => sum + cat.totalExpenses, 0);
  const balance = totalIncome - totalExpenses;

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthStart(startDate);
    setMonthEnd(endDate);
    setCurrentMonth(month);
    setCurrentYear(year);
    setIsShowingAll(false);
  };

  const handleShowAll = () => {
    setIsShowingAll(true);
  };

  // Exportar para Excel (CSV)
  const exportToExcel = () => {
    try {
      let csv = 'Relatório Financeiro - ' + monthYear + '\n\n';
      
      dataByCategory.forEach(catData => {
        csv += `Categoria: ${catData.category}\n\n`;
        
        if (catData.expenses.length > 0) {
          csv += 'DESPESAS\n';
          csv += 'Data,Descrição,Valor (R$),Status\n';
          catData.expenses.forEach(item => {
            csv += `${item.date},${item.description},${item.amount.toFixed(2)},${item.status}\n`;
          });
          csv += `Total Despesas,,,${catData.totalExpenses.toFixed(2)}\n\n`;
        }
        
        if (catData.income.length > 0) {
          csv += 'RECEITAS\n';
          csv += 'Data,Descrição,Valor (R$),Status\n';
          catData.income.forEach(item => {
            csv += `${item.date},${item.description},${item.amount.toFixed(2)},${item.status}\n`;
          });
          csv += `Total Receitas,,,${catData.totalIncome.toFixed(2)}\n\n`;
        }
        
        const categoryBalance = catData.totalIncome - catData.totalExpenses;
        csv += `Total Geral da Categoria,,,${categoryBalance.toFixed(2)}\n\n\n`;
      });
      
      csv += '\nRESUMO GERAL\n';
      csv += `Receitas Totais,${totalIncome.toFixed(2)}\n`;
      csv += `Despesas Totais,${totalExpenses.toFixed(2)}\n`;
      csv += `Saldo do Mês,${balance.toFixed(2)}\n`;
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio-financeiro-${format(currentDate, 'yyyy-MM')}.csv`;
      link.click();
      
      toast({
        title: "Excel exportado com sucesso!",
        description: "O arquivo foi baixado para seu computador.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  // Exportar para PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Relatório Financeiro - ${monthYear}`, 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Contas a Pagar e Receber organizadas por categoria', 105, 28, { align: 'center' });
      doc.text(`Gerado em: ${generationDate}`, 105, 34, { align: 'center' });
      
      let yPosition = 45;
      
      // Dados por categoria
      dataByCategory.forEach((catData, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(88, 28, 135);
        doc.text(`${catData.category}`, 14, yPosition);
        yPosition += 8;
        
        // Despesas
        if (catData.expenses.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('Despesas', 14, yPosition);
          yPosition += 5;
          
          autoTable(doc, {
            startY: yPosition,
            head: [['Data', 'Descrição', 'Valor (R$)', 'Status']],
            body: catData.expenses.map(item => [
              item.date,
              item.description,
              formatCurrency(item.amount),
              item.status
            ]),
            foot: [['', '', `Total: ${formatCurrency(catData.totalExpenses)}`, '']],
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38], textColor: 255 },
            footStyles: { fillColor: [254, 226, 226], textColor: 0, fontStyle: 'bold' },
            margin: { left: 14 },
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
        
        // Receitas
        if (catData.income.length > 0) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text('Receitas', 14, yPosition);
          yPosition += 5;
          
          autoTable(doc, {
            startY: yPosition,
            head: [['Data', 'Descrição', 'Valor (R$)', 'Status']],
            body: catData.income.map(item => [
              item.date,
              item.description,
              formatCurrency(item.amount),
              item.status
            ]),
            foot: [['', '', `Total: ${formatCurrency(catData.totalIncome)}`, '']],
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94], textColor: 255 },
            footStyles: { fillColor: [220, 252, 231], textColor: 0, fontStyle: 'bold' },
            margin: { left: 14 },
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
        
        // Total da categoria
        const categoryBalance = catData.totalIncome - catData.totalExpenses;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text(`Total Geral da Categoria: ${formatCurrency(categoryBalance)}`, 14, yPosition);
        yPosition += 12;
      });
      
      // Resumo Final
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO GERAL', 105, yPosition, { align: 'center' });
      yPosition += 8;
      
      autoTable(doc, {
        startY: yPosition,
        body: [
          ['Receitas Totais', formatCurrency(totalIncome)],
          ['Despesas Totais', formatCurrency(totalExpenses)],
          ['Saldo do Mês', formatCurrency(balance)]
        ],
        theme: 'grid',
        styles: { fontSize: 12, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80 }
        },
        margin: { left: 14 },
      });
      
      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Gerado automaticamente pelo sistema Lovable - ${generationDate}`, 105, 285, { align: 'center' });
      }
      
      doc.save(`relatorio-financeiro-${format(currentDate, 'yyyy-MM')}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: "O arquivo foi baixado para seu computador.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <Card className="bg-white shadow-xl w-full max-w-5xl p-10 rounded-2xl">
        {/* Título e botões de exportar */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Relatório Detalhado por Categorias
            </h1>
            <p className="text-gray-500 text-sm">
              Contas a Pagar e Receber organizadas por categoria
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              className="border-red-600 text-red-700 hover:bg-red-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Navegador de mês/ano */}
        <DetailedReportMonthNavigator
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={handleMonthChange}
          onShowAll={handleShowAll}
          isShowingAll={isShowingAll}
        />

        {dataByCategory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Sem dados para exibir neste período
          </div>
        ) : (
          dataByCategory.map((catData, index) => {
            const totalDes = catData.totalExpenses;
            const totalRec = catData.totalIncome;
            const saldo = totalRec - totalDes;
            const corSaldo = saldo >= 0 ? "text-green-600" : "text-red-600";

            return (
              <div key={index} className="mb-10">
                <h2 className="text-xl font-semibold text-blue-800 mb-3 border-b pb-1 flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: catData.color }}
                  />
                  Categoria: {catData.category}
                </h2>

                <h3 className="font-semibold text-gray-700 mb-2">💸 Despesas</h3>
                {catData.expenses.length ? (
                  <table className="w-full mb-3 text-sm border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Descrição</th>
                        <th className="p-2 text-right">Valor (R$)</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catData.expenses.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.amount.toFixed(2)}</td>
                          <td className="p-2">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Sem despesas nesta categoria.</p>
                )}

                <p className="font-semibold text-right mb-4">
                  Total Despesas: R$ {totalDes.toFixed(2)}
                </p>

                <h3 className="font-semibold text-gray-700 mb-2">💰 Receitas</h3>
                {catData.income.length ? (
                  <table className="w-full mb-3 text-sm border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Descrição</th>
                        <th className="p-2 text-right">Valor (R$)</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catData.income.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.amount.toFixed(2)}</td>
                          <td className="p-2">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Sem receitas nesta categoria.</p>
                )}

                <p className="font-semibold text-right mb-2">
                  Total Receitas: R$ {totalRec.toFixed(2)}
                </p>
                <p className={`font-bold text-right ${corSaldo}`}>
                  Saldo da Categoria: R$ {saldo.toFixed(2)}
                </p>
              </div>
            );
          })
        )}

        <div className="border-t pt-4 mt-6">
          <h2 className="text-lg font-semibold text-center mb-3">
            📊 Resumo Geral do Mês
          </h2>
          <table className="w-full text-sm border border-gray-200 mb-4">
            <tbody>
              <tr>
                <td className="p-2 font-medium">💸 Total de Despesas</td>
                <td className="p-2 text-right">R$ {totalExpenses.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">💰 Total de Receitas</td>
                <td className="p-2 text-right">R$ {totalIncome.toFixed(2)}</td>
              </tr>
              <tr className={balance >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                <td className="p-2 font-medium">💹 Saldo Final</td>
                <td className="p-2 text-right">R$ {balance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-center text-gray-500 text-xs">
            Gerado automaticamente pelo sistema Lovable – {generationDate}
          </p>
        </div>
      </Card>
    </div>
  );
};
