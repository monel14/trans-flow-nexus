
import React from "react";
import ButtonLink from "@/components/Developer/ButtonLink";
import StatCard from "@/components/Developer/StatCard";

const DeveloperDashboardPage = () => (
  <div className="max-w-4xl mx-auto py-8 space-y-8">
    <h1 className="text-3xl font-bold mb-6">Tableau de Bord Développeur</h1>

    {/* Accès Rapides */}
    <div className="flex flex-wrap gap-4">
      <ButtonLink to="/developer/operation-types">
        Types d'Opérations
      </ButtonLink>
      <ButtonLink to="/system-config">
        Configuration Système
      </ButtonLink>
      <ButtonLink to="/error-logs">
        Journaux d'Erreurs
      </ButtonLink>
    </div>

    {/* Indicateurs de Santé */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
      <StatCard title="Opérations totales" value="215" />
      <StatCard title="Types d'opération actifs" value="8" />
      <StatCard title="Uptime API (%)" value="100%" />
    </div>
  </div>
);

export default DeveloperDashboardPage;
