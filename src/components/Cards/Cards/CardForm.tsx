import React, { useState } from 'react';
import { useBanksData } from '../../hooks/useBanksData';
import { Card as CardType } from '@/hooks/useCardsData';

interface CardFormProps {
  card?: CardType;
  onSubmit: (data: any) => void;
}

export default function CardForm({ card, onSubmit }: CardFormProps) {
  const { banks, loading: banksLoading } = useBanksData();

  // Estado do formulário
  const [form, setForm] = useState({
    name: card?.name || '',
    number: card?.number || '',
    expiration_date: card?.expiration_date || '',
    payment_date: card?.payment_date || '',
    credit_limit: card?.credit_limit || '',
    used_value: card?.used_value || 0,
    bank_id: card?.bank_id || '',
  });

  // Handler genérico para inputs
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Nome do Cartão</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="number">Número do Cartão</label>
        <input
          type="text"
          id="number"
          name="number"
          value={form.number}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="expiration_date">Data de Validade</label>
        <input
          type="date"
          id="expiration_date"
          name="expiration_date"
          value={form.expiration_date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="payment_date">Dia do Pagamento</label>
        <input
          type="number"
          id="payment_date"
          name="payment_date"
          value={form.payment_date}
          onChange={handleChange}
          min={1}
          max={31}
          required
        />
      </div>

      <div>
        <label htmlFor="credit_limit">Limite de Crédito</label>
        <input
          type="number"
          id="credit_limit"
          name="credit_limit"
          value={form.credit_limit}
          onChange={handleChange}
          min={0}
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="used_value">Valor Utilizado</label>
        <input
          type="number"
          id="used_value"
          name="used_value"
          value={form.used_value}
          onChange={handleChange}
          min={0}
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="bank_id">Banco</label>
        <select
          id="bank_id"
          name="bank_id"
          value={form.bank_id}
          onChange={handleChange}
          required
          disabled={banksLoading}
        >
          <option value="">Selecione um banco</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Salvar</button>
    </form>
  );
}