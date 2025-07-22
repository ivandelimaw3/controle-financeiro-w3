import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBanksOptions } from '@/hooks/useBanksOptions'
import { CardInput } from '@/hooks/useCardsData'
import { toast } from 'sonner'

interface CardFormProps {
  card?: {
    id: number
    name: string
    card_number: string
    expiry_date: string
    cvv: string
    card_brand: string
    current_balance: number
    bank_id?: number
    payment_date: number
  }
  onSubmit: (data: CardInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CardForm({ card, onSubmit, onCancel, isLoading = false }: CardFormProps) {
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardBrand, setCardBrand] = useState('')
  const [currentBalance, setCurrentBalance] = useState('')
  const [bankId, setBankId] = useState('')
  const [paymentDate, setPaymentDate] = useState('')

  const { banks, loading: banksLoading } = useBanksOptions()

  // Atualiza os estados quando o cartão for carregado
  useEffect(() => {
    if (card) {
      setName(card.name || '')
      setCardNumber(card.card_number || '')
      setExpiryDate(card.expiry_date || '')
      setCvv(card.cvv || '')
      setCardBrand(card.card_brand || '')
      setCurrentBalance(card.current_balance?.toString() || '')
      setBankId(card.bank_id?.toString() || '')
      setPaymentDate(card.payment_date?.toString() || '')
    }
  }, [card])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !cardNumber || !expiryDate || !cvv || !cardBrand || !bankId || !paymentDate) {
      toast.error('Todos os campos são obrigatórios')
      return
    }

    const cardData: CardInput = {
      name,
      card_number: cardNumber,
      expiry_date: expiryDate,
      cvv,
      card_brand: cardBrand,
      current_balance: parseFloat(currentBalance) || 0,
      bank_id: parseInt(bankId, 10),
      payment_date: parseInt(paymentDate, 10)
    }

    onSubmit(cardData)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : v
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    return v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v
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
        <Label htmlFor="cardNumber">Número do Cartão</Label>
        <Input
          id="cardNumber"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Data de Validade</Label>
          <Input
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/AA"
            maxLength={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardBrand">Bandeira do Cartão</Label>
        <Select value={cardBrand} onValueChange={setCardBrand}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a bandeira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="elo">Elo</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
            <SelectItem value="hipercard">Hipercard</SelectItem>
            <SelectItem value="discover">Discover</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank">Banco</Label>
        <Select value={bankId} onValueChange={setBankId} disabled={banksLoading}>
          <SelectTrigger>
            <SelectValue placeholder={banksLoading ? "Carregando..." : "Selecione um banco"} />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank.id} value={String(bank.id)}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {banks.length === 0 && !banksLoading && (
          <p className="text-sm text-gray-500">Nenhum banco encontrado. Cadastre um banco primeiro.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentBalance">Débito Atual (R$)</Label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Dia do Vencimento</Label>
          <Input
            id="paymentDate"
            type="number"
            min="1"
            max="31"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            placeholder="1-31"
            required
          />
          <p className="text-xs text-gray-500">Dia do mês para vencimento da fatura</p>
        </div>
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
