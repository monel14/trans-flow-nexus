#!/usr/bin/env python3
"""
Générateur de données mock utilisant les fonctions RPC de Supabase
"""

import os
import json
import uuid
from datetime import datetime, timedelta
import random
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

# Données réalistes
FIRST_NAMES = [
    "Ahmed", "Aminata", "Ousmane", "Fatou", "Mamadou", "Aissatou", 
    "Ibrahim", "Maryam", "Moussa", "Khadija", "Alassane", "Bineta",
    "Seydou", "Ramata", "Bakary", "Ndeye", "Cheikh", "Adama"
]

LAST_NAMES = [
    "Diallo", "Traoré", "Cissé", "Kone", "Camara", "Touré", 
    "Bah", "Sow", "Barry", "Baldé", "Keita", "Fofana",
    "Diakité", "Sanogo", "Coulibaly", "Doumbia", "Kanoute", "Sidibé"
]

class SimpleDataGenerator:
    """Générateur simplifié utilisant les RPC functions"""
    
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.created_users = []
        
    def generate_phone(self) -> str:
        """Génère un numéro de téléphone réaliste"""
        prefixes = ["77", "78", "70", "76", "75"]
        return f"+221{random.choice(prefixes)}{random.randint(1000000, 9999999)}"
    
    def create_agencies_direct(self):
        """Crée les agences directement avec une requête SQL"""
        print("🏢 Création des agences...")
        
        try:
            # Insérer directement via SQL pour contourner RLS
            query = """
            INSERT INTO agencies (name, city, is_active) 
            VALUES 
                ('Agence de Douala', 'Douala', true),
                ('Agence de Yaoundé', 'Yaoundé', true)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
            """
            
            result = self.supabase.rpc('exec_sql', {'query': query}).execute()
            print(f"✅ Agences créées via SQL direct")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création des agences: {e}")
            
            # Essayer une approche alternative : vérifier les agences existantes
            try:
                existing_agencies = self.supabase.table('agencies').select('*').execute()
                if len(existing_agencies.data) == 0:
                    # Si aucune agence, essayer de créer via une fonction personnalisée
                    agencies_data = [
                        {"name": "Agence de Douala", "city": "Douala", "is_active": True},
                        {"name": "Agence de Yaoundé", "city": "Yaoundé", "is_active": True}
                    ]
                    
                    for agency_data in agencies_data:
                        try:
                            self.supabase.table('agencies').insert(agency_data).execute()
                            print(f"✅ Agence {agency_data['name']} créée")
                        except Exception as e2:
                            print(f"❌ Erreur spécifique agence: {e2}")
                else:
                    print(f"✅ {len(existing_agencies.data)} agences déjà existantes")
                    
            except Exception as e3:
                print(f"❌ Erreur alternative: {e3}")
    
    def get_agencies(self):
        """Récupère les agences existantes"""
        try:
            result = self.supabase.table('agencies').select('*').execute()
            return result.data
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des agences: {e}")
            return []
    
    def create_demo_users_via_rpc(self):
        """Crée les utilisateurs en utilisant les fonctions RPC"""
        print("👥 Création des utilisateurs via RPC...")
        
        # Récupérer les agences
        agencies = self.get_agencies()
        if len(agencies) < 2:
            print("❌ Pas assez d'agences, création impossible")
            return
        
        users_to_create = [
            # Admin général
            {
                "function": "create_admin_user",
                "params": {
                    "user_name": "Admin Général",
                    "user_email": "admin.general@transflow.com",
                    "user_password": "Demo123!"
                }
            },
            # Sous-admin
            {
                "function": "create_sous_admin",
                "params": {
                    "user_name": "Sous Admin",
                    "user_email": "sous.admin@transflow.com", 
                    "user_password": "Demo123!"
                }
            },
            # Chefs d'agence
            {
                "function": "create_chef_agence",
                "params": {
                    "user_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "user_email": "chef.douala@transflow.com",
                    "user_password": "Demo123!",
                    "agency_id": agencies[0]['id']
                }
            },
            {
                "function": "create_chef_agence", 
                "params": {
                    "user_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "user_email": "chef.yaoundé@transflow.com",
                    "user_password": "Demo123!",
                    "agency_id": agencies[1]['id']
                }
            }
        ]
        
        # Ajouter des agents
        for i in range(8):
            agency_id = agencies[i % len(agencies)]['id']
            city = agencies[i % len(agencies)]['city'].lower()
            
            agent_data = {
                "function": "create_agent",
                "params": {
                    "user_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "user_email": f"agent{i+1}.{city}@transflow.com",
                    "user_password": "Demo123!",
                    "agency_id": agency_id
                }
            }
            users_to_create.append(agent_data)
        
        # Créer les utilisateurs
        for user_config in users_to_create:
            try:
                result = self.supabase.rpc(user_config["function"], user_config["params"]).execute()
                if result.data:
                    user_id = result.data
                    self.created_users.append({
                        "id": user_id,
                        "email": user_config["params"]["user_email"],
                        "name": user_config["params"]["user_name"]
                    })
                    print(f"✅ Utilisateur créé: {user_config['params']['user_email']}")
                else:
                    print(f"❌ Erreur lors de la création de {user_config['params']['user_email']}")
                    
            except Exception as e:
                print(f"❌ Erreur RPC pour {user_config['params']['user_email']}: {e}")
    
    def create_developer_manual(self):
        """Crée un compte développeur manuellement"""
        print("💻 Création du compte développeur...")
        
        try:
            # Créer d'abord l'utilisateur auth
            auth_data = {
                "email": "developer@transflow.com",
                "password": "Demo123!",
                "user_metadata": {
                    "name": "Développeur System"
                }
            }
            
            # Essayer de créer via l'API auth admin (si disponible)
            # Sinon, on créera juste le profil
            
            developer_profile = {
                "id": str(uuid.uuid4()),
                "email": "developer@transflow.com",
                "name": "Développeur System",
                "first_name": "Développeur",
                "last_name": "System",
                "role_id": 5,  # ID du rôle developer
                "agency_id": None,
                "balance": 0.0,
                "is_active": True
            }
            
            # Essayer d'insérer le profil
            result = self.supabase.table('profiles').insert(developer_profile).execute()
            
            if result.data:
                print(f"✅ Profil développeur créé: {developer_profile['email']}")
                self.created_users.append({
                    "id": developer_profile['id'],
                    "email": developer_profile['email'],
                    "name": developer_profile['name']
                })
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du développeur: {e}")
    
    def create_operation_types(self):
        """Crée les types d'opérations"""
        print("💳 Création des types d'opérations...")
        
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
                "name": "Paiement Facture ENEO",
                "description": "Paiement facture électricité ENEO",
                "impacts_balance": True,
                "is_active": True,
                "status": "active"
            },
            {
                "name": "Paiement Abonnement Canal+",
                "description": "Paiement abonnement télévision Canal+",
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
        
        for op_type in operation_types:
            try:
                # Vérifier si existe déjà
                existing = self.supabase.table('operation_types').select('*').eq('name', op_type['name']).execute()
                
                if not existing.data:
                    result = self.supabase.table('operation_types').insert(op_type).execute()
                    if result.data:
                        print(f"✅ Type d'opération créé: {op_type['name']}")
                    else:
                        print(f"❌ Erreur lors de la création du type: {op_type['name']}")
                else:
                    print(f"✅ Type d'opération existe déjà: {op_type['name']}")
                    
            except Exception as e:
                print(f"❌ Erreur pour le type d'opération {op_type['name']}: {e}")
    
    def create_sample_operations(self):
        """Crée des opérations d'exemple"""
        print("🔄 Création d'opérations d'exemple...")
        
        try:
            # Récupérer les profils agents
            agents = self.supabase.table('profiles').select('*').eq('role_id', 1).execute()  # role_id 1 = agent
            
            # Récupérer les types d'opérations
            op_types = self.supabase.table('operation_types').select('*').execute()
            
            # Récupérer les agences
            agencies = self.supabase.table('agencies').select('*').execute()
            
            if not agents.data or not op_types.data or not agencies.data:
                print("❌ Données insuffisantes pour créer des opérations")
                return
            
            # Créer quelques opérations en attente
            for i in range(5):
                agent = random.choice(agents.data)
                op_type = random.choice(op_types.data)
                
                operation = {
                    "operation_type_id": op_type['id'],
                    "reference_number": f"OP{datetime.now().strftime('%Y%m%d%H%M%S')}{i:03d}",
                    "initiator_id": agent['id'],
                    "agency_id": agent['agency_id'],
                    "amount": random.uniform(5000, 50000),
                    "currency": "XOF",
                    "status": "pending",
                    "operation_data": {
                        "phone_number": self.generate_phone(),
                        "amount": random.uniform(5000, 50000)
                    }
                }
                
                try:
                    result = self.supabase.table('operations').insert(operation).execute()
                    if result.data:
                        print(f"✅ Opération créée: {operation['reference_number']}")
                    
                except Exception as e:
                    print(f"❌ Erreur lors de la création de l'opération: {e}")
                    
        except Exception as e:
            print(f"❌ Erreur lors de la création des opérations: {e}")
    
    def generate_report(self):
        """Génère un rapport des données créées"""
        print("\n" + "="*60)
        print("📋 RAPPORT DE GÉNÉRATION - VERSION SIMPLIFIÉE")
        print("="*60)
        
        try:
            # Compter les profils
            profiles = self.supabase.table('profiles').select('*, roles(name)').execute()
            
            role_counts = {}
            for profile in profiles.data:
                role_name = profile.get('roles', {}).get('name', 'unknown') if profile.get('roles') else 'unknown'
                role_counts[role_name] = role_counts.get(role_name, 0) + 1
            
            print(f"👥 UTILISATEURS CRÉÉS:")
            for role, count in role_counts.items():
                print(f"   • {role}: {count}")
            
            # Compter les agences
            agencies = self.supabase.table('agencies').select('*').execute()
            print(f"\n🏢 AGENCES: {len(agencies.data)}")
            
            # Compter les types d'opérations
            op_types = self.supabase.table('operation_types').select('*').execute()
            print(f"\n💳 TYPES D'OPÉRATIONS: {len(op_types.data)}")
            
            # Compter les opérations
            operations = self.supabase.table('operations').select('*').execute()
            print(f"\n🔄 OPÉRATIONS: {len(operations.data)}")
            
            print(f"\n📧 COMPTES DE CONNEXION:")
            print(f"   • admin.general@transflow.com / Demo123!")
            print(f"   • sous.admin@transflow.com / Demo123!")
            print(f"   • developer@transflow.com / Demo123!")
            print(f"   • chef.douala@transflow.com / Demo123!")
            print(f"   • chef.yaoundé@transflow.com / Demo123!")
            print(f"   • agent1.douala@transflow.com / Demo123!")
            print(f"   • ... (tous avec mot de passe: Demo123!)")
            
            print(f"\n✅ GÉNÉRATION SIMPLIFIÉE TERMINÉE!")
            print("="*60)
            
        except Exception as e:
            print(f"❌ Erreur lors du rapport: {e}")
    
    def run(self):
        """Lance la génération simplifiée"""
        print("🚀 GÉNÉRATION SIMPLIFIÉE DE DONNÉES MOCK")
        print("="*60)
        
        try:
            # Étape 1: Créer les agences
            self.create_agencies_direct()
            
            # Étape 2: Créer les utilisateurs via RPC
            self.create_demo_users_via_rpc()
            
            # Étape 3: Créer le développeur manuellement
            self.create_developer_manual()
            
            # Étape 4: Créer les types d'opérations
            self.create_operation_types()
            
            # Étape 5: Créer quelques opérations d'exemple
            self.create_sample_operations()
            
            # Étape 6: Générer le rapport
            self.generate_report()
            
        except Exception as e:
            print(f"❌ ERREUR CRITIQUE: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    generator = SimpleDataGenerator()
    generator.run()