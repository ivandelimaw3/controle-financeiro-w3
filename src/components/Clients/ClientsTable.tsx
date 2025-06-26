
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
import { Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Client } from '@/hooks/useClientsData';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={12} />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={12} />
                      {client.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {client.cpf || '-'}
              </TableCell>
              <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                {client.address || '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(client)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm" 
                    onClick={() => onDelete(client.id)}
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
