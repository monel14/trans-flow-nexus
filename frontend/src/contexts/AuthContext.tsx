
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string; // Contiendra l'identifiant au lieu de l'email
  identifier: string; // L'identifiant formaté (ex: admin.monel, chef.dakar.diallo)
  name: string;
  role: 'agent' | 'chef_agence' | 'admin_general' | 'sous_admin' | 'developer';
  agenceId?: string;
  agenceName?: string;
  isActive: boolean;
  balance?: number;
  commissions?: number;
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (identifier: string, password: string, userData?: { name?: string; role?: string }) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<boolean>; // Backward compatibility
  logout: () => void; // Backward compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Récupérer les informations de l'utilisateur depuis auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return null;
      }
      
      if (!user) {
        console.log('No user found');
        return null;
      }

      console.log('User data:', user);

      // Déterminer le rôle basé sur l'email pour la démo
      let userRole = 'agent'; // Par défaut
      const email = user.email || '';
      
      if (email.includes('admin')) {
        userRole = 'admin_general';
      } else if (email.includes('chef')) {
        userRole = 'chef_agence';
      } else if (email.includes('dev')) {
        userRole = 'developer';
      } else if (email.includes('sousadmin') || email.includes('sadmin')) {
        userRole = 'sous_admin';
      } else {
        userRole = 'agent';
      }

      console.log(`User role determined: ${userRole} based on email: ${email}`);

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        identifier: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
        role: userRole as UserProfile['role'],
        agenceId: email.includes('dakar') ? '1' : email.includes('thies') ? '2' : '1',
        agenceName: email.includes('dakar') ? 'Dakar' : email.includes('thies') ? 'Thiès' : 'Agence Principale',
        isActive: true,
        balance: 100000, // Solde par défaut pour la démo
        commissions: 5000, // Commissions par défaut pour la démo
      };

      console.log('Final user profile:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          // Délayer la récupération du profil pour éviter la récursion
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            setAuthState({
              user: userProfile,
              session,
              isAuthenticated: !!userProfile,
              isLoading: false,
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Vérifier s'il y a une session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(async () => {
          const userProfile = await fetchUserProfile(session.user.id);
          setAuthState({
            user: userProfile,
            session,
            isAuthenticated: !!userProfile,
            isLoading: false,
          });
        }, 0);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (identifier: string, password: string, userData?: { name?: string; role?: string }) => {
    try {
      console.log('📝 Création de compte avec identifiant:', identifier);
      
      // Inscription sans confirmation email pour développement
      // L'identifiant sera stocké dans le champ email de auth.users
      const { error } = await supabase.auth.signUp({
        email: identifier, // On passe l'identifiant comme email
        password,
        options: {
          data: {
            name: userData?.name || identifier.split('.')[1] || identifier, // Extraire le nom de l'identifiant
            identifier: identifier // Stocker aussi l'identifiant original dans user_metadata
          }
        }
      });

      if (error) {
        console.error('❌ Erreur lors de la création de compte:', error.message);
      } else {
        console.log('✅ Compte créé avec succès pour:', identifier);
      }

      return { error };
    } catch (error) {
      console.error('❌ Erreur lors de la création de compte:', error);
      return { error };
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion avec identifiant:', identifier);
      
      // Essayer la connexion directement avec l'email/identifiant donné
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (error) {
        console.error('❌ Erreur de connexion:', error.message);
        
        // Messages d'erreur personnalisés pour les identifiants
        if (error.message === 'Invalid login credentials') {
          return { 
            error: { 
              ...error, 
              message: 'Identifiant ou mot de passe incorrect.' 
            } 
          };
        }
        
        if (error.message === 'Email not confirmed') {
          return { 
            error: { 
              ...error, 
              message: 'Compte non confirmé. Contactez votre administrateur.' 
            } 
          };
        }
      }

      console.log('✅ Connexion réussie pour:', identifier);
      return { error };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Backward compatibility methods
  const login = async (identifier: string, password: string): Promise<boolean> => {
    const { error } = await signIn(identifier, password);
    return !error;
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      signUp, 
      signIn, 
      signOut,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
