
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Download, Filter } from 'lucide-react';

const OperationHistory = () => {
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Données mockées
  const operations = [
    {
      id: 'OP001',
      date: '2024-01-15 14:30',
      type: 'Transfert Western Union',
      amount: 50000,
      fees: 1250,
      total: 51250,
      beneficiary: '+226 70 XX XX XX',
      status: 'Validée',
      proof: 'proof_001.jpg',
      commission: 1250,
      validator: 'Admin Général',
      rejectReason: null
    },
    {
      id: 'OP002',
      date: '2024-01-15 10:15',
      type: 'Paiement Orange Money',
      amount: 25000,
      fees: 375,
      total: 25375,
      beneficiary: '+226 75 XX XX XX',
      status: 'En attente',
      proof: 'proof_002.jpg',
      commission: 375,
      validator: null,
      rejectReason: null
    },
    {
      id: 'OP003',
      date: '2024-01-14 16:45',
      type: 'Recharge Moov',
      amount: 10000,
      fees: 100,
      total: 10100,
      beneficiary: '+226 76 XX XX XX',
      status: 'Rejetée',
      proof: 'proof_003.jpg',
      commission: 0,
      validator: 'Sous-Admin',
      rejectReason: 'Preuve illisible'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Validée':
        return <Badge className="bg-green-100 text-green-800">Validée</Badge>;
      case 'En attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'Rejetée':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOperations = operations.filter(op => {
    const matchesSearch = searchTerm === '' || 
      op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.beneficiary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || op.type === typeFilter;
    const matchesStatus = statusFilter === '' || op.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique des Opérations</h1>
        <p className="text-gray-600">Consultez toutes vos transactions</p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres de Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Rechercher (ID, bénéficiaire...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'opération" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="Transfert Western Union">Western Union</SelectItem>
                  <SelectItem value="Paiement Orange Money">Orange Money</SelectItem>
                  <SelectItem value="Recharge Moov">Moov Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="Validée">Validée</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Rejetée">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des opérations */}
      <Card>
        <CardHeader>
          <CardTitle>Opérations ({filteredOperations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Frais</TableHead>
                  <TableHead>Total Débité</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="font-medium">{operation.id}</TableCell>
                    <TableCell>{operation.date}</TableCell>
                    <TableCell>{operation.type}</TableCell>
                    <TableCell>{operation.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{operation.fees.toLocaleString()} FCFA</TableCell>
                    <TableCell className="font-medium">{operation.total.toLocaleString()} FCFA</TableCell>
                    <TableCell>{operation.beneficiary}</TableCell>
                    <TableCell>{getStatusBadge(operation.status)}</TableCell>
                    <TableCell>
                      {operation.commission > 0 ? `${operation.commission.toLocaleString()} FCFA` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationHistory;
