
import React, { useState } from "react";
import DataTable from "@/components/OperationTypes/DataTable";
import { Button } from "@/components/ui/button";
import OperationTypeModalForm from "@/components/OperationTypes/OperationTypeModalForm";

const OperationTypesListPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Types d'Opérations</h1>
          <p className="text-gray-600">
            Liste des types d’opérations configurés sur la plateforme.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Créer</Button>
      </div>

      <DataTable />

      <OperationTypeModalForm isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default OperationTypesListPage;
