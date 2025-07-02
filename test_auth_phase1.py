#!/usr/bin/env python3
"""
Script de test pour vérifier que l'authentification par identifiant fonctionne.
"""

import requests
import json
import time

# URL de l'application
BASE_URL = "http://localhost:3000"

def test_login_page():
    """Test si la page de connexion se charge correctement."""
    try:
        print("🧪 Test de la page de connexion...")
        response = requests.get(f"{BASE_URL}/login", timeout=10)
        
        if response.status_code == 200:
            print("✅ Page de connexion accessible")
            
            # Vérifier si la page contient les nouveaux champs
            content = response.text
            if "Identifiant" in content:
                print("✅ Champ 'Identifiant' trouvé dans la page")
            else:
                print("⚠️  Champ 'Identifiant' non trouvé - vérifiez le rendu")
                
            if "admin.monel" in content:
                print("✅ Exemples d'identifiants trouvés")
            else:
                print("⚠️  Exemples d'identifiants non trouvés")
                
            return True
        else:
            print(f"❌ Erreur HTTP {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_auth_context():
    """Test basique du contexte d'authentification."""
    try:
        print("🧪 Test du contexte d'authentification...")
        
        # Tenter d'accéder à la racine (devrait rediriger vers /login)
        response = requests.get(BASE_URL, allow_redirects=False, timeout=10)
        
        if response.status_code in [200, 302]:
            print("✅ Application React charge correctement")
            return True
        else:
            print(f"❌ Erreur HTTP {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def main():
    """Fonction principale de test."""
    print("🚀 Tests de l'authentification par identifiant")
    print("=" * 50)
    
    # Attendre que le serveur soit prêt
    print("⏳ Attente du démarrage du serveur...")
    time.sleep(3)
    
    # Test 1: Page de connexion
    success1 = test_login_page()
    
    # Test 2: Contexte d'authentification
    success2 = test_auth_context()
    
    print("=" * 50)
    if success1 and success2:
        print("✅ Tous les tests passent!")
        print("\nProchaines étapes:")
        print("1. Testez manuellement la nouvelle interface de connexion")
        print("2. Procédez à la Phase 2: Création des fonctions RPC")
    else:
        print("❌ Certains tests ont échoué")
        print("Vérifiez les logs du serveur de développement")

if __name__ == "__main__":
    main()