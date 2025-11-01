import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';

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
  const currentDate = new Date();
  const monthYear = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const startOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "dd/MM/yyyy");
  const endOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "dd/MM/yyyy");
  const generationDate = format(currentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

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

    accounts.forEach(acc => {
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
      
      if (acc.type === 'despesa' && acc.status === 'pago') {
        data.expenses.push({
          date: itemDate,
          description: acc.description,
          amount: Math.abs(acc.amount || 0),
          status: acc.status === 'pago' ? 'Pago' : 'Pendente'
        });
        data.totalExpenses += Math.abs(acc.amount || 0);
      } else if (acc.type === 'receita' && acc.status === 'recebido') {
        data.income.push({
          date: itemDate,
          description: acc.description,
          amount: acc.amount || 0,
          status: acc.status === 'recebido' ? 'Recebido' : 'Pendente'
        });
        data.totalIncome += acc.amount || 0;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => 
      (b.totalIncome + b.totalExpenses) - (a.totalIncome + a.totalExpenses)
    );
  }, [accounts, categories]);

  const totalIncome = dataByCategory.reduce((sum, cat) => sum + cat.totalIncome, 0);
  const totalExpenses = dataByCategory.reduce((sum, cat) => sum + cat.totalExpenses, 0);
  const balance = totalIncome - totalExpenses;

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
    <div className="min-h-screen bg-[#f9f9f9] p-8">
      {/* Folha estilo Word */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-sm p-12" style={{ fontFamily: 'Inter, Roboto, Calibri, sans-serif' }}>
        
        {/* Cabeçalho */}
        <div className="mb-8 pb-6 border-b-2 border-slate-200">
          <h1 className="text-3xl font-bold text-center text-[#1e3a8a] mb-2">
            Relatório Financeiro – {monthYear}
          </h1>
          <p className="text-center text-slate-600 text-sm mb-4">
            Contas a Pagar e Receber organizadas por categoria
          </p>
          
          {/* Botões de Exportação */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="border-[#198754] text-[#198754] hover:bg-[#198754] hover:text-white transition-colors"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar para Excel
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              size="sm"
              className="border-[#dc3545] text-[#dc3545] hover:bg-[#dc3545] hover:text-white transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar para PDF
            </Button>
          </div>
        </div>

        {/* Seções por Categoria */}
        <div className="space-y-8">
          {dataByCategory.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Sem dados para exibir neste período
            </div>
          ) : (
            dataByCategory.map((catData, index) => {
              const categoryBalance = catData.totalIncome - catData.totalExpenses;
              
              return (
                <div key={index} className="mb-8 pb-6 border-b border-slate-200 last:border-0">
                  {/* Título da Categoria */}
                  <div className="flex items-center gap-2 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: catData.color }}
                    />
                    <h2 className="text-xl font-bold text-[#1e3a8a]">
                      Categoria: {catData.category}
                    </h2>
                  </div>

                  {/* Despesas */}
                  {catData.expenses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">Despesas</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b-2 border-slate-200">
                            <th className="text-left p-3 text-sm font-semibold text-slate-700">Data</th>
                            <th className="text-left p-3 text-sm font-semibold text-slate-700">Descrição</th>
                            <th className="text-right p-3 text-sm font-semibold text-slate-700">Valor (R$)</th>
                            <th className="text-center p-3 text-sm font-semibold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catData.expenses.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-3 text-sm text-slate-600">{item.date}</td>
                              <td className="p-3 text-sm text-slate-800">{item.description}</td>
                              <td className="p-3 text-sm text-right text-red-600 font-medium">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="p-3 text-sm text-center">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.status === 'Pago' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-red-50 border-t-2 border-red-200">
                            <td colSpan={2} className="p-3 text-sm font-bold text-slate-800">
                              Total Despesas – {catData.category}
                            </td>
                            <td className="p-3 text-sm text-right font-bold text-red-700">
                              {formatCurrency(catData.totalExpenses)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {catData.expenses.length === 0 && (
                    <div className="mb-6 p-4 bg-slate-50 rounded text-center text-slate-500 text-sm">
                      Sem despesas nesta categoria
                    </div>
                  )}

                  {/* Receitas */}
                  {catData.income.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">Receitas</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b-2 border-slate-200">
                            <th className="text-left p-3 text-sm font-semibold text-slate-700">Data</th>
                            <th className="text-left p-3 text-sm font-semibold text-slate-700">Descrição</th>
                            <th className="text-right p-3 text-sm font-semibold text-slate-700">Valor (R$)</th>
                            <th className="text-center p-3 text-sm font-semibold text-slate-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catData.income.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="p-3 text-sm text-slate-600">{item.date}</td>
                              <td className="p-3 text-sm text-slate-800">{item.description}</td>
                              <td className="p-3 text-sm text-right text-green-600 font-medium">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="p-3 text-sm text-center">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.status === 'Recebido' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-50 border-t-2 border-green-200">
                            <td colSpan={2} className="p-3 text-sm font-bold text-slate-800">
                              Total Receitas – {catData.category}
                            </td>
                            <td className="p-3 text-sm text-right font-bold text-green-700">
                              {formatCurrency(catData.totalIncome)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {catData.income.length === 0 && (
                    <div className="mb-6 p-4 bg-slate-50 rounded text-center text-slate-500 text-sm">
                      Sem receitas nesta categoria
                    </div>
                  )}

                  {/* Total Geral da Categoria */}
                  <div className={`p-4 rounded-lg ${categoryBalance >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-800">
                        Total Geral da Categoria:
                      </span>
                      <span className={`text-xl font-bold ${categoryBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        💰 {formatCurrency(categoryBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumo Final */}
        <div className="mt-12 pt-6 border-t-2 border-slate-300">
          <h2 className="text-2xl font-bold text-center text-[#1e3a8a] mb-6">
            Resumo Financeiro – {monthYear}
          </h2>
          
          <div className="max-w-md mx-auto">
            <table className="w-full border-collapse border-2 border-slate-300">
              <tbody>
                <tr className="border-b-2 border-slate-300">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50">RECEITAS TOTAIS</td>
                  <td className="p-4 text-right text-xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </td>
                </tr>
                <tr className="border-b-2 border-slate-300">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50">DESPESAS TOTAIS</td>
                  <td className="p-4 text-right text-xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </td>
                </tr>
                <tr className={balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}>
                  <td className="p-4 font-bold text-slate-800">SALDO DO MÊS</td>
                  <td className={`p-4 text-right text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(balance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          Gerado automaticamente pelo sistema Lovable – {generationDate}
        </div>
      </div>
    </div>
  );
};
