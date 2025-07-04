
import { Link } from 'react-router-dom';
import { Shield, Users, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

console.log('🏠 Index.tsx: Index component loading...');

const Index = () => {
  console.log('🏠 Index.tsx: Index component rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-200 mr-4" />
            <h1 className="text-5xl font-bold">TransFlow Nexus</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Plateforme sécurisée de gestion des opérations financières et transferts d'argent
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-xl font-semibold mb-2">Gestion Multi-Agences</h3>
            <p className="text-blue-100">Gérez efficacement toutes vos agences et agents depuis une interface centralisée</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-xl font-semibold mb-2">Suivi en Temps Réel</h3>
            <p className="text-blue-100">Monitorer les transactions et performances avec des tableaux de bord avancés</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-xl font-semibold mb-2">Sécurité Renforcée</h3>
            <p className="text-blue-100">Système de validation multi-niveaux et audit complet des opérations</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Accéder à la Plateforme</h2>
            <p className="text-gray-600 mb-6">Connectez-vous pour gérer vos opérations financières</p>
            
            <Link to="/login">
              <Button className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700">
                <Shield className="h-5 w-5 mr-2" />
                Se Connecter
              </Button>
            </Link>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Comptes de démonstration :</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Agent :</strong> agent@demo.com / demo123</p>
                <p><strong>Chef d'Agence :</strong> chef@demo.com / demo123</p>
                <p><strong>Admin Général :</strong> admin@demo.com / demo123</p>
                <p><strong>Développeur :</strong> dev@demo.com / demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} TransFlow Nexus. Tous droits réservés.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Aide</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Support Technique</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

console.log('🏠 Index.tsx: Index component defined');

export default Index;
