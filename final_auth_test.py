#!/usr/bin/env python3
"""
Test final de l'authentification après corrections
"""
import requests
import json

def test_final_authentication():
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': anon_key
    }
    
    print("🧪 TEST FINAL APRÈS CORRECTIONS")
    print("=" * 40)
    
    demo_accounts = [
        {"email": "admin@transflow.com", "password": "admin123", "role": "Admin"},
        {"email": "chef@transflow.com", "password": "chef123", "role": "Chef"},
        {"email": "agent@transflow.com", "password": "agent123", "role": "Agent"},
        {"email": "dev@transflow.com", "password": "dev123", "role": "Dev"}
    ]
    
    results = {"success": 0, "email_not_confirmed": 0, "invalid": 0}
    
    for account in demo_accounts:
        print(f"\n🔍 Test: {account['role']} ({account['email']})")
        
        auth_data = {
            "email": account['email'],
            "password": account['password']
        }
        
        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/token?grant_type=password",
                headers=headers,
                json=auth_data
            )
            
            if response.status_code == 200:
                print("   ✅ CONNEXION RÉUSSIE!")
                user_data = response.json()
                print(f"   📧 Email: {user_data.get('user', {}).get('email', 'N/A')}")
                results["success"] += 1
            else:
                error_data = response.json()
                error_code = error_data.get('error_code', 'unknown')
                
                if error_code == 'email_not_confirmed':
                    print("   ⚠️ Email non confirmé")
                    results["email_not_confirmed"] += 1
                elif error_code == 'invalid_credentials':
                    print("   ❌ Identifiants invalides")
                    results["invalid"] += 1
                else:
                    print(f"   ❌ Erreur: {error_code}")
                    
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 40)
    print("📊 RÉSULTATS FINAUX:")
    print(f"✅ Connexions réussies: {results['success']}")
    print(f"⚠️ Emails non confirmés: {results['email_not_confirmed']}")
    print(f"❌ Identifiants invalides: {results['invalid']}")
    
    if results["success"] > 0:
        print("\n🎉 SUCCÈS PARTIEL: Certains comptes fonctionnent!")
    elif results["email_not_confirmed"] > 0:
        print("\n💡 SOLUTION: Utiliser le générateur de comptes dans l'interface")
        print("   ou confirmer manuellement les emails via Supabase Dashboard")
    
    print("\n📝 INSTRUCTIONS FINALES:")
    print("1. Ouvrir http://localhost:8080/")
    print("2. Utiliser le 'Générateur de Comptes de Démonstration'")
    print("3. Cliquer sur 'Générer Tous les Comptes'")
    print("4. Essayer les boutons de connexion rapide")

if __name__ == "__main__":
    test_final_authentication()