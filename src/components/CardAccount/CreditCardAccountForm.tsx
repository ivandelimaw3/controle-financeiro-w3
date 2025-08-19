// src/components/CardAccount/CreditCardAccountForm.tsx
import React, { useState } from 'react';
import { useCreditCardAccounts } from '../../hooks/useCreditCardAccounts';

interface CreditCardAccountFormProps {
  onSubmit: ( any) => void;
  initialData?: any;
  onCancel: () => void;
}

const CreditCardAccountForm: React.FC<CreditCardAccountFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { categories, creditCards } = useCreditCardAccounts();
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    category_id: initialData?.category_id?.toString() || '',
    payment_source: initialData?.payment_source || 'cash',
    payment_source_id: initialData?.payment_source_id?.toString() || '',
    status: initialData?.status || 'pendente',
    due_date: initialData?.due_date || new Date().toISOString().split('T')[0],
    posted_at: initialData?.posted_at || new Date().toISOString().split('T')[0],
    parcela: initialData?.parcela || 1,
    total_parcelas: initialData?.total_parcelas || 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter valores numéricos de volta para números
    const finalData = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      payment_source_id: formData.payment_source_id ? parseInt(formData.payment_source_id) : null,
      amount: parseFloat(formData.amount.toString()),
      parcela: parseInt(formData.parcela.toString()),
      total_parcelas: parseInt(formData.total_parcelas.toString())
    };
    
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">{initialData ? 'Editar Conta' : 'Nova Conta de Cartão'}</h2>

      <div>
        <label className="block mb-1">Descrição</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Valor (R$)</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Categoria</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Fonte de Pagamento</label>
          <select
            name="payment_source"
            value={formData.payment_source}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="cash">Dinheiro</option>
            <option value="bank">Banco</option>
            <option value="card">Cartão</option>
          </select>
        </div>
        {formData.payment_source === 'card' && (
          <div>
            <label className="block mb-1">Cartão</label>
            <select
              name="payment_source_id"
              value={formData.payment_source_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecione</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id.toString()}>
                  {card.card_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Vence em</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Lançada em</label>
          <input
            type="date"
            name="posted_at"
            value={formData.posted_at}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Parcela</label>
          <input
            type="number"
            name="parcela"
            value={formData.parcela}
            onChange={handleChange}
            min="1"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Total de Parcelas</label>
          <input
            type="number"
            name="total_parcelas"
            value={formData.total_parcelas}
            onChange={handleChange}
            min="1"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initialData ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default CreditCardAccountForm;
