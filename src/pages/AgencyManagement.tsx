import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencies, useCreateAgency, useUpdateAgency } from '@/hooks/useAgencies';
import { useOperationTypes } from '@/hooks/useOperationTypes';
import { useAgencyOperationTypes, useUpdateAgencyServices } from '@/hooks/useAgencyOperationTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  Plus,
  Users,
  MapPin,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Shield,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const AgencyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État des modales
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'services' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    description: ''
  });
  
  // État des services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Hooks
  const { data: agencies = [], isLoading } = useAgencies();
  const { data: operationTypes = [] } = useOperationTypes();
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const { data: agencyServices } = useAgencyOperationTypes(selectedAgency?.id);
  const updateServices = useUpdateAgencyServices();

  const handleCreate = () => {
    setFormData({
      name: '',
      city: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      description: ''
    });
    setModalType('create');
  };

  const handleEdit = (agency: any) => {
    setSelectedAgency(agency);
    setFormData({
      name: agency.name || '',
      city: agency.city || '',
      address: agency.address || '',
      contact_phone: agency.contact_phone || '',
      contact_email: agency.contact_email || '',
      description: agency.description || ''
    });
    setModalType('edit');
  };

  const handleManageServices = (agency: any) => {
    setSelectedAgency(agency);
    // Charger les services actuels de l'agence
    const currentServices = agencyServices?.map(s => s.operation_type_id) || [];
    setSelectedServices(currentServices);
    setModalType('services');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.city.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et la ville sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (modalType === 'create') {
        await createAgency.mutateAsync(formData);
        toast({
          title: "Agence créée",
          description: "La nouvelle agence a été créée avec succès",
        });
      } else if (modalType === 'edit' && selectedAgency) {
        await updateAgency.mutateAsync({
          id: selectedAgency.id,
          ...formData
        });
        toast({
          title: "Agence modifiée",
          description: "Les informations de l'agence ont été mises à jour",
        });
      }
      
      setModalType(null);
      setSelectedAgency(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'opération",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateServices = async () => {
    if (!selectedAgency) return;

    setIsSubmitting(true);
    
    try {
      await updateServices.mutateAsync({
        agencyId: selectedAgency.id,
        operationTypeIds: selectedServices
      });
      
      toast({
        title: "Services mis à jour",
        description: "Les services de l'agence ont été mis à jour avec succès",
      });
      
      setModalType(null);
      setSelectedAgency(null);
      setSelectedServices([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des services",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (operationTypeId: string) => {
    setSelectedServices(prev => 
      prev.includes(operationTypeId)
        ? prev.filter(id => id !== operationTypeId)
        : [...prev, operationTypeId]
    );
  };

  const getAgencyStats = (agency: any) => {
    // Ces données seraient normalement récupérées via des hooks dédiés
    return {
      activeAgents: Math.floor(Math.random() * 20) + 5,
      monthlyVolume: Math.floor(Math.random() * 10000000) + 1000000,
      totalOperations: Math.floor(Math.random() * 500) + 100
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement des agences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-8 w-8" />
            Gestion des Agences
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les agences et leurs services disponibles
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Agence
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {agencies.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Building className="h-4 w-4" />
                Total Agences
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {agencies.filter(a => a.is_active).length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Actives
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {agencies.reduce((sum, a) => sum + getAgencyStats(a).activeAgents, 0)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Users className="h-4 w-4" />
                Agents Total
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {operationTypes.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Settings className="h-4 w-4" />
                Services Disponibles
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des agences */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Agences</CardTitle>
        </CardHeader>
        <CardContent>
          {agencies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agence</TableHead>
                    <TableHead>Chef d'Agence</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Volume (Mois)</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => {
                    const stats = getAgencyStats(agency);
                    return (
                      <TableRow key={agency.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{agency.name}</span>
                            <span className="text-sm text-gray-500">{agency.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{agency.chef_agence?.name || 'Non assigné'}</span>
                            <span className="text-sm text-gray-500">{agency.chef_agence?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{agency.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">{stats.activeAgents}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">
                              {formatCurrency(stats.monthlyVolume)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {agency.agency_operation_types?.length || 0} services
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agency.is_active ? "default" : "secondary"}>
                            {agency.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(agency)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManageServices(agency)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucune agence trouvée</h3>
              <p className="mb-4">Créez votre première agence pour commencer</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une agence
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de création/édition */}
      <Dialog open={modalType === 'create' || modalType === 'edit'} onOpenChange={() => {
        setModalType(null);
        setSelectedAgency(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {modalType === 'create' ? 'Créer une Nouvelle Agence' : 'Modifier l\'Agence'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'agence *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Agence Centre-Ville"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ex: Ouagadougou"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Ex: +226 XX XX XX XX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Ex: contact@agence.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Secteur 15, Avenue Kwame N'Krumah"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description optionnelle de l'agence..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalType(null)}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {modalType === 'create' ? 'Création...' : 'Modification...'}
                  </>
                ) : (
                  modalType === 'create' ? 'Créer l\'Agence' : 'Modifier l\'Agence'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modale de gestion des services */}
      <Dialog open={modalType === 'services'} onOpenChange={() => {
        setModalType(null);
        setSelectedAgency(null);
        setSelectedServices([]);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Attribuer des Services - {selectedAgency?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Sélectionnez les types d'opérations que cette agence peut proposer à ses clients.
                Les agents de l'agence pourront uniquement créer des opérations pour les services sélectionnés.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Services Disponibles</h4>
              <div className="grid grid-cols-1 gap-3">
                {operationTypes.map((operationType) => (
                  <div key={operationType.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={operationType.id}
                      checked={selectedServices.includes(operationType.id)}
                      onCheckedChange={() => toggleService(operationType.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={operationType.id} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{operationType.name}</span>
                          <span className="text-sm text-gray-500">{operationType.description}</span>
                        </div>
                      </Label>
                    </div>
                    <Badge variant={operationType.affects_balance ? "default" : "secondary"}>
                      {operationType.affects_balance ? 'Financière' : 'Informative'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedServices.length} service(s) sélectionné(s)
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalType(null);
                    setSelectedAgency(null);
                    setSelectedServices([]);
                  }}
                >
                  Annuler
                </Button>
                
                <Button
                  onClick={handleUpdateServices}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    'Enregistrer les Services'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgencyManagement;