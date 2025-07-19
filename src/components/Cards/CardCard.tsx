import React from 'react';
import { CreditCard, Edit, Trash2 } from 'lucide-react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardInput } from './CardForm';
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface CardData {
  id: string
  name: string
  limit: number
  bank_id?: string
  bank_name?: string
  due_date: number
  closing_date: number
  created_at: string
}

interface CardCardProps {
  card: CardData
  onEdit: (card: CardData) => void
  onDelete: (id: string) => void
}

export function CardCard({ card, onEdit, onDelete }: CardCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', card.id)

      if (error) throw error

      toast.success('Cartão excluído com sucesso!')
      onDelete(card.id)
    } catch (error) {
      console.error('Erro ao excluir cartão:', error)
      toast.error('Erro ao excluir cartão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UICard className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <CardTitle className="text-lg">
              {card.name}
            </CardTitle>
            {card.bank_name && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Banco:</span>
                <Badge variant="secondary">{card.bank_name}</Badge>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Limite: R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-muted-foreground">Vencimento: {card.due_date}º dia</p>
            <p className="text-sm text-muted-foreground">Fechamento: {card.closing_date}º dia</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Número:</span> {card.id}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(card)} className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700" disabled={loading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </UICard>
  );
}; 