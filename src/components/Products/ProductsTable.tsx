
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Package } from 'lucide-react';
import { Product } from '@/hooks/useProductsData';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Modelo/Fabricante</TableHead>
            <TableHead>Número de Série</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-slate-500" />
                  {product.name}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {product.type}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {product.model && (
                    <div className="text-sm font-medium">{product.model}</div>
                  )}
                  {product.manufacturer && (
                    <div className="text-xs text-slate-500">{product.manufacturer}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600 font-mono">
                {product.serial_number || '-'}
              </TableCell>
              <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                {product.observations || '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm" 
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
