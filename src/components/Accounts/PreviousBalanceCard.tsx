import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PreviousBalanceCardProps {
  previousBalance: number
  month: number
  year: number
  onUpdateBalance: (month: number, year: number, value: number) => Promise<void>
}

export const PreviousBalanceCard: React.FC<PreviousBalanceCardProps> = ({
  previousBalance,
  month,
  year,
  onUpdateBalance,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(previousBalance.toFixed(2))

  const handleSave = async () => {
    const numericValue = parseFloat(value) || 0
    await onUpdateBalance(month, year, numericValue)
    setIsEditing(false)
  }

  return (
    <Card className="rounded-2xl shadow-md border border-slate-200">
      <CardContent className="p-4 flex flex-col items-center">
        <h3 className="text-sm font-medium text-slate-600 mb-2">
          Saldo Mês Anterior
        </h3>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-28 text-right"
            />
            <Button size="sm" onClick={handleSave}>
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div
            className="text-xl font-semibold text-slate-800 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {previousBalance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
