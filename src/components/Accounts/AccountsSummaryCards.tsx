import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Account, useAccountsData } from "@/hooks/useAccountsData";
import { Clock, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const AccountsSummaryCards: React.FC = () => {
  const { accounts, upsertPreviousBalance } = useAccountsData();
  const [editing, setEditing] = useState(false);

  // Busca o saldo inicial do mês (Saldo Mês Anterior)
  const saldoAnterior = accounts.find(a => a.description === "Saldo Mês Anterior")?.previous_balance ?? 0;

  const [value, setValue] = useState(saldoAnterior.toString());

  useEffect(() => {
    setValue(saldoAnterior.toString());
  }, [saldoAnterior]);

  const handleSave = async () => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;
    await upsertPreviousBalance(numericValue);
    setEditing(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const totalPago = accounts
    .filter(a => a.type === "despesa" && a.status === "pago")
    .reduce((sum, a) => sum + Math.abs(a.amount), 0);

  const totalRecebido = accounts
    .filter(a => a.type === "receita" && a.status === "recebido")
    .reduce((sum, a) => sum + a.amount, 0);

  const saldoFinal = totalRecebido - totalPago;

  const totalPendente = accounts
    .filter(a => a.status === "pendente")
    .reduce((sum, a) => a.type === "receita" ? sum + a.amount : sum - Math.abs(a.amount), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Saldo Mês Anterior */}
      <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => !editing && setEditing(true)}>
        <CardContent className="p-4">
          {editing ? (
            <div className="flex gap-2 items-center">
              <Input type="number" value={value} onChange={e => setValue(e.target.value)} />
              <Button size="sm" onClick={handleSave}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Saldo Mês Anterior</p>
              <p className="text-xl font-bold">{formatCurrency(saldoAnterior)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Recebido */}
      <Card className="p-4 bg-green-50 rounded-xl border border-green-200">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalRecebido)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Pago */}
      <Card className="p-4 bg-red-50 rounded-xl border border-red-200">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><TrendingDown size={20} className="text-red-600" /></div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Pago</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalPago)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Final */}
      <Card className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><DollarSign size={20} className="text-blue-600" /></div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Final</p>
            <p className={`text-xl font-bold ${saldoFinal >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(saldoFinal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Pendente */}
      <Card className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <CardContent className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg"><Clock size={20} className="text-yellow-600" /></div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Pendente</p>
            <p className={`text-xl font-bold ${totalPendente >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalPendente)}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
