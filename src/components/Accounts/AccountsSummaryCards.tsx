import type React from "react"
import { useState } from "react"
import { Clock, TrendingUp, TrendingDown, DollarSign, Calculator, Edit3, Check, X } from "lucide-react"
import type { Account } from "@/hooks/useAccountsData"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AccountsSummaryCardsProps {
  accounts: Account[]
  onUpdatePreviousBalance?: (amount: number) => void
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ accounts, onUpdatePreviousBalance }) => {
  const [isEditingPreviousBalance, setIsEditingPreviousBalance] = useState(false)
  const [previousBalanceInput, setPreviousBalanceInput] = useState("")

  // Função para formatar valores em reais brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const calculateTotalPago = () => {
    return accounts
      .filter((account) => account.type === "despesa" && account.status === "pago")
      .reduce((sum, account) => sum + Math.abs(account.amount), 0)
  }

  const calculateTotalRecebido = () => {
    return accounts
      .filter((account) => account.type === "receita" && account.status === "recebido")
      .reduce((sum, account) => sum + account.amount, 0)
  }

  const calculatePreviousBalance = () => {
    return accounts
      .filter((account) => account.previous_balance !== null && account.previous_balance !== undefined)
      .reduce((sum, account) => sum + (account.previous_balance || 0), 0)
  }

  const calculateSaldoFinal = () => {
    const previousBalance = calculatePreviousBalance()
    const currentBalance = calculateTotalRecebido() - calculateTotalPago()
    return previousBalance + currentBalance
  }

  const calculateTotalPendente = () => {
    const receitasPendentes = accounts
      .filter((account) => account.type === "receita" && account.status === "pendente")
      .reduce((sum, account) => sum + account.amount, 0)
    const despesasPendentes = accounts
      .filter((account) => account.type === "despesa" && account.status === "pendente")
      .reduce((sum, account) => sum + Math.abs(account.amount), 0)
    return receitasPendentes - despesasPendentes
  }

  const handleEditPreviousBalance = () => {
    const currentBalance = calculatePreviousBalance()
    setPreviousBalanceInput(currentBalance.toString())
    setIsEditingPreviousBalance(true)
  }

  const handleSavePreviousBalance = () => {
    const amount = Number.parseFloat(previousBalanceInput) || 0
    console.log("[v0] Component: handleSavePreviousBalance called with amount:", amount)
    console.log("[v0] Component: onUpdatePreviousBalance function exists:", !!onUpdatePreviousBalance)

    if (onUpdatePreviousBalance) {
      console.log("[v0] Component: Calling onUpdatePreviousBalance...")
      onUpdatePreviousBalance(amount)
    } else {
      console.log("[v0] Component: onUpdatePreviousBalance is not provided!")
    }
    setIsEditingPreviousBalance(false)
    setPreviousBalanceInput("")
  }

  const handleCancelEdit = () => {
    setIsEditingPreviousBalance(false)
    setPreviousBalanceInput("")
  }

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Mês Anterior</p>
            {isEditingPreviousBalance ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={previousBalanceInput}
                  onChange={(e) => setPreviousBalanceInput(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="0,00"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSavePreviousBalance}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p
                  className={`text-xl font-bold ${calculatePreviousBalance() >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(calculatePreviousBalance())}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditPreviousBalance}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                >
                  <Edit3 size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Recebido</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(calculateTotalRecebido())}</p>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Total Pago</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(calculateTotalPago())}</p>
          </div>
        </div>
      </div>

      {/* Saldo Final */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Final</p>
            <p className={`text-xl font-bold ${calculateSaldoFinal() >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(calculateSaldoFinal())}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo Pendente */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Saldo Pendente</p>
            <p className={`text-xl font-bold ${calculateTotalPendente() >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(calculateTotalPendente())}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
