
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NewOperation from "@/pages/NewOperation";
import OperationHistory from "@/pages/OperationHistory";
import AgentManagement from "@/pages/AgentManagement";
import TransactionValidation from "@/pages/TransactionValidation";
import OperationTypes from "@/pages/OperationTypes";
import NotFound from "@/pages/NotFound";
import SystemConfig from "@/pages/SystemConfig";
import ErrorLogs from "@/pages/ErrorLogs";
import DeveloperDashboardPage from "@/pages/DeveloperDashboardPage";
import Commissions from "@/pages/Commissions";
import RechargeRequest from "@/pages/RechargeRequest";
import AgentRecharges from "@/pages/AgentRecharges";
import AgencyManagement from "@/pages/AgencyManagement";
import SupportRequests from "@/pages/SupportRequests";

// Lazy-load special pages
const AdminGestionChefsAgence = React.lazy(() => import("@/pages/AdminGestionChefsAgence"));
const AdminGestionSousAdmins = React.lazy(() => import("@/pages/AdminGestionSousAdmins"));

console.log('📱 App.tsx: App component loading...');

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Routes pour les opérations */}
      <Route 
        path="/operations/new" 
        element={
          <ProtectedRoute requiredRole={['agent', 'chef_agence']}>
            <MainLayout>
              <NewOperation />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/operations/history" 
        element={
          <ProtectedRoute requiredRole={['agent', 'chef_agence']}>
            <MainLayout>
              <OperationHistory />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Route pour la gestion des agents (chef d'agence) */}
      <Route 
        path="/agents" 
        element={
          <ProtectedRoute requiredRole={['chef_agence']}>
            <MainLayout>
              <AgentManagement />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Route pour la validation des transactions (admins) */}
      <Route 
        path="/validation" 
        element={
          <ProtectedRoute requiredRole={['admin_general', 'sous_admin']}>
            <MainLayout>
              <TransactionValidation />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Routes développeur */}
      <Route 
        path="/developer/dashboard" 
        element={
          <ProtectedRoute requiredRole={['developer']}>
            <MainLayout>
              <DeveloperDashboardPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/operation-types" 
        element={
          <ProtectedRoute requiredRole={['developer']}>
            <MainLayout>
              <OperationTypes />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route
        path="/system-config"
        element={
          <ProtectedRoute requiredRole={['developer']}>
            <MainLayout>
              <SystemConfig />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/error-logs"
        element={
          <ProtectedRoute requiredRole={['developer']}>
            <MainLayout>
              <ErrorLogs />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Routes pour les commissions */}
      <Route 
        path="/commissions" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Commissions />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Routes pour les recharges */}
      <Route 
        path="/recharge" 
        element={
          <ProtectedRoute requiredRole={['agent', 'chef_agence']}>
            <MainLayout>
              <RechargeRequest />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agent-recharges" 
        element={
          <ProtectedRoute requiredRole={['chef_agence']}>
            <MainLayout>
              <AgentRecharges />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Routes pour la gestion des agences */}
      <Route 
        path="/agencies" 
        element={
          <ProtectedRoute requiredRole={['admin_general']}>
            <MainLayout>
              <AgencyManagement />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Routes pour le support */}
      <Route 
        path="/support" 
        element={
          <ProtectedRoute requiredRole={['admin_general', 'sous_admin']}>
            <MainLayout>
              <SupportRequests />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Autres routes à implémenter */}
      <Route 
        path="/commissions" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Commissions />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/recharge" 
        element={
          <ProtectedRoute requiredRole={['agent', 'chef_agence']}>
            <MainLayout>
              <RechargeRequest />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agent-recharges" 
        element={
          <ProtectedRoute requiredRole={['chef_agence']}>
            <MainLayout>
              <AgentRecharges />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agencies" 
        element={
          <ProtectedRoute requiredRole={['admin_general']}>
            <MainLayout>
              <AgencyManagement />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/support" 
        element={
          <ProtectedRoute requiredRole={['admin_general', 'sous_admin']}>
            <MainLayout>
              <SupportRequests />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      {/* Route pour la gestion des Chefs d'Agence (admin_general) */}
      <Route
        path="/chefs-agence"
        element={
          <ProtectedRoute requiredRole={['admin_general']}>
            <MainLayout>
              <React.Suspense fallback={<div>Chargement...</div>}>
                <AdminGestionChefsAgence />
              </React.Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Route pour la gestion des Sous-Administrateurs */}
      <Route
        path="/sub-admins"
        element={
          <ProtectedRoute requiredRole={['admin_general']}>
            <MainLayout>
              <React.Suspense fallback={<div>Chargement...</div>}>
                <AdminGestionSousAdmins />
              </React.Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import OperationTypesListPage from "@/pages/OperationTypesListPage";

const App = () => {
  console.log('📱 App.tsx: App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

console.log('📱 App.tsx: App component defined');

export default App;
