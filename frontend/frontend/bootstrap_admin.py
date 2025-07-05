#!/usr/bin/env python3

"""
Script de Bootstrap pour TransFlow Nexus Phase 3
Crée l'administrateur initial et teste les fonctions RPC
"""

import os
import requests
import json
from datetime import datetime

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def call_rpc_function(function_name, params, headers=None):
    """Appel d'une fonction RPC Supabase"""
    if headers is None:
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    
    try:
        response = requests.post(url, json=params, headers=headers)
        print(f"📡 Appel RPC {function_name}: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Réponse: {json.dumps(result, indent=2)}")
            return True, result
        else:
            print(f"❌ Erreur: {response.status_code} - {response.text}")
            return False, response.text
            
    except Exception as e:
        print(f"❌ Exception lors de l'appel RPC: {e}")
        return False, str(e)

def create_initial_admin():
    """Crée l'administrateur initial"""
    print("\n🔧 Création de l'administrateur initial...")
    
    success, result = call_rpc_function("create_initial_admin", {
        "full_name_in": "Administrateur Principal",
        "identifier_in": "admin.monel",
        "password_in": "admin123"
    })
    
    if success and isinstance(result, dict) and result.get('status') == 'success':
        print("✅ Administrateur créé avec succès!")
        return True
    else:
        print(f"⚠️ L'admin existe peut-être déjà: {result}")
        return True  # On continue même si l'admin existe déjà

def test_login(identifier, password):
    """Test de connexion avec un identifiant"""
    print(f"\n🔐 Test de connexion avec {identifier}...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    try:
        response = requests.post(url, json={
            "email": identifier,
            "password": password
        }, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access_token')
            print(f"✅ Connexion réussie pour {identifier}")
            return access_token
        else:
            print(f"❌ Échec de connexion: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception lors de la connexion: {e}")
        return None

def get_agencies(access_token):
    """Récupère la liste des agences"""
    print("\n🏢 Récupération des agences...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/agencies?is_active=eq.true&select=id,name,code,city"
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            agencies = response.json()
            print(f"✅ {len(agencies)} agences trouvées")
            for agency in agencies:
                print(f"   - {agency['name']} (ID: {agency['id']}, Code: {agency['code']})")
            return agencies
        else:
            print(f"❌ Erreur récupération agences: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Exception lors de la récupération des agences: {e}")
        return []

def test_create_chef_agence(access_token, agency_id):
    """Test de création d'un chef d'agence"""
    print("\n👨‍💼 Test de création d'un chef d'agence...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%H%M%S')
    
    success, result = call_rpc_function("create_chef_agence", {
        "full_name_in": f"Chef Test {timestamp}",
        "identifier_in": f"chef.test{timestamp}.diallo",
        "password_in": "chef123",
        "agency_id_in": agency_id
    }, headers)
    
    if success and isinstance(result, dict) and result.get('status') == 'success':
        print(f"✅ Chef d'agence créé: {result.get('identifier')}")
        return result.get('identifier')
    else:
        print(f"❌ Échec création chef d'agence: {result}")
        return None

def test_create_sous_admin(access_token):
    """Test de création d'un sous-admin"""
    print("\n👤 Test de création d'un sous-admin...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%H%M%S')
    
    success, result = call_rpc_function("create_sous_admin", {
        "full_name_in": f"Sous Admin Test {timestamp}",
        "identifier_in": f"sadmin.test{timestamp}",
        "password_in": "sousadmin123"
    }, headers)
    
    if success and isinstance(result, dict) and result.get('status') == 'success':
        print(f"✅ Sous-admin créé: {result.get('identifier')}")
        return result.get('identifier')
    else:
        print(f"❌ Échec création sous-admin: {result}")
        return None

def test_create_agent_as_chef(chef_identifier):
    """Test de création d'un agent en tant que chef d'agence"""
    print(f"\n👷 Test de création d'un agent en tant que {chef_identifier}...")
    
    # Se connecter en tant que chef
    chef_token = test_login(chef_identifier, "chef123")
    if not chef_token:
        print("❌ Impossible de se connecter en tant que chef")
        return None
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {chef_token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%H%M%S')
    
    success, result = call_rpc_function("create_agent", {
        "full_name_in": f"Agent Test {timestamp}",
        "identifier_in": f"tst{timestamp}.fatou",
        "password_in": "agent123"
    }, headers)
    
    if success and isinstance(result, dict) and result.get('status') == 'success':
        print(f"✅ Agent créé: {result.get('identifier')}")
        return result.get('identifier')
    else:
        print(f"❌ Échec création agent: {result}")
        return None

def main():
    """Fonction principale"""
    print("🚀 Bootstrap TransFlow Nexus Phase 3")
    print("=" * 50)
    
    # Étape 1: Créer l'admin initial
    if not create_initial_admin():
        print("❌ Échec lors de la création de l'admin initial")
        return 1
    
    # Étape 2: Se connecter en tant qu'admin
    admin_token = test_login("admin.monel", "admin123")
    if not admin_token:
        print("❌ Impossible de se connecter en tant qu'admin")
        return 1
    
    # Étape 3: Récupérer les agences
    agencies = get_agencies(admin_token)
    if not agencies:
        print("❌ Aucune agence disponible")
        return 1
    
    # Étape 4: Créer un chef d'agence
    chef_identifier = test_create_chef_agence(admin_token, agencies[0]['id'])
    
    # Étape 5: Créer un sous-admin
    sous_admin_identifier = test_create_sous_admin(admin_token)
    
    # Étape 6: Créer un agent en tant que chef d'agence
    if chef_identifier:
        agent_identifier = test_create_agent_as_chef(chef_identifier)
    
    print("\n🎉 Tests de bootstrap terminés!")
    print("=" * 50)
    print("Comptes de test créés:")
    print(f"  Admin: admin.monel / admin123")
    if chef_identifier:
        print(f"  Chef: {chef_identifier} / chef123")
    if sous_admin_identifier:
        print(f"  Sous-admin: {sous_admin_identifier} / sousadmin123")
    if 'agent_identifier' in locals():
        print(f"  Agent: {agent_identifier} / agent123")
    
    print("\n🌐 Interface disponible sur: http://localhost:8080")
    print("👆 Utilisez ces comptes pour tester l'interface Phase 3")
    
    return 0

if __name__ == "__main__":
    exit(main())