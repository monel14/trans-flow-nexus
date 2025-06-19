
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  reference_number: string;
  amount: number;
  currency: string;
  status: string;
  operation_type?: {
    name: string;
  };
  profiles?: {
    name: string;
  };
  created_at: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  title = "Transactions Récentes" 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Terminé',
      pending: 'En attente',
      processing: 'En cours',
      failed: 'Échoué',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatAmount = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(amount) + ' ' + currency;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune transaction disponible</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Référence</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Montant</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Statut</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-sm font-mono">
                    {transaction.reference_number}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    {transaction.operation_type?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="py-3 px-2">
                    <Badge className={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
