
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

      {/* Autres routes protégées à implémenter */}
      <Route 
        path="/operations/*" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Gestion des Opérations</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/agents" 
        element={
          <ProtectedRoute requiredRole={['chef_agence']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Gestion des Agents</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/validation" 
        element={
          <ProtectedRoute requiredRole={['admin_general', 'sous_admin']}>
            <MainLayout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Validation des Transactions</h2>
                <p className="text-gray-600">Cette section sera implémentée prochainement.</p>
              </div>
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
