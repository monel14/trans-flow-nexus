import React, { useState } from 'react';
import { useAgencies, useCreateAgency, useUpdateAgency, useDeleteAgency } from '@/hooks/useAgencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2,
  MapPin,
  Users,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AgencyManagement = () => {
  const { toast } = useToast();
  const { agencies, isLoading, refetch } = useAgencies();
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    chef_agence_id: ''
  });

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'agence est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAgency.mutateAsync({
        name: formData.name.trim(),
        city: formData.city.trim() || undefined,
        chef_agence_id: formData.chef_agence_id.trim() || undefined,
      });

      toast({
        title: "Agence créée",
        description: "L'agence a été créée avec succès",
      });

      setFormData({ name: '', city: '', chef_agence_id: '' });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'agence",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAgency || !formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'agence est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAgency.mutateAsync({
        id: editingAgency.id,
        updates: {
          name: formData.name.trim(),
          city: formData.city.trim() || null,
          chef_agence_id: formData.chef_agence_id.trim() || null,
        }
      });

      toast({
        title: "Agence modifiée",
        description: "L'agence a été modifiée avec succès",
      });

      setEditingAgency(null);
      setFormData({ name: '', city: '', chef_agence_id: '' });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'agence",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgency = async (agencyId: number) => {
    setIsDeleting(agencyId);
    
    try {
      await deleteAgency.mutateAsync(agencyId);
      
      toast({
        title: "Agence supprimée",
        description: "L'agence a été supprimée avec succès",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'agence. Elle pourrait avoir des agents associés.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (agency: any) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      city: agency.city || '',
      chef_agence_id: agency.chef_agence_id || ''
    });
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.city && agency.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agency.chef_agence?.name && agency.chef_agence.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des agences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Agences</h1>
          <p className="text-gray-600">Gérez les agences et leurs responsables</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Agence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Agence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de l'agence *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Agence Dakar Centre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ville
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Dakar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ID Chef d'Agence (optionnel)
                </label>
                <Input
                  value={formData.chef_agence_id}
                  onChange={(e) => setFormData({ ...formData, chef_agence_id: e.target.value })}
                  placeholder="ID utilisateur du chef d'agence"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Créer l'Agence
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agences</p>
                <p className="text-2xl font-bold text-blue-600">{agencies.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avec Chef Assigné</p>
                <p className="text-2xl font-bold text-green-600">
                  {agencies.filter(agency => agency.chef_agence_id).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sans Chef</p>
                <p className="text-2xl font-bold text-orange-600">
                  {agencies.filter(agency => !agency.chef_agence_id).length}
                </p>
              </div>
              <Building className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Agences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, ville ou chef d'agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          {/* Liste des agences */}
          {filteredAgencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Aucune agence trouvée' : 'Aucune agence créée'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAgencies.map((agency) => (
                <div key={agency.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{agency.name}</h4>
                      {agency.city && (
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {agency.city}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">
                      ID: {agency.id}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Chef d'Agence:</span>
                      {agency.chef_agence ? (
                        <div className="mt-1">
                          <Badge className="bg-green-100 text-green-800">
                            {agency.chef_agence.name}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {agency.chef_agence.email}
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 ml-2">
                          Non assigné
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Créée le {format(new Date(agency.created_at || ''), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(agency)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier l'Agence</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateAgency} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Nom de l'agence *
                            </label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Ville
                            </label>
                            <Input
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              ID Chef d'Agence
                            </label>
                            <Input
                              value={formData.chef_agence_id}
                              onChange={(e) => setFormData({ ...formData, chef_agence_id: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" className="flex-1">
                              Sauvegarder
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditingAgency(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAgency(agency.id)}
                      disabled={isDeleting === agency.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting === agency.id ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyManagement;