
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
      
      // 1. Récupérer le profil utilisateur basic
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          agencies (name)
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      console.log('Profile data:', profile);

      // 2. Récupérer le rôle depuis user_roles avec une requête séparée
      const { data: userRoles, error: userRoleError } = await supabase
        .from('user_roles')
        .select(`
          roles (name, label)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      console.log('User roles data:', userRoles);
      
      let userRole = 'agent'; // Par défaut
      if (userRoles && userRoles.roles) {
        userRole = userRoles.roles.name;
      }

      console.log('User role determined:', userRole);

      const userProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: userRole as UserProfile['role'],
        agenceId: profile.agency_id?.toString(),
        agenceName: profile.agencies?.name,
        isActive: profile.is_active ?? true,
        balance: profile.balance || 0,
        commissions: 0, // À calculer si nécessaire
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
      
      // Utiliser l'identifiant comme "email" dans Supabase Auth
      // L'identifiant sera stocké dans le champ email de auth.users
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier, // On passe l'identifiant comme email
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
