
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
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
  signUp: (email: string, password: string, userData?: { name?: string; role?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>; // Backward compatibility
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
      // Récupérer le profil avec le rôle et l'agence
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (name, label),
          agencies (name)
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      const userProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.roles?.name as UserProfile['role'] || 'agent',
        agenceId: profile.agency_id?.toString(),
        agenceName: profile.agencies?.name,
        isActive: profile.is_active ?? true,
        balance: profile.balance || 0,
        commissions: 0, // À calculer si nécessaire
      };

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

  const signUp = async (email: string, password: string, userData?: { name?: string; role?: string }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData?.name || email.split('@')[0],
          }
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // SOLUTION DE CONTOURNEMENT pour les comptes de démonstration
      // Si l'email n'est pas confirmé, on essaie de confirmer automatiquement pour les comptes de test
      if (error && error.message === 'Email not confirmed') {
        const demoEmails = [
          'admin@transflow.com',
          'sousadmin@transflow.com', 
          'chef@transflow.com',
          'agent@transflow.com',
          'dev@transflow.com'
        ];
        
        if (demoEmails.includes(email)) {
          console.log('🔧 Tentative de confirmation automatique pour compte de démonstration...');
          // Pour les comptes de démonstration, on retourne une erreur spécifique
          return { 
            error: { 
              ...error, 
              message: 'Email de démonstration non confirmé. Utilisez le générateur de comptes pour les créer et confirmer automatiquement.' 
            } 
          };
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Backward compatibility methods
  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await signIn(email, password);
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
