#!/usr/bin/env python3
"""
Script pour corriger l'assignation des rôles des comptes de démonstration.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def assign_role_to_user(user_id, role_name, agency_id=None):
    """Assigner un rôle à un utilisateur."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Récupérer l'ID du rôle
        role_result = supabase.table('roles').select('id').eq('name', role_name).execute()
        
        if not role_result.data:
            print(f"   ❌ Rôle {role_name} non trouvé")
            return False
        
        role_id = role_result.data[0]['id']
        
        # Vérifier si l'utilisateur a déjà un rôle
        existing_role = supabase.table('user_roles').select('*').eq('user_id', user_id).execute()
        
        if existing_role.data:
            # Mettre à jour le rôle existant
            result = supabase.table('user_roles').update({
                'role_id': role_id,
                'agency_id': agency_id,
                'is_active': True
            }).eq('user_id', user_id).execute()
            
            if result.data:
                print(f"   ✅ Rôle {role_name} mis à jour")
                return True
        else:
            # Créer un nouveau rôle
            import uuid
            result = supabase.table('user_roles').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'role_id': role_id,
                'agency_id': agency_id,
                'is_active': True
            }).execute()
            
            if result.data:
                print(f"   ✅ Rôle {role_name} assigné")
                return True
        
        print(f"   ❌ Échec assignation rôle {role_name}")
        return False
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def fix_user_roles():
    """Corriger les rôles de tous les utilisateurs de démonstration."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("🔧 CORRECTION DES RÔLES UTILISATEURS")
        print("="*40)
        
        # Récupérer tous les profils
        profiles_result = supabase.table('profiles').select('*').execute()
        
        if not profiles_result.data:
            print("❌ Aucun profil trouvé")
            return
        
        # Mapping des identifiants vers les rôles corrects
        role_mapping = {
            'admin_monel@transflownexus.demo': ('admin_general', None),
            'sadmin_pierre@transflownexus.demo': ('sous_admin', None),
            'chef_dakar_diallo@transflownexus.demo': ('chef_agence', 1),
            'chef_thies_fall@transflownexus.demo': ('chef_agence', 2),
            'dkr01_fatou@transflownexus.demo': ('agent', 1),
            'ths01_amadou@transflownexus.demo': ('agent', 2)
        }
        
        success_count = 0
        
        for profile in profiles_result.data:
            user_id = profile['id']
            email = profile['email']
            name = profile['name']
            
            print(f"👤 {name} ({email})")
            
            if email in role_mapping:
                role_name, agency_id = role_mapping[email]
                
                if assign_role_to_user(user_id, role_name, agency_id):
                    success_count += 1
                    
                    # Mettre à jour l'agence dans le profil si nécessaire
                    if agency_id:
                        supabase.table('profiles').update({
                            'agency_id': agency_id
                        }).eq('id', user_id).execute()
                        print(f"   ✅ Agence {agency_id} assignée")
            else:
                print(f"   ⚠️  Pas de mapping trouvé pour {email}")
            
            print()
        
        print(f"🎉 {success_count} rôles corrigés avec succès!")
        
        # Vérifier les résultats
        print("\n📊 VÉRIFICATION DES RÔLES:")
        print("-" * 30)
        
        for profile in profiles_result.data:
            user_id = profile['id']
            name = profile['name']
            
            # Récupérer le rôle de l'utilisateur
            user_role_result = supabase.table('user_roles').select('''
                *,
                roles (name, label)
            ''').eq('user_id', user_id).eq('is_active', True).execute()
            
            if user_role_result.data:
                role_info = user_role_result.data[0]['roles']
                agency_id = user_role_result.data[0].get('agency_id', 'Global')
                print(f"✅ {name}: {role_info['label']} (Agence: {agency_id})")
            else:
                print(f"❌ {name}: Aucun rôle assigné")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    if fix_user_roles():
        print("\n🎯 RÔLES CORRIGÉS AVEC SUCCÈS!")
        print("🔗 Testez maintenant: http://localhost:8080/")
        print("💡 Les utilisateurs devraient avoir les bons rôles et permissions")
    else:
        print("❌ Échec de la correction des rôles")

if __name__ == "__main__":
    main()