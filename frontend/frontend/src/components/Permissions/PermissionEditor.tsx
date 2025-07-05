
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const allPermissions = [
  "Valider Transactions",
  "Voir Rapports",
  "Gérer Requêtes",
  "Assigner Transactions",
  "Voir Audit Système",
];

type Props = {
  permissions: string[];
  onSave: (perms: string[]) => void;
  onCancel: () => void;
};

const PermissionEditor: React.FC<Props> = ({ permissions, onSave, onCancel }) => {
  const [selected, setSelected] = useState<string[]>(permissions);

  const toggle = (perm: string) => {
    setSelected((s) =>
      s.includes(perm) ? s.filter((p) => p !== perm) : [...s, perm]
    );
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {allPermissions.map((perm) => (
          <div key={perm} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(perm)}
              onChange={() => toggle(perm)}
              id={perm}
            />
            <label htmlFor={perm} className="text-sm">{perm}</label>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(selected)} className="flex-1">Enregistrer</Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">Annuler</Button>
      </div>
    </div>
  );
};

export default PermissionEditor;
