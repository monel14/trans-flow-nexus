#!/usr/bin/env python3
"""
Script simple pour créer des comptes directement via l'interface Supabase.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def create_simple_demo_user(identifier, name, password, role_name):
    """Créer un utilisateur simple directement via l'API Auth."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Utiliser directement l'identifiant comme email pour la compatibilité
        result = supabase.auth.admin.create_user({
            "email": identifier,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "name": name,
                "role": role_name,
                "identifier": identifier
            }
        })
        
        if result.user:
            print(f"   ✅ Utilisateur {identifier} créé: {result.user.id}")
            return True
        else:
            print(f"   ❌ Échec création {identifier}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur {identifier}: {e}")
        return False

def main():
    """Créer des comptes de test simples."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    print("🎯 CRÉATION SIMPLE DE COMPTES DE TEST")
    print("="*40)
    
    # Comptes simples à créer
    test_accounts = [
        ('admin.monel', 'Monel Admin', 'admin123', 'admin_general'),
        ('chef.dakar.diallo', 'Diallo Chef Dakar', 'chef123', 'chef_agence'),
        ('dkr01.fatou', 'Fatou Agent', 'agent123', 'agent')
    ]
    
    success_count = 0
    
    for identifier, name, password, role in test_accounts:
        print(f"📝 Création de {identifier}...")
        if create_simple_demo_user(identifier, name, password, role):
            success_count += 1
    
    print(f"\n🎉 {success_count}/{len(test_accounts)} comptes créés")
    
    if success_count > 0:
        print("\n📋 COMPTES DISPONIBLES POUR TEST:")
        print("-" * 35)
        for identifier, name, password, role in test_accounts[:success_count]:
            print(f"🔑 {identifier} / {password}")
        print("\n🔗 Testez sur: http://localhost:8080/")

if __name__ == "__main__":
    main()