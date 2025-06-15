import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, UserX, Edit } from "lucide-react";
import PermissionEditor from "@/components/Permissions/PermissionEditor";
import { useSousAdmins, useCreateSousAdmin, useToggleSousAdminStatus } from "@/hooks/useSousAdmins";
import { toast } from "@/components/ui/use-toast";

const AdminGestionSousAdmins = () => {
  const { data: sousAdmins = [], isLoading, error } = useSousAdmins();
  const createSousAdmin = useCreateSousAdmin();
  const toggleSousAdmin = useToggleSousAdminStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSousAdmin, setEditSousAdmin] = useState<any>(null);
  const [permissionsModal, setPermissionsModal] = useState(false);
  const [selectedSousAdmin, setSelectedSousAdmin] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleOpenCreate = () => {
    setEditSousAdmin(null);
    setForm({ name: "", email: "", password: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (admin: any) => {
    setEditSousAdmin(admin);
    setForm({ name: admin.name, email: admin.email, password: "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editSousAdmin && !form.password)) {
      toast({ title: "Erreur", description: "Nom, email et mot de passe requis", variant: "destructive" });
      return;
    }
    try {
      await createSousAdmin.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast({ title: "Succès", description: `Sous-Administrateur créé.` });
      setModalOpen(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleStatus = async (user_id: string, is_active: boolean) => {
    try {
      await toggleSousAdmin.mutateAsync({ user_id, is_active: !is_active });
      toast({ title: "Statut modifié", description: `Le sous-admin a été ${!is_active ? "activé" : "suspendu"}.` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  // Permissions : pour la V1, laisser le mock PermissionEditor, ajouter vérif côté backend plus tard
  const handlePermissions = (admin: any) => {
    setSelectedSousAdmin(admin);
    setPermissionsModal(true);
  };

  const handleSavePermissions = (_perms: string[]) => {
    // Stocker permissions en base dans une future évolution
    toast({ title: "Permissions", description: "Modification des permissions non disponible dans cette version." });
    setPermissionsModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Sous-Administrateurs</h1>
          <p className="text-gray-600">Créez, modifiez, suspendez et configurez les sous-admins</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau Sous-Admin
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sous-Administrateurs</CardTitle>
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
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sousAdmins.map((admin: any) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge className={admin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {admin.is_active ? "Actif" : "Suspendu"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleOpenEdit(admin)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={admin.is_active ? "Suspendre" : "Réactiver"}
                          onClick={() => handleToggleStatus(admin.user_id, admin.is_active)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Permissions"
                          onClick={() => handlePermissions(admin)}
                        >
                          <span className="underline text-xs">Permissions</span>
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
            <DialogTitle>{editSousAdmin ? "Modifier Sous-Administrateur" : "Créer Sous-Administrateur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            {!editSousAdmin && (
              <div>
                <Label>Mot de passe *</Label>
                <Input value={form.password} type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}
            <Button onClick={handleSave} className="w-full">{editSousAdmin ? "Enregistrer les modifications" : "Créer le Sous-Admin"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={permissionsModal} onOpenChange={setPermissionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permissions de {selectedSousAdmin?.name}</DialogTitle>
          </DialogHeader>
          <PermissionEditor
            permissions={selectedSousAdmin?.permissions || []}
            onSave={handleSavePermissions}
            onCancel={() => setPermissionsModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGestionSousAdmins;
