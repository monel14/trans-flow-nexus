
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const OperationTypeModalForm: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState("general");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau Type d’Opération</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="fields">Champs</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <form className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input placeholder="ex: Transfert d’argent" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="Description détaillée..." />
              </div>
            </form>
          </TabsContent>
          <TabsContent value="fields">
            <div>
              <p>Configuration des champs du formulaire (à implémenter).</p>
            </div>
          </TabsContent>
          <TabsContent value="commissions">
            <div>
              <p>Configuration des commissions (à implémenter).</p>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button>Créer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypeModalForm;
