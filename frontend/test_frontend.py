#!/usr/bin/env python3
"""
Test rapide pour vérifier que les nouvelles pages fonctionnent.
"""

import requests
import time

def test_frontend_pages():
    """Tester que les pages frontend se chargent."""
    base_url = "http://localhost:8080"
    
    pages_to_test = [
        "/",
        "/login",
        "/system-config",
        "/error-logs"
    ]
    
    print("🧪 Test des pages frontend...")
    
    for page in pages_to_test:
        try:
            response = requests.get(f"{base_url}{page}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {page}: Accessible (200)")
            else:
                print(f"⚠️  {page}: Code {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {page}: Erreur - {e}")

def test_api_endpoints():
    """Tester les endpoints API si possible."""
    print("🧪 Test des endpoints API...")
    
    # Note: Ces tests nécessiteraient une authentification
    print("ℹ️  Tests API nécessitent une authentification - à tester manuellement")

if __name__ == "__main__":
    print("🚀 Tests rapides des nouvelles fonctionnalités")
    print("=" * 50)
    
    # Attendre que le serveur soit prêt
    print("⏳ Attente du serveur de développement...")
    time.sleep(2)
    
    test_frontend_pages()
    test_api_endpoints()
    
    print("\n📋 Instructions pour les tests manuels :")
    print("1. Ouvrez http://localhost:8080 dans votre navigateur")
    print("2. Connectez-vous avec un compte développeur")
    print("3. Naviguez vers /system-config pour tester la configuration")
    print("4. Naviguez vers /error-logs pour tester les journaux")
    print("5. Vérifiez que les formulaires fonctionnent")
    
    print("\n✅ Tests automatiques terminés !")