
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, UserX, Edit } from "lucide-react";
import PermissionEditor from "@/components/Permissions/PermissionEditor";

const mockSousAdmins = [
  {
    id: "SUBADMIN1",
    name: "Ali Savadogo",
    email: "ali@transflow.com",
    status: "Actif",
    createdAt: "2024-03-20",
    permissions: ["Valider Transactions", "Voir Rapports"],
  },
];

const AdminGestionSousAdmins = () => {
  const [sousAdmins, setSousAdmins] = useState(mockSousAdmins);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editSousAdmin, setEditSousAdmin] = useState<any>(null);
  const [permissionsModal, setPermissionsModal] = useState(false);
  const [selectedSousAdmin, setSelectedSousAdmin] = useState<any>(null);

  const handleOpenCreate = () => {
    setEditSousAdmin(null);
    setForm({ name: "", email: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (admin: any) => {
    setEditSousAdmin(admin);
    setForm({ name: admin.name, email: admin.email });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editSousAdmin) {
      setSousAdmins(prev =>
        prev.map(a => (a.id === editSousAdmin.id ? { ...a, ...form } : a))
      );
    } else {
      setSousAdmins(prev => [
        ...prev,
        {
          id: `SUBADMIN${prev.length + 1}`,
          name: form.name,
          email: form.email,
          status: "Actif",
          createdAt: new Date().toISOString().split("T")[0],
          permissions: [],
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleToggleStatus = (id: string, current: string) => {
    setSousAdmins(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: current === "Actif" ? "Suspendu" : "Actif" } : a
      )
    );
  };

  const handlePermissions = (admin: any) => {
    setSelectedSousAdmin(admin);
    setPermissionsModal(true);
  };

  const handleSavePermissions = (perms: string[]) => {
    setSousAdmins(prev =>
      prev.map(a =>
        a.id === selectedSousAdmin.id ? { ...a, permissions: perms } : a
      )
    );
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sousAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.createdAt}</TableCell>
                    <TableCell>
                      <Badge className={admin.status === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{admin.permissions.join(", ") || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleOpenEdit(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={admin.status === "Actif" ? "Suspendre" : "Réactiver"}
                        onClick={() => handleToggleStatus(admin.id, admin.status)}
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
