
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, UserX, Edit } from "lucide-react";
import { useChefsAgence, useCreateChefAgence, useToggleChefAgence } from "@/hooks/useChefsAgence";
import { toast } from "@/components/ui/use-toast";

const AdminGestionChefsAgence = () => {
  const { data: chefs = [], isLoading, error } = useChefsAgence();
  const createChef = useCreateChefAgence();
  const toggleChef = useToggleChefAgence();
  const [modalOpen, setModalOpen] = useState(false);
  const [editChef, setEditChef] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", agency: "", city: "", password: "" });

  const handleOpenCreate = () => {
    setEditChef(null);
    setForm({ name: "", email: "", phone: "", agency: "", city: "", password: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (chef: any) => {
    setEditChef(chef);
    setForm({
      name: chef.name,
      email: chef.email,
      phone: chef.phone || "",
      agency: chef.agency || "",
      city: chef.city || "",
      password: "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Erreur", description: "Nom, email et mot de passe requis", variant: "destructive" });
      return;
    }
    try {
      await createChef.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        agency_id: null, // Remplacer par l'ID réel de l'agence si besoin
      });
      toast({ title: "Succès", description: `Chef d'agence créé.` });
      setModalOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (user_id: string, is_active: boolean) => {
    try {
      await toggleChef.mutateAsync({ user_id, is_active: !is_active });
      toast({ title: "Statut modifié", description: `Le chef a été ${!is_active ? "activé" : "suspendu"}.` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chefs d'Agence</h1>
          <p className="text-gray-600">Créez, modifiez ou suspendez les responsables d'agence</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Chef d'Agence
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Chefs d'Agence</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-600">Chargement…</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 text-sm">{error.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chefs.map((chef: any) => (
                    <TableRow key={chef.id}>
                      <TableCell>{chef.roles?.label || chef.roles?.name}</TableCell>
                      <TableCell>{chef.email}</TableCell>
                      <TableCell>{chef.roles?.label || chef.roles?.name}</TableCell>
                      <TableCell>{chef.agencies?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge className={chef.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {chef.is_active ? "Actif" : "Suspendu"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleOpenEdit(chef)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={chef.is_active ? "Suspendre" : "Réactiver"}
                          onClick={() => handleToggleStatus(chef.user_id, chef.is_active)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editChef ? "Modifier Chef d'Agence" : "Créer Chef d'Agence"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom et Prénom *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            {/* Pour l'exemple, password obligatoire côté API, à cacher si edit */}
            {!editChef && (
              <div>
                <Label>Mot de passe *</Label>
                <Input value={form.password} type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}
            <Button onClick={handleSave} className="w-full" disabled={createChef.isPending}>{editChef ? "Enregistrer les modifications" : "Créer le Chef d'Agence"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGestionChefsAgence;
