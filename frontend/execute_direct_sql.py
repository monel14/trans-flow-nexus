#!/usr/bin/env python3
"""
Génération de données en utilisant une approche SQL directe
"""

import subprocess
import tempfile
import os

def create_sql_script():
    """Crée un script SQL complet pour insertion directe"""
    
    sql_script = """
-- Script de génération de données mock pour TransFlow Nexus
-- Version directe sans restrictions RLS

-- 1. Créer des agences temporaires en contournant RLS
INSERT INTO public.agencies (name, city, is_active, created_at, updated_at) 
VALUES 
    ('Agence de Douala', 'Douala', true, now(), now()),
    ('Agence de Yaoundé', 'Yaoundé', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- 2. Créer des types d'opérations
INSERT INTO public.operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Dépôt Orange Money', 'Dépôt d''argent sur compte Orange Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Retrait MTN MoMo', 'Retrait d''argent depuis compte MTN Mobile Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Paiement Facture ENEO', 'Paiement facture électricité ENEO', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Enregistrement KYC Client', 'Enregistrement et vérification identité client', false, true, 'active', now(), now())
ON CONFLICT (name) DO NOTHING;

-- 3. Essayer de créer des utilisateurs directement
-- (Ces insertions pourraient être bloquées par RLS aussi)

-- 4. Création de règles de commission basiques
INSERT INTO public.commission_rules (id, operation_type_id, commission_type, percentage_rate, min_amount, max_amount, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    ot.id,
    'percentage',
    0.025,
    100.0,
    5000.0,
    true,
    now(),
    now()
FROM public.operation_types ot 
WHERE ot.impacts_balance = true
ON CONFLICT DO NOTHING;

-- 5. Rapport final
SELECT 'RAPPORT DE GÉNÉRATION' as status;
SELECT COUNT(*) as agences_creees FROM public.agencies;
SELECT COUNT(*) as types_operations_crees FROM public.operation_types;
SELECT COUNT(*) as profils_crees FROM public.profiles;
"""
    
    return sql_script

def execute_sql_directly():
    """Tente d'exécuter le SQL directement"""
    print("🚀 EXÉCUTION SQL DIRECTE")
    print("="*40)
    
    # Créer le script SQL
    sql_script = create_sql_script()
    
    # Créer un fichier temporaire
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(sql_script)
        temp_sql_file = f.name
    
    try:
        print(f"📄 Script SQL créé: {temp_sql_file}")
        print("📋 Contenu du script:")
        print("-" * 40)
        print(sql_script[:500] + "...")
        print("-" * 40)
        
        print("\n⚠️  Pour exécuter ce script:")
        print("1. Ouvrez Supabase Dashboard")
        print("2. Allez dans SQL Editor")  
        print("3. Copiez et collez le contenu suivant:")
        print(f"\n{sql_script}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    finally:
        # Nettoyer le fichier temporaire
        try:
            os.unlink(temp_sql_file)
        except:
            pass

def display_manual_instructions():
    """Affiche les instructions manuelles détaillées"""
    print("\n" + "="*80)
    print("📋 INSTRUCTIONS MANUELLES POUR GÉNÉRATION DE DONNÉES")
    print("="*80)
    
    print("""
🎯 PROBLÈME IDENTIFIÉ:
Les politiques RLS (Row Level Security) de Supabase empêchent l'insertion directe
de données via l'API client. Ceci est une protection normale.

🚀 SOLUTION RECOMMANDÉE:
Exécuter le script SQL directement dans l'interface d'administration Supabase.

📋 ÉTAPES DÉTAILLÉES:

1. 🌐 Ouvrez votre Dashboard Supabase
   → Connectez-vous à https://supabase.com
   → Sélectionnez votre projet TransFlow Nexus

2. 📝 Accédez à l'éditeur SQL
   → Cliquez sur "SQL Editor" dans le menu latéral
   → Cliquez sur "New query"

3. 📄 Copiez le script complet
   → Ouvrez le fichier: generate_mock_data_complete.sql
   → Copiez tout le contenu (500+ lignes)
   → Collez dans l'éditeur SQL Supabase

4. ▶️ Exécutez le script
   → Cliquez sur le bouton "Run"
   → Attendez l'exécution complète
   → Vérifiez les messages de sortie

5. ✅ Vérifiez les résultats
   → Le script affichera un rapport détaillé
   → Vérifiez les tables créées dans "Table Editor"

📊 DONNÉES QUI SERONT CRÉÉES:
• 14 comptes utilisateurs (tous rôles)
• 2 agences (Douala et Yaoundé)  
• 6 types d'opérations réalistes
• ~48 opérations avec statuts variés
• Commissions et transactions calculées
• Tickets de recharge et notifications

🔑 COMPTES DE CONNEXION:
• admin.general@transflow.com / Demo123!
• chef.douala@transflow.com / Demo123!
• agent1.douala@transflow.com / Demo123!
• ... (et autres)

⚡ ALTERNATIVE RAPIDE:
Si vous voulez que je tente une autre approche automatisée,
je peux essayer de créer quelques données de base via d'autres méthodes.
""")
    
    print("="*80)

if __name__ == "__main__":
    print("🧪 GÉNÉRATION DE DONNÉES MOCK - APPROCHE DIRECTE")
    print("="*60)
    
    success = execute_sql_directly()
    display_manual_instructions()
    
    print(f"\n📁 Fichiers disponibles dans /app/:")
    print("   • generate_mock_data_complete.sql (Script principal)")
    print("   • verify_mock_data.py (Vérification)")
    print("   • GUIDE_GENERATION_DONNEES_MOCK.md (Guide complet)")
    
    print(f"\n🎯 PROCHAINE ÉTAPE:")
    print("   Exécutez le script SQL dans Supabase Dashboard pour générer toutes les données.")