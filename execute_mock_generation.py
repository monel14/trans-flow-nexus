#!/usr/bin/env python3
"""
Exécution directe de la génération de données via RPC functions
"""

import json
import uuid
import random
from datetime import datetime, timedelta
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def execute_data_generation():
    """Exécute la génération de données via RPC"""
    print("🚀 EXÉCUTION DE LA GÉNÉRATION DE DONNÉES")
    print("="*60)
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    created_users = []
    
    try:
        # 1. Créer des agences directement (essayer sans RLS)
        print("🏢 Création des agences...")
        
        agencies_data = [
            {"name": "Agence de Douala", "city": "Douala", "is_active": True},
            {"name": "Agence de Yaoundé", "city": "Yaoundé", "is_active": True}
        ]
        
        agencies = []
        for agency_data in agencies_data:
            try:
                # Vérifier si existe déjà
                existing = supabase.table('agencies').select('*').eq('name', agency_data['name']).execute()
                if existing.data:
                    agencies.append(existing.data[0])
                    print(f"✅ Agence existante trouvée: {agency_data['name']}")
                else:
                    # Essayer d'insérer
                    result = supabase.table('agencies').insert(agency_data).execute()
                    if result.data:
                        agencies.append(result.data[0])
                        print(f"✅ Agence créée: {agency_data['name']}")
            except Exception as e:
                print(f"❌ Erreur agence {agency_data['name']}: {e}")
        
        if len(agencies) < 2:
            print("❌ Impossible de créer les agences. Arrêt.")
            return False
        
        # 2. Créer des utilisateurs via RPC
        print("\n👥 Création des utilisateurs via RPC...")
        
        # Admin général
        try:
            result = supabase.rpc('create_admin_user', {
                'user_name': 'Admin Général',
                'user_email': 'admin.general@transflow.com',
                'user_password': 'Demo123!'
            }).execute()
            
            if result.data:
                created_users.append(result.data)
                print(f"✅ Admin général créé: {result.data}")
            else:
                print(f"❌ Erreur création admin général")
                
        except Exception as e:
            print(f"❌ Erreur RPC admin général: {e}")
        
        # Sous-admin
        try:
            result = supabase.rpc('create_sous_admin', {
                'user_name': 'Sous Administrateur',
                'user_email': 'sous.admin@transflow.com',
                'user_password': 'Demo123!'
            }).execute()
            
            if result.data:
                created_users.append(result.data)
                print(f"✅ Sous-admin créé: {result.data}")
            
        except Exception as e:
            print(f"❌ Erreur RPC sous-admin: {e}")
        
        # Chefs d'agence
        chef_names = ['Mamadou Diallo', 'Aminata Touré']
        chef_emails = ['chef.douala@transflow.com', 'chef.yaoundé@transflow.com']
        
        for i, (name, email) in enumerate(zip(chef_names, chef_emails)):
            try:
                result = supabase.rpc('create_chef_agence', {
                    'user_name': name,
                    'user_email': email,
                    'user_password': 'Demo123!',
                    'agency_id': agencies[i]['id']
                }).execute()
                
                if result.data:
                    created_users.append(result.data)
                    print(f"✅ Chef d'agence créé: {email}")
                    
                    # Mettre à jour l'agence avec le chef
                    try:
                        supabase.table('agencies').update({
                            'chef_agence_id': result.data
                        }).eq('id', agencies[i]['id']).execute()
                        print(f"✅ Chef assigné à {agencies[i]['name']}")
                    except Exception as e2:
                        print(f"❌ Erreur assignation chef: {e2}")
                
            except Exception as e:
                print(f"❌ Erreur RPC chef {email}: {e}")
        
        # Agents
        agent_names = [
            'Ousmane Cissé', 'Fatou Keita', 'Ibrahim Bah', 'Khadija Sow',
            'Seydou Camara', 'Bineta Fofana', 'Cheikh Doumbia', 'Adama Sanogo'
        ]
        
        for i, name in enumerate(agent_names):
            agency_idx = i % len(agencies)
            city = agencies[agency_idx]['city'].lower()
            email = f"agent{i+1}.{city}@transflow.com"
            
            try:
                result = supabase.rpc('create_agent', {
                    'user_name': name,
                    'user_email': email,
                    'user_password': 'Demo123!',
                    'agency_id': agencies[agency_idx]['id']
                }).execute()
                
                if result.data:
                    created_users.append(result.data)
                    print(f"✅ Agent créé: {email}")
                
            except Exception as e:
                print(f"❌ Erreur RPC agent {email}: {e}")
        
        # 3. Créer les types d'opérations (essayer)
        print("\n💳 Création des types d'opérations...")
        
        operation_types = [
            {
                "name": "Dépôt Orange Money",
                "description": "Dépôt d'argent sur compte Orange Money",
                "impacts_balance": True,
                "is_active": True,
                "status": "active"
            },
            {
                "name": "Retrait MTN MoMo", 
                "description": "Retrait d'argent depuis compte MTN Mobile Money",
                "impacts_balance": True,
                "is_active": True,
                "status": "active"
            },
            {
                "name": "Enregistrement KYC Client",
                "description": "Enregistrement et vérification identité client", 
                "impacts_balance": False,
                "is_active": True,
                "status": "active"
            }
        ]
        
        created_op_types = []
        for op_type in operation_types:
            try:
                existing = supabase.table('operation_types').select('*').eq('name', op_type['name']).execute()
                if existing.data:
                    created_op_types.append(existing.data[0])
                    print(f"✅ Type d'opération existant: {op_type['name']}")
                else:
                    result = supabase.table('operation_types').insert(op_type).execute()
                    if result.data:
                        created_op_types.append(result.data[0])
                        print(f"✅ Type d'opération créé: {op_type['name']}")
                        
            except Exception as e:
                print(f"❌ Erreur type d'opération {op_type['name']}: {e}")
        
        # 4. Rapport final
        print("\n" + "="*60)
        print("📋 RAPPORT DE GÉNÉRATION")
        print("="*60)
        
        # Vérifier les résultats
        profiles = supabase.table('profiles').select('*, roles(name)').execute()
        agencies_final = supabase.table('agencies').select('*').execute()
        op_types_final = supabase.table('operation_types').select('*').execute()
        
        print(f"👥 Utilisateurs créés: {len(profiles.data)}")
        print(f"🏢 Agences: {len(agencies_final.data)}")
        print(f"💳 Types d'opérations: {len(op_types_final.data)}")
        
        if len(profiles.data) > 0:
            print(f"\n📧 Comptes de connexion créés:")
            for profile in profiles.data:
                print(f"   • {profile['email']} / Demo123!")
        
        print(f"\n✅ Génération terminée!")
        print("="*60)
        
        return len(profiles.data) > 0
        
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = execute_data_generation()
    
    if success:
        print("\n🚀 Données générées avec succès ! Vérification...")
        import subprocess
        subprocess.run(["python", "verify_mock_data.py"])
    else:
        print("\n🔧 Génération échouée. Utiliser le script SQL manuel.")