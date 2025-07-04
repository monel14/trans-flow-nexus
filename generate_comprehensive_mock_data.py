#!/usr/bin/env python3
"""
Script de génération de données mock complètes pour TransFlow Nexus
Génère des comptes de démonstration et des données fictives pour tous les cas d'usage
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any
import random
from supabase import create_client, Client
from dataclasses import dataclass
import argparse

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

# Configuration pour les noms réalistes
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

CITIES = ["Douala", "Yaoundé", "Bamako", "Abidjan", "Dakar", "Conakry"]

@dataclass
class UserProfile:
    """Profil utilisateur avec toutes les informations nécessaires"""
    id: str
    email: str
    password: str
    name: str
    first_name: str
    last_name: str
    role: str
    role_id: int
    agency_id: int = None
    phone: str = None
    balance: float = 0.0

class MockDataGenerator:
    """Générateur de données mock pour TransFlow Nexus"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.users: List[UserProfile] = []
        self.agencies: List[Dict] = []
        self.operation_types: List[Dict] = []
        self.operations: List[Dict] = []
        self.roles: Dict[str, int] = {}
        
    def generate_phone(self) -> str:
        """Génère un numéro de téléphone réaliste"""
        prefixes = ["77", "78", "70", "76", "75"]
        return f"+221{random.choice(prefixes)}{random.randint(1000000, 9999999)}"
    
    def generate_reference_number(self, prefix: str) -> str:
        """Génère un numéro de référence unique"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"{prefix}{timestamp}{random.randint(100, 999)}"
    
    def setup_roles(self):
        """Configure les rôles de base"""
        print("🔧 Configuration des rôles...")
        
        roles_data = [
            {"name": "admin_general", "label": "Administrateur Général"},
            {"name": "sous_admin", "label": "Sous-Administrateur"},
            {"name": "chef_agence", "label": "Chef d'Agence"},
            {"name": "agent", "label": "Agent"},
            {"name": "developer", "label": "Développeur"}
        ]
        
        for role_data in roles_data:
            try:
                # Vérifier si le rôle existe déjà
                existing = self.supabase.table('roles').select('*').eq('name', role_data['name']).execute()
                
                if not existing.data:
                    result = self.supabase.table('roles').insert(role_data).execute()
                    self.roles[role_data['name']] = result.data[0]['id']
                else:
                    self.roles[role_data['name']] = existing.data[0]['id']
                    
            except Exception as e:
                print(f"❌ Erreur lors de la création du rôle {role_data['name']}: {e}")
                
        print(f"✅ Rôles configurés: {self.roles}")
    
    def create_agencies(self):
        """Crée les agences de démonstration"""
        print("🏢 Création des agences...")
        
        agencies_data = [
            {
                "name": "Agence de Douala",
                "city": "Douala",
                "is_active": True,
                "chef_agence_id": None  # Sera mis à jour après création des chefs
            },
            {
                "name": "Agence de Yaoundé", 
                "city": "Yaoundé",
                "is_active": True,
                "chef_agence_id": None
            }
        ]
        
        for agency_data in agencies_data:
            try:
                # Vérifier si l'agence existe déjà
                existing = self.supabase.table('agencies').select('*').eq('name', agency_data['name']).execute()
                
                if not existing.data:
                    result = self.supabase.table('agencies').insert(agency_data).execute()
                    self.agencies.append(result.data[0])
                else:
                    self.agencies.append(existing.data[0])
                    
            except Exception as e:
                print(f"❌ Erreur lors de la création de l'agence {agency_data['name']}: {e}")
                
        print(f"✅ {len(self.agencies)} agences créées")
    
    def create_operation_types(self):
        """Crée les types d'opérations financières réalistes"""
        print("💳 Création des types d'opérations...")
        
        operation_types_data = [
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
            },
            {
                "name": "Transfert Western Union",
                "description": "Envoi d'argent via Western Union",
                "impacts_balance": True,
                "is_active": True,
                "status": "active"
            }
        ]
        
        for op_type_data in operation_types_data:
            try:
                # Vérifier si le type existe déjà
                existing = self.supabase.table('operation_types').select('*').eq('name', op_type_data['name']).execute()
                
                if not existing.data:
                    result = self.supabase.table('operation_types').insert(op_type_data).execute()
                    self.operation_types.append(result.data[0])
                else:
                    self.operation_types.append(existing.data[0])
                    
            except Exception as e:
                print(f"❌ Erreur lors de la création du type d'opération {op_type_data['name']}: {e}")
        
        print(f"✅ {len(self.operation_types)} types d'opérations créés")
        
        # Créer les champs pour les types d'opérations
        self.create_operation_type_fields()
    
    def create_operation_type_fields(self):
        """Crée les champs dynamiques pour les types d'opérations"""
        print("📝 Création des champs des types d'opérations...")
        
        fields_data = []
        
        for op_type in self.operation_types:
            op_type_id = op_type['id']
            
            if "Orange Money" in op_type['name']:
                fields_data.extend([
                    {
                        "operation_type_id": op_type_id,
                        "name": "phone_number",
                        "label": "Numéro de téléphone",
                        "field_type": "tel",
                        "is_required": True,
                        "display_order": 1,
                        "placeholder": "77 123 45 67"
                    },
                    {
                        "operation_type_id": op_type_id,
                        "name": "amount",
                        "label": "Montant",
                        "field_type": "number",
                        "is_required": True,
                        "display_order": 2,
                        "placeholder": "10000"
                    }
                ])
            elif "MTN MoMo" in op_type['name']:
                fields_data.extend([
                    {
                        "operation_type_id": op_type_id,
                        "name": "phone_number",
                        "label": "Numéro MTN",
                        "field_type": "tel",
                        "is_required": True,
                        "display_order": 1,
                        "placeholder": "70 123 45 67"
                    },
                    {
                        "operation_type_id": op_type_id,
                        "name": "amount",
                        "label": "Montant",
                        "field_type": "number",
                        "is_required": True,
                        "display_order": 2,
                        "placeholder": "5000"
                    }
                ])
            elif "ENEO" in op_type['name']:
                fields_data.extend([
                    {
                        "operation_type_id": op_type_id,
                        "name": "meter_number",
                        "label": "Numéro compteur",
                        "field_type": "text",
                        "is_required": True,
                        "display_order": 1,
                        "placeholder": "12345678"
                    },
                    {
                        "operation_type_id": op_type_id,
                        "name": "amount",
                        "label": "Montant",
                        "field_type": "number",
                        "is_required": True,
                        "display_order": 2,
                        "placeholder": "25000"
                    }
                ])
            elif "Canal+" in op_type['name']:
                fields_data.extend([
                    {
                        "operation_type_id": op_type_id,
                        "name": "decoder_number",
                        "label": "Numéro décodeur",
                        "field_type": "text",
                        "is_required": True,
                        "display_order": 1,
                        "placeholder": "01234567890"
                    },
                    {
                        "operation_type_id": op_type_id,
                        "name": "package_type",
                        "label": "Type d'abonnement",
                        "field_type": "select",
                        "is_required": True,
                        "display_order": 2,
                        "options": ["Essentiel", "Evasion", "Tout Canal+"]
                    }
                ])
            elif "KYC" in op_type['name']:
                fields_data.extend([
                    {
                        "operation_type_id": op_type_id,
                        "name": "client_name",
                        "label": "Nom complet du client",
                        "field_type": "text",
                        "is_required": True,
                        "display_order": 1,
                        "placeholder": "Nom Prenom"
                    },
                    {
                        "operation_type_id": op_type_id,
                        "name": "id_number",
                        "label": "Numéro carte identité",
                        "field_type": "text",
                        "is_required": True,
                        "display_order": 2,
                        "placeholder": "1234567890123"
                    }
                ])
        
        # Insérer les champs
        for field_data in fields_data:
            try:
                self.supabase.table('operation_type_fields').insert(field_data).execute()
            except Exception as e:
                print(f"❌ Erreur lors de la création du champ {field_data['name']}: {e}")
        
        print(f"✅ {len(fields_data)} champs créés pour les types d'opérations")
    
    def create_demo_users(self):
        """Crée les comptes de démonstration"""
        print("👥 Création des comptes utilisateurs...")
        
        users_config = [
            # Admin général
            {
                "role": "admin_general",
                "count": 1,
                "base_balance": 0.0
            },
            # Sous-admin
            {
                "role": "sous_admin", 
                "count": 1,
                "base_balance": 0.0
            },
            # Developer
            {
                "role": "developer",
                "count": 1,
                "base_balance": 0.0
            },
            # Chefs d'agence (1 par agence)
            {
                "role": "chef_agence",
                "count": 2,
                "base_balance": 50000.0
            },
            # Agents (4-5 par agence)
            {
                "role": "agent",
                "count": 9,
                "base_balance": 25000.0
            }
        ]
        
        agency_index = 0
        chef_created = 0
        agent_created = 0
        
        for user_config in users_config:
            role = user_config["role"]
            count = user_config["count"]
            base_balance = user_config["base_balance"]
            
            for i in range(count):
                # Génération des informations utilisateur
                first_name = random.choice(FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                name = f"{first_name} {last_name}"
                
                # Email basé sur le rôle
                if role == "admin_general":
                    email = f"admin.general@transflow.com"
                elif role == "sous_admin":
                    email = f"sous.admin@transflow.com"
                elif role == "developer":
                    email = f"developer@transflow.com"
                elif role == "chef_agence":
                    if chef_created < len(self.agencies):
                        city = self.agencies[chef_created]['city'].lower()
                        email = f"chef.{city}@transflow.com"
                    else:
                        email = f"chef{chef_created + 1}@transflow.com"
                else:  # agent
                    agency_idx = agent_created % len(self.agencies)
                    if agency_idx < len(self.agencies):
                        city = self.agencies[agency_idx]['city'].lower()
                        email = f"agent{agent_created + 1}.{city}@transflow.com"
                    else:
                        email = f"agent{agent_created + 1}@transflow.com"
                
                # Mot de passe par défaut
                password = "Demo123!"
                
                # Assignation d'agence
                agency_id = None
                if role in ["chef_agence", "agent"]:
                    if role == "chef_agence":
                        agency_id = self.agencies[chef_created]['id']
                    else:
                        agency_id = self.agencies[agent_created % len(self.agencies)]['id']
                
                # Balance avec variation
                balance = base_balance + random.uniform(-5000, 5000) if base_balance > 0 else 0.0
                
                user_profile = UserProfile(
                    id=str(uuid.uuid4()),
                    email=email,
                    password=password,
                    name=name,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    role_id=self.roles[role],
                    agency_id=agency_id,
                    phone=self.generate_phone(),
                    balance=max(0, balance)
                )
                
                self.users.append(user_profile)
                
                # Incrémenter les compteurs
                if role == "chef_agence":
                    chef_created += 1
                elif role == "agent":
                    agent_created += 1
        
        print(f"✅ {len(self.users)} profils utilisateur générés")
        
        # Créer les comptes et profils
        self.create_auth_accounts()
        self.create_user_profiles()
        
        # Mettre à jour les chefs d'agence
        self.update_agency_chiefs()
    
    def create_auth_accounts(self):
        """Crée les comptes d'authentification Supabase"""
        print("🔐 Création des comptes d'authentification...")
        
        for user in self.users:
            try:
                # Créer le compte via l'API admin
                auth_response = self.supabase.auth.admin.create_user({
                    "email": user.email,
                    "password": user.password,
                    "user_metadata": {
                        "name": user.name,
                        "role": user.role
                    },
                    "email_confirm": True
                })
                
                if auth_response.user:
                    user.id = auth_response.user.id
                    print(f"✅ Compte créé pour {user.email}")
                else:
                    print(f"❌ Erreur lors de la création du compte pour {user.email}")
                    
            except Exception as e:
                print(f"❌ Erreur auth pour {user.email}: {e}")
                # Essayer de récupérer l'utilisateur existant
                try:
                    existing_users = self.supabase.auth.admin.list_users()
                    for existing_user in existing_users:
                        if existing_user.email == user.email:
                            user.id = existing_user.id
                            break
                except Exception as e2:
                    print(f"❌ Impossible de récupérer l'utilisateur existant: {e2}")
    
    def create_user_profiles(self):
        """Crée les profils utilisateur"""
        print("📋 Création des profils utilisateur...")
        
        for user in self.users:
            if not user.id:
                continue
                
            profile_data = {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "role_id": user.role_id,
                "agency_id": user.agency_id,
                "balance": user.balance,
                "is_active": True
            }
            
            try:
                # Vérifier si le profil existe
                existing = self.supabase.table('profiles').select('*').eq('id', user.id).execute()
                
                if not existing.data:
                    self.supabase.table('profiles').insert(profile_data).execute()
                else:
                    self.supabase.table('profiles').update(profile_data).eq('id', user.id).execute()
                    
                print(f"✅ Profil créé pour {user.name} ({user.role})")
                
            except Exception as e:
                print(f"❌ Erreur lors de la création du profil pour {user.name}: {e}")
    
    def update_agency_chiefs(self):
        """Met à jour les chefs d'agence dans la table agencies"""
        print("🏢 Mise à jour des chefs d'agence...")
        
        chef_users = [u for u in self.users if u.role == "chef_agence"]
        
        for i, agency in enumerate(self.agencies):
            if i < len(chef_users):
                chef_user = chef_users[i]
                try:
                    self.supabase.table('agencies').update({
                        "chef_agence_id": chef_user.id
                    }).eq('id', agency['id']).execute()
                    
                    print(f"✅ Chef {chef_user.name} assigné à {agency['name']}")
                    
                except Exception as e:
                    print(f"❌ Erreur lors de l'assignation du chef: {e}")
    
    def create_commission_rules(self):
        """Crée les règles de commission"""
        print("💰 Création des règles de commission...")
        
        for op_type in self.operation_types:
            if op_type['impacts_balance']:
                commission_data = {
                    "operation_type_id": op_type['id'],
                    "commission_type": "percentage",
                    "percentage_rate": random.uniform(0.01, 0.05),  # 1% à 5%
                    "min_amount": 100.0,
                    "max_amount": 5000.0,
                    "is_active": True
                }
                
                try:
                    self.supabase.table('commission_rules').insert(commission_data).execute()
                    print(f"✅ Règle de commission créée pour {op_type['name']}")
                except Exception as e:
                    print(f"❌ Erreur lors de la création de la règle de commission: {e}")
    
    def create_operations(self):
        """Crée les opérations de test avec différents statuts"""
        print("🔄 Création des opérations...")
        
        # Récupérer les agents et chefs d'agence
        agents = [u for u in self.users if u.role == "agent"]
        chefs = [u for u in self.users if u.role == "chef_agence"]
        admins = [u for u in self.users if u.role in ["admin_general", "sous_admin"]]
        
        # Récupérer les règles de commission
        commission_rules = self.supabase.table('commission_rules').select('*').execute()
        
        operations_data = []
        
        # Opérations en attente (15-20)
        for i in range(18):
            agent = random.choice(agents)
            op_type = random.choice(self.operation_types)
            
            amount = random.uniform(5000, 50000)
            
            # Données d'opération selon le type
            operation_data = {}
            if "Orange Money" in op_type['name']:
                operation_data = {
                    "phone_number": self.generate_phone(),
                    "amount": amount
                }
            elif "MTN MoMo" in op_type['name']:
                operation_data = {
                    "phone_number": self.generate_phone(),
                    "amount": amount
                }
            elif "ENEO" in op_type['name']:
                operation_data = {
                    "meter_number": f"{random.randint(10000000, 99999999)}",
                    "amount": amount
                }
            elif "Canal+" in op_type['name']:
                operation_data = {
                    "decoder_number": f"{random.randint(10000000000, 99999999999)}",
                    "package_type": random.choice(["Essentiel", "Evasion", "Tout Canal+"])
                }
                amount = random.choice([8000, 15000, 25000])  # Prix fixes
            elif "KYC" in op_type['name']:
                operation_data = {
                    "client_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "id_number": f"{random.randint(1000000000000, 9999999999999)}"
                }
                amount = 0  # Pas de montant pour KYC
            
            operation = {
                "operation_type_id": op_type['id'],
                "reference_number": self.generate_reference_number("OP"),
                "initiator_id": agent.id,
                "agency_id": agent.agency_id,
                "amount": amount,
                "currency": "XOF",
                "status": "pending",
                "operation_data": operation_data,
                "created_at": (datetime.now() - timedelta(days=random.randint(0, 7))).isoformat()
            }
            operations_data.append(operation)
        
        # Opérations complétées (40-50)
        for i in range(45):
            agent = random.choice(agents)
            op_type = random.choice(self.operation_types)
            validator = random.choice(admins)
            
            amount = random.uniform(5000, 50000)
            
            # Données d'opération selon le type
            operation_data = {}
            if "Orange Money" in op_type['name']:
                operation_data = {
                    "phone_number": self.generate_phone(),
                    "amount": amount
                }
            elif "MTN MoMo" in op_type['name']:
                operation_data = {
                    "phone_number": self.generate_phone(),
                    "amount": amount
                }
            elif "ENEO" in op_type['name']:
                operation_data = {
                    "meter_number": f"{random.randint(10000000, 99999999)}",
                    "amount": amount
                }
            elif "Canal+" in op_type['name']:
                operation_data = {
                    "decoder_number": f"{random.randint(10000000000, 99999999999)}",
                    "package_type": random.choice(["Essentiel", "Evasion", "Tout Canal+"])
                }
                amount = random.choice([8000, 15000, 25000])
            elif "KYC" in op_type['name']:
                operation_data = {
                    "client_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                    "id_number": f"{random.randint(1000000000000, 9999999999999)}"
                }
                amount = 0
            
            created_date = datetime.now() - timedelta(days=random.randint(1, 30))
            completed_date = created_date + timedelta(hours=random.randint(1, 48))
            
            operation = {
                "operation_type_id": op_type['id'],
                "reference_number": self.generate_reference_number("OP"),
                "initiator_id": agent.id,
                "agency_id": agent.agency_id,
                "amount": amount,
                "currency": "XOF",
                "status": "completed",
                "operation_data": operation_data,
                "validator_id": validator.id,
                "validated_at": completed_date.isoformat(),
                "completed_at": completed_date.isoformat(),
                "created_at": created_date.isoformat()
            }
            operations_data.append(operation)
        
        # Opérations échouées/rejetées (8-10)
        error_messages = [
            "Preuve de paiement illisible",
            "Informations du bénéficiaire incorrectes",
            "Montant insuffisant sur le compte",
            "Numéro de téléphone invalide",
            "Compteur ENEO non trouvé",
            "Décodeur Canal+ inactif"
        ]
        
        for i in range(9):
            agent = random.choice(agents)
            op_type = random.choice(self.operation_types)
            validator = random.choice(admins)
            
            amount = random.uniform(5000, 50000)
            
            operation_data = {
                "phone_number": self.generate_phone(),
                "amount": amount
            }
            
            created_date = datetime.now() - timedelta(days=random.randint(1, 15))
            failed_date = created_date + timedelta(hours=random.randint(1, 24))
            
            operation = {
                "operation_type_id": op_type['id'],
                "reference_number": self.generate_reference_number("OP"),
                "initiator_id": agent.id,
                "agency_id": agent.agency_id,
                "amount": amount,
                "currency": "XOF",
                "status": random.choice(["failed", "cancelled"]),
                "operation_data": operation_data,
                "validator_id": validator.id,
                "validated_at": failed_date.isoformat(),
                "error_message": random.choice(error_messages),
                "created_at": created_date.isoformat()
            }
            operations_data.append(operation)
        
        # Insérer les opérations
        batch_size = 10
        for i in range(0, len(operations_data), batch_size):
            batch = operations_data[i:i+batch_size]
            try:
                result = self.supabase.table('operations').insert(batch).execute()
                if result.data:
                    self.operations.extend(result.data)
                print(f"✅ Batch d'opérations {i//batch_size + 1} créé ({len(batch)} opérations)")
            except Exception as e:
                print(f"❌ Erreur lors de la création du batch d'opérations: {e}")
        
        print(f"✅ {len(self.operations)} opérations créées au total")
    
    def create_transaction_ledger(self):
        """Crée les entrées du journal des transactions"""
        print("📊 Création du journal des transactions...")
        
        ledger_entries = []
        
        for operation in self.operations:
            if operation['status'] == 'completed' and operation['amount'] > 0:
                # Récupérer l'agent
                agent = next((u for u in self.users if u.id == operation['initiator_id']), None)
                if not agent:
                    continue
                
                # Créer une entrée de débit pour l'opération
                ledger_entry = {
                    "user_id": agent.id,
                    "operation_id": operation['id'],
                    "transaction_type": "debit",
                    "amount": operation['amount'],
                    "balance_before": agent.balance,
                    "balance_after": agent.balance - operation['amount'],
                    "description": f"Opération {operation['reference_number']}",
                    "metadata": {
                        "operation_type": operation['operation_type_id'],
                        "reference": operation['reference_number']
                    },
                    "created_at": operation['completed_at']
                }
                
                ledger_entries.append(ledger_entry)
                
                # Mettre à jour le solde de l'agent
                agent.balance = max(0, agent.balance - operation['amount'])
        
        # Insérer les entrées par batches
        batch_size = 20
        for i in range(0, len(ledger_entries), batch_size):
            batch = ledger_entries[i:i+batch_size]
            try:
                self.supabase.table('transaction_ledger').insert(batch).execute()
                print(f"✅ Batch de transactions {i//batch_size + 1} créé ({len(batch)} entrées)")
            except Exception as e:
                print(f"❌ Erreur lors de la création du batch de transactions: {e}")
        
        print(f"✅ {len(ledger_entries)} entrées de transaction créées")
    
    def create_commission_records(self):
        """Crée les enregistrements de commission"""
        print("🏆 Création des enregistrements de commission...")
        
        # Récupérer les règles de commission
        commission_rules = self.supabase.table('commission_rules').select('*').execute()
        rules_by_op_type = {rule['operation_type_id']: rule for rule in commission_rules.data}
        
        commission_records = []
        
        for operation in self.operations:
            if operation['status'] == 'completed' and operation['amount'] > 0:
                # Récupérer l'agent
                agent = next((u for u in self.users if u.id == operation['initiator_id']), None)
                if not agent:
                    continue
                
                # Récupérer le chef d'agence
                chef = next((u for u in self.users if u.role == "chef_agence" and u.agency_id == agent.agency_id), None)
                
                # Récupérer la règle de commission
                rule = rules_by_op_type.get(operation['operation_type_id'])
                if not rule:
                    continue
                
                # Calculer les commissions
                total_commission = operation['amount'] * rule['percentage_rate']
                total_commission = min(total_commission, rule['max_amount'])
                total_commission = max(total_commission, rule['min_amount'])
                
                agent_commission = total_commission * 0.7  # 70% pour l'agent
                chef_commission = total_commission * 0.3   # 30% pour le chef
                
                commission_record = {
                    "operation_id": operation['id'],
                    "agent_id": agent.id,
                    "chef_agence_id": chef.id if chef else None,
                    "commission_rule_id": rule['id'],
                    "agent_commission": agent_commission,
                    "chef_commission": chef_commission,
                    "total_commission": total_commission,
                    "status": "paid",
                    "paid_at": operation['completed_at']
                }
                
                commission_records.append(commission_record)
        
        # Insérer les enregistrements de commission
        batch_size = 20
        for i in range(0, len(commission_records), batch_size):
            batch = commission_records[i:i+batch_size]
            try:
                self.supabase.table('commission_records').insert(batch).execute()
                print(f"✅ Batch de commissions {i//batch_size + 1} créé ({len(batch)} enregistrements)")
            except Exception as e:
                print(f"❌ Erreur lors de la création du batch de commissions: {e}")
        
        print(f"✅ {len(commission_records)} enregistrements de commission créés")
    
    def create_recharge_tickets(self):
        """Crée les tickets de recharge"""
        print("🎫 Création des tickets de recharge...")
        
        agents = [u for u in self.users if u.role == "agent"]
        chefs = [u for u in self.users if u.role == "chef_agence"]
        admin = next((u for u in self.users if u.role == "admin_general"), None)
        
        tickets_data = []
        
        # Tickets ouverts (2-3)
        for i in range(3):
            agent = random.choice(agents)
            chef = next((u for u in chefs if u.agency_id == agent.agency_id), None)
            
            ticket = {
                "ticket_number": self.generate_reference_number("TCK"),
                "requester_id": agent.id,
                "assigned_to_id": chef.id if chef else None,
                "ticket_type": "recharge",
                "priority": random.choice(["medium", "high"]),
                "status": "open",
                "title": f"Demande de recharge - {agent.name}",
                "description": f"Demande de recharge de {random.randint(10000, 50000)} XOF pour poursuivre les opérations",
                "requested_amount": random.randint(10000, 50000),
                "created_at": (datetime.now() - timedelta(days=random.randint(0, 3))).isoformat()
            }
            tickets_data.append(ticket)
        
        # Ticket résolu (1)
        agent = random.choice(agents)
        resolved_ticket = {
            "ticket_number": self.generate_reference_number("TCK"),
            "requester_id": agent.id,
            "assigned_to_id": admin.id if admin else None,
            "resolved_by_id": admin.id if admin else None,
            "ticket_type": "recharge",
            "priority": "medium",
            "status": "resolved",
            "title": f"Demande de recharge - {agent.name}",
            "description": f"Demande de recharge de 30000 XOF pour poursuivre les opérations",
            "requested_amount": 30000,
            "resolution_notes": "Recharge effectuée avec succès",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "resolved_at": (datetime.now() - timedelta(days=3)).isoformat()
        }
        tickets_data.append(resolved_ticket)
        
        # Insérer les tickets
        for ticket_data in tickets_data:
            try:
                self.supabase.table('request_tickets').insert(ticket_data).execute()
                print(f"✅ Ticket {ticket_data['ticket_number']} créé")
            except Exception as e:
                print(f"❌ Erreur lors de la création du ticket: {e}")
        
        print(f"✅ {len(tickets_data)} tickets de recharge créés")
    
    def create_notifications(self):
        """Crée des notifications de démonstration"""
        print("🔔 Création des notifications...")
        
        notifications_data = []
        
        # Notifications pour les agents
        agents = [u for u in self.users if u.role == "agent"]
        for agent in agents[:3]:  # Quelques agents
            notifications_data.extend([
                {
                    "recipient_id": agent.id,
                    "notification_type": "operation",
                    "title": "Opération validée",
                    "message": f"Votre opération {self.generate_reference_number('OP')} a été validée avec succès",
                    "priority": "normal",
                    "is_read": random.choice([True, False]),
                    "created_at": (datetime.now() - timedelta(days=random.randint(0, 7))).isoformat()
                },
                {
                    "recipient_id": agent.id,
                    "notification_type": "commission",
                    "title": "Commission disponible",
                    "message": f"Vous avez reçu une commission de {random.randint(1000, 5000)} XOF",
                    "priority": "normal",
                    "is_read": random.choice([True, False]),
                    "created_at": (datetime.now() - timedelta(days=random.randint(0, 5))).isoformat()
                }
            ])
        
        # Notifications pour les chefs d'agence
        chefs = [u for u in self.users if u.role == "chef_agence"]
        for chef in chefs:
            notifications_data.extend([
                {
                    "recipient_id": chef.id,
                    "notification_type": "ticket",
                    "title": "Nouvelle demande de recharge",
                    "message": "Un agent a soumis une demande de recharge",
                    "priority": "high",
                    "is_read": random.choice([True, False]),
                    "created_at": (datetime.now() - timedelta(days=random.randint(0, 3))).isoformat()
                }
            ])
        
        # Notifications pour les admins
        admin = next((u for u in self.users if u.role == "admin_general"), None)
        if admin:
            notifications_data.extend([
                {
                    "recipient_id": admin.id,
                    "notification_type": "system",
                    "title": "Rapport mensuel disponible",
                    "message": "Le rapport mensuel des opérations est maintenant disponible",
                    "priority": "normal",
                    "is_read": False,
                    "created_at": (datetime.now() - timedelta(days=1)).isoformat()
                },
                {
                    "recipient_id": admin.id,
                    "notification_type": "validation",
                    "title": "Opérations en attente",
                    "message": f"Il y a {len([op for op in self.operations if op['status'] == 'pending'])} opérations en attente de validation",
                    "priority": "high",
                    "is_read": False,
                    "created_at": datetime.now().isoformat()
                }
            ])
        
        # Insérer les notifications
        batch_size = 10
        for i in range(0, len(notifications_data), batch_size):
            batch = notifications_data[i:i+batch_size]
            try:
                self.supabase.table('notifications').insert(batch).execute()
                print(f"✅ Batch de notifications {i//batch_size + 1} créé ({len(batch)} notifications)")
            except Exception as e:
                print(f"❌ Erreur lors de la création du batch de notifications: {e}")
        
        print(f"✅ {len(notifications_data)} notifications créées")
    
    def create_system_settings(self):
        """Crée les paramètres système"""
        print("⚙️ Création des paramètres système...")
        
        system_config = {
            "app_name": "TransFlow Nexus",
            "app_version": "1.0.0",
            "currency": "XOF",
            "default_commission_rate": 0.025,
            "max_daily_operations": 100,
            "max_operation_amount": 500000,
            "notification_settings": {
                "email_notifications": True,
                "sms_notifications": False,
                "push_notifications": True
            },
            "security_settings": {
                "session_timeout": 3600,
                "max_login_attempts": 5,
                "password_policy": {
                    "min_length": 8,
                    "require_uppercase": True,
                    "require_lowercase": True,
                    "require_numbers": True,
                    "require_symbols": True
                }
            },
            "business_rules": {
                "auto_approve_under": 10000,
                "require_dual_approval_over": 100000,
                "commission_splits": {
                    "agent": 0.7,
                    "chef_agence": 0.3
                }
            }
        }
        
        settings_data = {
            "id": 1,
            "config": system_config,
            "updated_by": "system",
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            # Vérifier si les paramètres existent
            existing = self.supabase.table('system_settings').select('*').eq('id', 1).execute()
            
            if not existing.data:
                self.supabase.table('system_settings').insert(settings_data).execute()
            else:
                self.supabase.table('system_settings').update(settings_data).eq('id', 1).execute()
                
            print("✅ Paramètres système créés/mis à jour")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création des paramètres système: {e}")
    
    def generate_summary_report(self):
        """Génère un rapport de résumé des données créées"""
        print("\n" + "="*60)
        print("📋 RAPPORT DE GÉNÉRATION DES DONNÉES MOCK")
        print("="*60)
        
        # Compter les utilisateurs par rôle
        user_counts = {}
        for user in self.users:
            user_counts[user.role] = user_counts.get(user.role, 0) + 1
        
        print(f"👥 UTILISATEURS CRÉÉS:")
        for role, count in user_counts.items():
            print(f"   • {role}: {count}")
        
        print(f"\n🏢 AGENCES CRÉÉES: {len(self.agencies)}")
        for agency in self.agencies:
            print(f"   • {agency['name']} ({agency['city']})")
        
        print(f"\n💳 TYPES D'OPÉRATIONS: {len(self.operation_types)}")
        for op_type in self.operation_types:
            print(f"   • {op_type['name']}")
        
        print(f"\n🔄 OPÉRATIONS CRÉÉES: {len(self.operations)}")
        operation_counts = {}
        for operation in self.operations:
            status = operation['status']
            operation_counts[status] = operation_counts.get(status, 0) + 1
        
        for status, count in operation_counts.items():
            print(f"   • {status}: {count}")
        
        print(f"\n📧 COMPTES DE CONNEXION:")
        print(f"   • admin.general@transflow.com / Demo123!")
        print(f"   • sous.admin@transflow.com / Demo123!")
        print(f"   • developer@transflow.com / Demo123!")
        print(f"   • chef.douala@transflow.com / Demo123!")
        print(f"   • chef.yaoundé@transflow.com / Demo123!")
        print(f"   • agent1.douala@transflow.com / Demo123!")
        print(f"   • agent2.yaoundé@transflow.com / Demo123!")
        print(f"   • ... (tous les comptes utilisent le mot de passe: Demo123!)")
        
        print(f"\n✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
        print(f"   • Base de données: Supabase")
        print(f"   • Données générées: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
    
    def run(self):
        """Exécute la génération complète des données"""
        print("🚀 DÉMARRAGE DE LA GÉNÉRATION DE DONNÉES MOCK")
        print("="*60)
        
        try:
            # Étape 1: Configuration des rôles
            self.setup_roles()
            
            # Étape 2: Création des agences
            self.create_agencies()
            
            # Étape 3: Création des types d'opérations
            self.create_operation_types()
            
            # Étape 4: Création des règles de commission
            self.create_commission_rules()
            
            # Étape 5: Création des utilisateurs
            self.create_demo_users()
            
            # Étape 6: Création des opérations
            self.create_operations()
            
            # Étape 7: Création du journal des transactions
            self.create_transaction_ledger()
            
            # Étape 8: Création des enregistrements de commission
            self.create_commission_records()
            
            # Étape 9: Création des tickets de recharge
            self.create_recharge_tickets()
            
            # Étape 10: Création des notifications
            self.create_notifications()
            
            # Étape 11: Création des paramètres système
            self.create_system_settings()
            
            # Étape 12: Génération du rapport
            self.generate_summary_report()
            
        except Exception as e:
            print(f"❌ ERREUR CRITIQUE: {e}")
            raise

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Générateur de données mock pour TransFlow Nexus")
    parser.add_argument("--confirm", action="store_true", help="Confirmer la génération des données")
    
    args = parser.parse_args()
    
    if not args.confirm:
        print("⚠️  ATTENTION: Ce script va générer des données de démonstration dans Supabase")
        print("   Cela peut modifier ou remplacer des données existantes.")
        print("   Utiliser --confirm pour procéder.")
        return
    
    # Créer le générateur et exécuter
    generator = MockDataGenerator(SUPABASE_URL, SUPABASE_KEY)
    generator.run()

if __name__ == "__main__":
    main()