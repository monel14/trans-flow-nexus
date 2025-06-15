
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, UserX, Edit } from "lucide-react";

const mockChefs = [
  {
    id: "CHEFAG1",
    name: "Jean Kouanda",
    email: "jean@transflow.com",
    phone: "+226 70 XX XX XX",
    agency: "Agence Centre-Ville",
    city: "Ouagadougou",
    status: "Actif",
    createdAt: "2024-02-01",
  },
  {
    id: "CHEFAG2",
    name: "Awa Sawadogo",
    email: "awa@transflow.com",
    phone: "+226 75 XX XX XX",
    agency: "Agence Zogona",
    city: "Ouagadougou",
    status: "Suspendu",
    createdAt: "2024-01-10",
  },
];

const AdminGestionChefsAgence = () => {
  const [chefs, setChefs] = useState(mockChefs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editChef, setEditChef] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", agency: "", city: "" });

  const handleOpenCreate = () => {
    setEditChef(null);
    setForm({ name: "", email: "", phone: "", agency: "", city: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (chef: any) => {
    setEditChef(chef);
    setForm({
      name: chef.name,
      email: chef.email,
      phone: chef.phone,
      agency: chef.agency,
      city: chef.city,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editChef) {
      setChefs((prev) =>
        prev.map((c) => (c.id === editChef.id ? { ...c, ...form } : c))
      );
    } else {
      setChefs((prev) => [
        ...prev,
        {
          id: `CHEFAG${prev.length + 1}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          agency: form.agency,
          city: form.city,
          status: "Actif",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleToggleStatus = (id: string, current: string) => {
    setChefs((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: current === "Actif" ? "Suspendu" : "Actif" }
          : c
      )
    );
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Date Création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chefs.map((chef) => (
                  <TableRow key={chef.id}>
                    <TableCell>{chef.name}</TableCell>
                    <TableCell>{chef.email}</TableCell>
                    <TableCell>{chef.phone}</TableCell>
                    <TableCell>{chef.agency}</TableCell>
                    <TableCell>{chef.city}</TableCell>
                    <TableCell>{chef.createdAt}</TableCell>
                    <TableCell>
                      <Badge className={chef.status === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {chef.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleOpenEdit(chef)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={chef.status === "Actif" ? "Suspendre" : "Réactiver"}
                        onClick={() => handleToggleStatus(chef.id, chef.status)}
                      >
                        <UserX className="h-4 w-4" />
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
            <div>
              <Label>Téléphone *</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Agence *</Label>
              <Input value={form.agency} onChange={e => setForm(f => ({ ...f, agency: e.target.value }))} />
            </div>
            <div>
              <Label>Ville *</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <Button onClick={handleSave} className="w-full">{editChef ? "Enregistrer les modifications" : "Créer le Chef d'Agence"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGestionChefsAgence;
