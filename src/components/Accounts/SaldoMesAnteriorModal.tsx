import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SaldoMesAnteriorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (valor: number) => void;
  currentValue: number;
}

export const SaldoMesAnteriorModal: React.FC<SaldoMesAnteriorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentValue
}) => {
  const [valor, setValor] = useState(currentValue.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumerico = parseFloat(valor) || 0;
    onSave(valorNumerico);
  };

  const handleClose = () => {
    setValor(currentValue.toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Saldo do Mês Anterior</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Valor do Saldo
            </label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
