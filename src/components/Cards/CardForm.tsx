import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBanksOptions } from '@/hooks/useBanksOptions'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface CardFormProps {
  card?: {
    id: string
    name: string
    limit: number
    bank_id?: string
    due_date: number
    closing_date: number
  }
  onSuccess: () => void
  onCancel: () => void
}

export function CardForm({ card, onSuccess, onCancel }: CardFormProps) {
  const [name, setName] = useState(card?.name || '')
  const [limit, setLimit] = useState(card?.limit?.toString() || '')
  const [bankId, setBankId] = useState(card?.bank_id || '')
  const [dueDate, setDueDate] = useState(card?.due_date?.toString() || '')
  const [closingDate, setClosingDate] = useState(card?.closing_date?.toString() || '')
  const [loading, setLoading] = useState(false)

  const { banks, loading: banksLoading } = useBanksOptions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !limit || !bankId || !dueDate || !closingDate) {
      toast.error('Todos os campos são obrigatórios')
      return
    }

    setLoading(true)

    try {
      const cardData = {
        name,
        limit: parseFloat(limit),
        bank_id: bankId,
        due_date: parseInt(dueDate),
        closing_date: parseInt(closingDate)
      }

      if (card) {
        // Atualizar cartão existente
        const { error } = await supabase
          .from('cards')
          .update(cardData)
          .eq('id', card.id)

        if (error) throw error
        toast.success('Cartão atualizado com sucesso!')
      } else {
        // Criar novo cartão
        const { error } = await supabase
          .from('cards')
          .insert([cardData])

        if (error) throw error
        toast.success('Cartão criado com sucesso!')
      }

      onSuccess()
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      toast.error('Erro ao salvar cartão')
    } finally {
      setLoading(false)
    }
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (card ? 'Atualizar' : 'Criar')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
} 