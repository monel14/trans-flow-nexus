#!/usr/bin/env python3
"""
Script de vérification des données mock créées pour TransFlow Nexus
Valide que toutes les données ont été correctement générées
"""

from supabase import create_client, Client
import json

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

class DataVerifier:
    """Vérificateur de données mock"""
    
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.issues = []
        
    def log_issue(self, issue: str):
        """Enregistre un problème détecté"""
        self.issues.append(issue)
        print(f"❌ {issue}")
    
    def log_success(self, message: str):
        """Enregistre un succès"""
        print(f"✅ {message}")
    
    def verify_agencies(self):
        """Vérifie les agences"""
        print("\n🏢 Vérification des agences...")
        
        try:
            result = self.supabase.table('agencies').select('*').execute()
            agencies = result.data
            
            if len(agencies) < 2:
                self.log_issue(f"Seulement {len(agencies)} agences trouvées, 2 attendues")
                return False
            
            # Vérifier les noms spécifiques
            agency_names = [agency['name'] for agency in agencies]
            expected_names = ['Agence de Douala', 'Agence de Yaoundé']
            
            for expected_name in expected_names:
                if expected_name not in agency_names:
                    self.log_issue(f"Agence manquante: {expected_name}")
                else:
                    self.log_success(f"Agence trouvée: {expected_name}")
            
            # Vérifier que les chefs sont assignés
            for agency in agencies:
                if agency['chef_agence_id']:
                    self.log_success(f"Chef assigné à {agency['name']}")
                else:
                    self.log_issue(f"Pas de chef assigné à {agency['name']}")
            
            return True
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des agences: {e}")
            return False
    
    def verify_users(self):
        """Vérifie les utilisateurs"""
        print("\n👥 Vérification des utilisateurs...")
        
        try:
            result = self.supabase.table('profiles').select('*, roles(name)').execute()
            profiles = result.data
            
            # Compter par rôle
            role_counts = {}
            for profile in profiles:
                role_name = profile.get('roles', {}).get('name', 'unknown') if profile.get('roles') else 'unknown'
                role_counts[role_name] = role_counts.get(role_name, 0) + 1
            
            # Vérifications attendues
            expected_counts = {
                'admin_general': 1,
                'sous_admin': 1,
                'developer': 1,
                'chef_agence': 2,
                'agent': 9
            }
            
            for role, expected_count in expected_counts.items():
                actual_count = role_counts.get(role, 0)
                if actual_count == expected_count:
                    self.log_success(f"{role}: {actual_count} utilisateurs (✓)")
                else:
                    self.log_issue(f"{role}: {actual_count} utilisateurs, {expected_count} attendus")
            
            # Vérifier les emails spécifiques
            emails = [profile['email'] for profile in profiles]
            key_emails = [
                'admin.general@transflow.com',
                'sous.admin@transflow.com',
                'developer@transflow.com',
                'chef.douala@transflow.com',
                'chef.yaoundé@transflow.com'
            ]
            
            for email in key_emails:
                if email in emails:
                    self.log_success(f"Email clé trouvé: {email}")
                else:
                    self.log_issue(f"Email clé manquant: {email}")
            
            return len(profiles) >= 14  # Total attendu
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des utilisateurs: {e}")
            return False
    
    def verify_operation_types(self):
        """Vérifie les types d'opérations"""
        print("\n💳 Vérification des types d'opérations...")
        
        try:
            result = self.supabase.table('operation_types').select('*').execute()
            op_types = result.data
            
            expected_types = [
                'Dépôt Orange Money',
                'Retrait MTN MoMo',
                'Paiement Facture ENEO',
                'Paiement Abonnement Canal+',
                'Enregistrement KYC Client',
                'Transfert Western Union'
            ]
            
            type_names = [op_type['name'] for op_type in op_types]
            
            for expected_type in expected_types:
                if expected_type in type_names:
                    self.log_success(f"Type d'opération trouvé: {expected_type}")
                else:
                    self.log_issue(f"Type d'opération manquant: {expected_type}")
            
            # Vérifier la logique impacts_balance
            for op_type in op_types:
                if op_type['name'] == 'Enregistrement KYC Client':
                    if not op_type['impacts_balance']:
                        self.log_success("KYC correctement configuré (pas d'impact balance)")
                    else:
                        self.log_issue("KYC mal configuré (devrait pas impacter balance)")
                elif op_type['impacts_balance']:
                    self.log_success(f"{op_type['name']} impacte le balance (✓)")
            
            return len(op_types) >= 5
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des types d'opérations: {e}")
            return False
    
    def verify_operations(self):
        """Vérifie les opérations"""
        print("\n🔄 Vérification des opérations...")
        
        try:
            result = self.supabase.table('operations').select('*').execute()
            operations = result.data
            
            # Compter par statut
            status_counts = {}
            for operation in operations:
                status = operation['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            self.log_success(f"Total opérations: {len(operations)}")
            
            for status, count in status_counts.items():
                self.log_success(f"  - {status}: {count}")
            
            # Vérifications spécifiques
            if status_counts.get('pending', 0) >= 10:
                self.log_success("Assez d'opérations en attente pour tester la validation")
            else:
                self.log_issue("Pas assez d'opérations en attente")
            
            if status_counts.get('completed', 0) >= 15:
                self.log_success("Assez d'opérations complétées pour les commissions")
            else:
                self.log_issue("Pas assez d'opérations complétées")
            
            if status_counts.get('failed', 0) >= 5:
                self.log_success("Opérations échouées présentes pour test d'erreurs")
            
            return len(operations) >= 40
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des opérations: {e}")
            return False
    
    def verify_commissions(self):
        """Vérifie les commissions"""
        print("\n💰 Vérification des commissions...")
        
        try:
            # Règles de commission
            rules_result = self.supabase.table('commission_rules').select('*').execute()
            rules = rules_result.data
            
            if len(rules) > 0:
                self.log_success(f"{len(rules)} règles de commission trouvées")
            else:
                self.log_issue("Aucune règle de commission trouvée")
            
            # Enregistrements de commission
            records_result = self.supabase.table('commission_records').select('*').execute()
            records = records_result.data
            
            if len(records) > 0:
                self.log_success(f"{len(records)} enregistrements de commission trouvés")
                
                # Vérifier quelques calculs
                for record in records[:3]:
                    total = record['agent_commission'] + record['chef_commission']
                    if abs(total - record['total_commission']) < 0.01:
                        self.log_success("Calcul de commission cohérent")
                    else:
                        self.log_issue("Incohérence dans le calcul de commission")
            else:
                self.log_issue("Aucun enregistrement de commission trouvé")
            
            return len(records) > 0
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des commissions: {e}")
            return False
    
    def verify_tickets(self):
        """Vérifie les tickets de recharge"""
        print("\n🎫 Vérification des tickets de recharge...")
        
        try:
            result = self.supabase.table('request_tickets').select('*').execute()
            tickets = result.data
            
            # Compter par statut
            status_counts = {}
            for ticket in tickets:
                status = ticket['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            self.log_success(f"Total tickets: {len(tickets)}")
            
            for status, count in status_counts.items():
                self.log_success(f"  - {status}: {count}")
            
            # Vérifications spécifiques
            if status_counts.get('open', 0) >= 2:
                self.log_success("Tickets ouverts disponibles pour test")
            
            if status_counts.get('resolved', 0) >= 1:
                self.log_success("Tickets résolus pour historique")
            
            return len(tickets) >= 3
            
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des tickets: {e}")
            return False
    
    def verify_transaction_ledger(self):
        """Vérifie le journal des transactions"""
        print("\n📊 Vérification du journal des transactions...")
        
        try:
            result = self.supabase.table('transaction_ledger').select('*').execute()
            ledger = result.data
            
            if len(ledger) > 0:
                self.log_success(f"{len(ledger)} entrées dans le journal des transactions")
                
                # Vérifier les types de transactions
                types = set(entry['transaction_type'] for entry in ledger)
                self.log_success(f"Types de transactions: {', '.join(types)}")
                
                return True
            else:
                self.log_issue("Aucune entrée dans le journal des transactions")
                return False
                
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification du journal: {e}")
            return False
    
    def verify_notifications(self):
        """Vérifie les notifications"""
        print("\n🔔 Vérification des notifications...")
        
        try:
            result = self.supabase.table('notifications').select('*').execute()
            notifications = result.data
            
            if len(notifications) > 0:
                self.log_success(f"{len(notifications)} notifications trouvées")
                
                # Vérifier les types
                types = set(notif['notification_type'] for notif in notifications)
                self.log_success(f"Types de notifications: {', '.join(types)}")
                
                return True
            else:
                self.log_issue("Aucune notification trouvée")
                return False
                
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des notifications: {e}")
            return False
    
    def verify_system_settings(self):
        """Vérifie les paramètres système"""
        print("\n⚙️ Vérification des paramètres système...")
        
        try:
            result = self.supabase.table('system_settings').select('*').execute()
            settings = result.data
            
            if len(settings) > 0:
                config = settings[0]['config']
                self.log_success("Paramètres système trouvés")
                
                # Vérifier quelques clés importantes
                if 'app_name' in config:
                    self.log_success(f"Nom d'app: {config['app_name']}")
                
                if 'currency' in config:
                    self.log_success(f"Devise: {config['currency']}")
                
                return True
            else:
                self.log_issue("Aucun paramètre système trouvé")
                return False
                
        except Exception as e:
            self.log_issue(f"Erreur lors de la vérification des paramètres: {e}")
            return False
    
    def generate_final_report(self):
        """Génère le rapport final"""
        print("\n" + "="*80)
        print("📋 RAPPORT FINAL DE VÉRIFICATION")
        print("="*80)
        
        if not self.issues:
            print("🎉 PARFAIT ! Toutes les vérifications sont passées avec succès.")
            print("\n✅ L'application TransFlow Nexus est prête pour la démonstration !")
            print("\n📧 Comptes de test disponibles :")
            print("   • admin.general@transflow.com / Demo123!")
            print("   • sous.admin@transflow.com / Demo123!")
            print("   • developer@transflow.com / Demo123!")
            print("   • chef.douala@transflow.com / Demo123!")
            print("   • chef.yaoundé@transflow.com / Demo123!")
            print("   • agent1.douala@transflow.com / Demo123!")
            print("   • ... (et autres agents)")
            
            print("\n🎯 Scénarios de test disponibles :")
            print("   • Connexion avec tous les rôles")
            print("   • Validation d'opérations en attente")
            print("   • Création de nouvelles opérations")
            print("   • Gestion des tickets de recharge")
            print("   • Consultation des commissions")
            print("   • Visualisation du journal des transactions")
            
        else:
            print(f"⚠️ {len(self.issues)} problèmes détectés :")
            for i, issue in enumerate(self.issues, 1):
                print(f"   {i}. {issue}")
            
            print("\n🔧 Actions recommandées :")
            print("   1. Re-exécuter le script SQL de génération")
            print("   2. Vérifier les permissions RLS dans Supabase")
            print("   3. Contrôler que les fonctions RPC sont bien déployées")
        
        print("="*80)
        
        return len(self.issues) == 0
    
    def run_full_verification(self):
        """Lance la vérification complète"""
        print("🧪 VÉRIFICATION COMPLÈTE DES DONNÉES MOCK")
        print("="*60)
        
        all_good = True
        
        all_good &= self.verify_agencies()
        all_good &= self.verify_users()
        all_good &= self.verify_operation_types()
        all_good &= self.verify_operations()
        all_good &= self.verify_commissions()
        all_good &= self.verify_tickets()
        all_good &= self.verify_transaction_ledger()
        all_good &= self.verify_notifications()
        all_good &= self.verify_system_settings()
        
        return self.generate_final_report()

if __name__ == "__main__":
    verifier = DataVerifier()
    success = verifier.run_full_verification()
    
    if success:
        print("\n🚀 Prêt pour les tests et démonstrations !")
    else:
        print("\n🔧 Corrections nécessaires avant utilisation.")