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

      {/* Route pour la gestion des types d'opérations (développeur) */}
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

      {/* Autres routes à implémenter */}
      <Route 
        path="/commissions" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Mes Commissions</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/recharge" 
        element={
          <ProtectedRoute requiredRole={['agent', 'chef_agence']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Demander une Recharge</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agent-recharges" 
        element={
          <ProtectedRoute requiredRole={['chef_agence']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Recharges des Agents</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agencies" 
        element={
          <ProtectedRoute requiredRole={['admin_general']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Gestion des Agences</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/support" 
        element={
          <ProtectedRoute requiredRole={['admin_general', 'sous_admin']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Requêtes Support</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
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
                {React.createElement(require("@/pages/AdminGestionChefsAgence").default)}
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
                {React.createElement(require("@/pages/AdminGestionSousAdmins").default)}
              </React.Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
