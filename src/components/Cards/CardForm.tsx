import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBanksOptions } from '@/hooks/useBanksOptions'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface CardInput {
  name: string
  limit_amount: number
  bank_id?: number
  due_date: number
  closing_date: number
}

interface CardFormProps {
  card?: {
    id: number
    name: string
    limit_amount: number
    bank_id?: number
    due_date: number
    closing_date: number
  }
  onSubmit: (data: CardInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CardForm({ card, onSubmit, onCancel, isLoading = false }: CardFormProps) {
  const [name, setName] = useState(card?.name || '')
  const [limit, setLimit] = useState(card?.limit_amount?.toString() || '')
  const [bankId, setBankId] = useState(card?.bank_id?.toString() || '')
  const [dueDate, setDueDate] = useState(card?.due_date?.toString() || '')
  const [closingDate, setClosingDate] = useState(card?.closing_date?.toString() || '')

  const { banks, loading: banksLoading } = useBanksOptions()

  // Debug: verificar se os bancos estão sendo carregados
  useEffect(() => {
    console.log('Bancos carregados:', banks)
    console.log('Loading bancos:', banksLoading)
  }, [banks, banksLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !limit || !bankId || !dueDate || !closingDate) {
      toast.error('Todos os campos são obrigatórios')
      return
    }

    const cardData: CardInput = {
      name,
      limit_amount: parseFloat(limit),
      bank_id: bankId ? parseInt(bankId) : undefined,
      due_date: parseInt(dueDate),
      closing_date: parseInt(closingDate)
    }

    onSubmit(cardData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do cartão"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank">Banco</Label>
        <Select value={bankId} onValueChange={setBankId} disabled={banksLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um banco" />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="limit">Limite</Label>
        <Input
          id="limit"
          type="number"
          step="0.01"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Dia do Vencimento</Label>
        <Input
          id="dueDate"
          type="number"
          min="1"
          max="31"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="1-31"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="closingDate">Dia do Fechamento</Label>
        <Input
          id="closingDate"
          type="number"
          min="1"
          max="31"
          value={closingDate}
          onChange={(e) => setClosingDate(e.target.value)}
          placeholder="1-31"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (card ? 'Atualizar' : 'Criar')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
} 