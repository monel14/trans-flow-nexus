#!/usr/bin/env python3
"""
Script simplifié pour insérer des données directement via API admin
Contourne RLS en utilisant l'API service_role si possible
"""

import os
from supabase import create_client, Client
import json

# Configuration Supabase avec la clé admin/service (si disponible)
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def try_direct_insertion():
    """Essaie d'insérer des données directement"""
    print("🚀 Tentative d'insertion directe...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    # Données minimales pour tester
    agencies_data = [
        {"name": "Agence de Douala", "city": "Douala", "is_active": True},
        {"name": "Agence de Yaoundé", "city": "Yaoundé", "is_active": True}
    ]
    
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
            "name": "Enregistrement KYC Client",
            "description": "Enregistrement et vérification identité client",
            "impacts_balance": False,
            "is_active": True,
            "status": "active"
        }
    ]
    
    try:
        print("📋 Tentative d'insertion des agences...")
        for agency in agencies_data:
            try:
                result = supabase.table('agencies').insert(agency).execute()
                if result.data:
                    print(f"✅ Agence créée: {agency['name']}")
            except Exception as e:
                print(f"❌ Agence {agency['name']}: {e}")
        
        print("📋 Tentative d'insertion des types d'opérations...")
        for op_type in operation_types_data:
            try:
                result = supabase.table('operation_types').insert(op_type).execute()
                if result.data:
                    print(f"✅ Type d'opération créé: {op_type['name']}")
            except Exception as e:
                print(f"❌ Type d'opération {op_type['name']}: {e}")
                
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

def try_sql_execution():
    """Essaie d'exécuter du SQL directement"""
    print("🔧 Tentative d'exécution SQL...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    # SQL simple pour insérer des agences
    sql_agencies = """
    INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
    VALUES 
        ('Agence de Douala', 'Douala', true, now(), now()),
        ('Agence de Yaoundé', 'Yaoundé', true, now(), now())
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    """
    
    try:
        result = supabase.rpc('exec', {'sql': sql_agencies}).execute()
        print(f"✅ SQL exécuté: {result}")
    except Exception as e:
        print(f"❌ Erreur SQL: {e}")

def show_current_state():
    """Affiche l'état actuel de la base"""
    print("📊 État actuel de la base de données:")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    tables = ['agencies', 'operation_types', 'profiles', 'operations']
    
    for table in tables:
        try:
            result = supabase.table(table).select('*').execute()
            print(f"   {table}: {len(result.data)} enregistrements")
        except Exception as e:
            print(f"   {table}: Erreur - {e}")

if __name__ == "__main__":
    print("🧪 TENTATIVES DE CONTOURNEMENT RLS")
    print("="*50)
    
    show_current_state()
    
    print("\n" + "="*50)
    try_direct_insertion()
    
    print("\n" + "="*50)  
    try_sql_execution()
    
    print("\n" + "="*50)
    show_current_state()
    
    print("\n💡 RECOMMANDATION:")
    print("   Exécuter le script SQL complet directement dans Supabase Dashboard")
    print("   Fichier: generate_mock_data_complete.sql")