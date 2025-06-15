
import React from "react";

// Cette version d'exemple illustre la structure. Remplacez ceci par la connexion réelle à Supabase ou vos hooks.
const mockData = [
  { name: "Transfert", description: "Transfert d'argent", status: "Actif" },
  { name: "Paiement", description: "Paiement de facture", status: "Inactif" },
];

const DataTable = () => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full text-sm text-left">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 font-medium">Nom</th>
          <th className="px-4 py-3 font-medium">Description</th>
          <th className="px-4 py-3 font-medium">Statut</th>
        </tr>
      </thead>
      <tbody>
        {mockData.map((row, idx) => (
          <tr key={idx}>
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">{row.description}</td>
            <td className="px-4 py-2">{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
