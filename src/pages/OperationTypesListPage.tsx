
import React, { useState } from "react";
import DataTable from "@/components/OperationTypes/DataTable";
import { Button } from "@/components/ui/button";
import OperationTypeModalForm from "@/components/OperationTypes/OperationTypeModalForm";
import { OperationType } from "@/hooks/useOperationTypes";

const OperationTypesListPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOperationType, setEditOperationType] = useState<OperationType | null>(null);

  const handleEdit = (operationType: OperationType) => {
    setEditOperationType(operationType);
    setModalOpen(true);
  };

  const handleConfig = (operationType: OperationType) => {
    console.log("Configuration pour:", operationType.name);
    // TODO: Implémenter la configuration avancée
  };

  const handleCreate = () => {
    setEditOperationType(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditOperationType(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Types d'Opérations</h1>
          <p className="text-gray-600">
            Liste des types d'opérations configurés sur la plateforme.
          </p>
        </div>
        <Button onClick={handleCreate}>+ Créer</Button>
      </div>

      <DataTable onEdit={handleEdit} onConfig={handleConfig} />

      <OperationTypeModalForm 
        isOpen={modalOpen} 
        onClose={handleClose}
        operationType={editOperationType}
      />
    </div>
  );
};

export default OperationTypesListPage;
