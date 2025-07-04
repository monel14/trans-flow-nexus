-- ===============================================
-- MIGRATION: Initial Data Setup for Phase 1
-- ===============================================
-- This migration creates initial roles, permissions, and test data

-- Step 1: Insert basic roles
-- =========================

INSERT INTO public.roles (id, name, label) VALUES 
(1, 'agent', 'Agent'),
(2, 'chef_agence', 'Chef d''Agence'),
(3, 'admin_general', 'Administrateur Général'),
(4, 'sous_admin', 'Sous-Administrateur'),
(5, 'developer', 'Développeur')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  label = EXCLUDED.label;

-- Step 2: Insert basic permissions
-- ================================

INSERT INTO public.permissions (id, code, label) VALUES 
(1, 'read_own_profile', 'Lire son propre profil'),
(2, 'update_own_profile', 'Modifier son propre profil'),
(3, 'create_operation', 'Créer une opération'),
(4, 'read_own_operations', 'Lire ses opérations'),
(5, 'read_agency_operations', 'Lire les opérations de l''agence'),
(6, 'validate_operations', 'Valider les opérations'),
(7, 'manage_agents', 'Gérer les agents'),
(8, 'manage_agencies', 'Gérer les agences'),
(9, 'manage_users', 'Gérer les utilisateurs'),
(10, 'read_all_data', 'Lire toutes les données'),
(11, 'manage_system_config', 'Gérer la configuration système'),
(12, 'manage_operation_types', 'Gérer les types d''opérations'),
(13, 'process_recharges', 'Traiter les recharges'),
(14, 'view_commissions', 'Voir les commissions'),
(15, 'transfer_commissions', 'Transférer les commissions'),
(16, 'read_audit_logs', 'Lire les journaux d''audit'),
(17, 'manage_support_tickets', 'Gérer les tickets de support'),
(18, 'view_transaction_history', 'Voir l''historique des transactions')
ON CONFLICT (id) DO UPDATE SET 
  code = EXCLUDED.code,
  label = EXCLUDED.label;

-- Step 3: Assign permissions to roles
-- ===================================

-- Agent permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 14), (1, 15), (1, 18)
ON CONFLICT DO NOTHING;

-- Chef d'agence permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES 
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 7), (2, 13), (2, 14), (2, 15), (2, 18)
ON CONFLICT DO NOTHING;

-- Admin général permissions (all permissions)
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT 3, id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Sous-admin permissions (subset of admin)
INSERT INTO public.role_permissions (role_id, permission_id) VALUES 
(4, 1), (4, 2), (4, 4), (4, 5), (4, 6), (4, 9), (4, 10), (4, 13), (4, 14), (4, 17), (4, 18)
ON CONFLICT DO NOTHING;

-- Developer permissions (system configuration)
INSERT INTO public.role_permissions (role_id, permission_id) VALUES 
(5, 1), (5, 2), (5, 10), (5, 11), (5, 12), (5, 16)
ON CONFLICT DO NOTHING;

-- Step 4: Create sample agencies
-- ==============================

INSERT INTO public.agencies (id, name, city, is_active) VALUES 
(1, 'Agence Centrale Dakar', 'Dakar', true),
(2, 'Agence Thiès', 'Thiès', true),
(3, 'Agence Saint-Louis', 'Saint-Louis', true),
(4, 'Agence Ziguinchor', 'Ziguinchor', true),
(5, 'Agence Kaolack', 'Kaolack', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  is_active = EXCLUDED.is_active;

-- Step 5: Create sample operation types
-- ====================================

INSERT INTO public.operation_types (id, name, description, impacts_balance, is_active, status) VALUES 
('01J6YV8KW7XM9N2QA1B5C3R4D8', 'transfer_money', 'Transfert d''argent', true, true, 'active'),
('01J6YV8KW7XM9N2QA1B5C3R4D9', 'mobile_recharge', 'Recharge téléphonique', true, true, 'active'),
('01J6YV8KW7XM9N2QA1B5C3R4E0', 'bill_payment', 'Paiement de facture', true, true, 'active'),
('01J6YV8KW7XM9N2QA1B5C3R4E1', 'airtime_purchase', 'Achat de crédit d''appel', true, true, 'active'),
('01J6YV8KW7XM9N2QA1B5C3R4E2', 'cash_deposit', 'Dépôt d''espèces', false, true, 'active'),
('01J6YV8KW7XM9N2QA1B5C3R4E3', 'cash_withdrawal', 'Retrait d''espèces', true, true, 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  impacts_balance = EXCLUDED.impacts_balance,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status;

-- Step 6: Create operation type fields
-- ====================================

-- Transfer money fields
INSERT INTO public.operation_type_fields (id, operation_type_id, name, label, field_type, is_required, display_order) VALUES 
('01J6YV8KW7XM9N2QA1B5C3R4F0', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'recipient_phone', 'Numéro du destinataire', 'tel', true, 1),
('01J6YV8KW7XM9N2QA1B5C3R4F1', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'recipient_name', 'Nom du destinataire', 'text', true, 2),
('01J6YV8KW7XM9N2QA1B5C3R4F2', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'amount', 'Montant', 'number', true, 3),
('01J6YV8KW7XM9N2QA1B5C3R4F3', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'reference', 'Code de référence', 'text', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Mobile recharge fields
INSERT INTO public.operation_type_fields (id, operation_type_id, name, label, field_type, is_required, display_order) VALUES 
('01J6YV8KW7XM9N2QA1B5C3R4F4', '01J6YV8KW7XM9N2QA1B5C3R4D9', 'phone_number', 'Numéro de téléphone', 'tel', true, 1),
('01J6YV8KW7XM9N2QA1B5C3R4F5', '01J6YV8KW7XM9N2QA1B5C3R4D9', 'operator', 'Opérateur', 'select', true, 2),
('01J6YV8KW7XM9N2QA1B5C3R4F6', '01J6YV8KW7XM9N2QA1B5C3R4D9', 'amount', 'Montant', 'number', true, 3)
ON CONFLICT (id) DO NOTHING;

-- Update operator field with options
UPDATE public.operation_type_fields 
SET options = '["Orange", "Free", "Expresso", "Promobile"]'::jsonb
WHERE id = '01J6YV8KW7XM9N2QA1B5C3R4F5';

-- Step 7: Create commission rules
-- ===============================

INSERT INTO public.commission_rules (id, operation_type_id, commission_type, percentage_rate, is_active) VALUES 
('01J6YV8KW7XM9N2QA1B5C3R4G0', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'percentage', 0.02, true), -- 2% for transfers
('01J6YV8KW7XM9N2QA1B5C3R4G1', '01J6YV8KW7XM9N2QA1B5C3R4D9', 'percentage', 0.03, true), -- 3% for mobile recharge
('01J6YV8KW7XM9N2QA1B5C3R4G2', '01J6YV8KW7XM9N2QA1B5C3R4E0', 'percentage', 0.015, true), -- 1.5% for bill payments
('01J6YV8KW7XM9N2QA1B5C3R4G3', '01J6YV8KW7XM9N2QA1B5C3R4E1', 'fixed', NULL, true), -- Fixed commission for airtime
('01J6YV8KW7XM9N2QA1B5C3R4G4', '01J6YV8KW7XM9N2QA1B5C3R4E3', 'percentage', 0.01, true) -- 1% for withdrawals
ON CONFLICT (id) DO NOTHING;

-- Update fixed commission amount
UPDATE public.commission_rules 
SET fixed_amount = 50.00 
WHERE id = '01J6YV8KW7XM9N2QA1B5C3R4G3';

-- Step 8: Link operation types to agencies
-- ========================================

-- All agencies can perform all operation types initially
INSERT INTO public.agency_operation_types (agency_id, operation_type_id, is_enabled, daily_limit, monthly_limit)
SELECT a.id, ot.id, true, 1000000.00, 30000000.00
FROM public.agencies a
CROSS JOIN public.operation_types ot
WHERE a.is_active = true AND ot.is_active = true
ON CONFLICT (agency_id, operation_type_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  daily_limit = EXCLUDED.daily_limit,
  monthly_limit = EXCLUDED.monthly_limit;

-- Step 9: Create sample admin user (for testing)
-- ==============================================

-- Note: This will be created via the auth.users trigger when a user signs up
-- But we can prepare the structure for when the first admin signs up

-- Create system settings table for configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only developers and admin_general can manage system settings
CREATE POLICY "system_settings_dev_admin_manage" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'developer')
      AND p.is_active = true
    )
  );

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES 
('app_name', '"Système de Gestion Financière"', 'Nom de l''application'),
('app_version', '"1.0.0"', 'Version de l''application'),
('default_currency', '"XOF"', 'Devise par défaut'),
('commission_distribution', '{"agent_percentage": 0.8, "chef_percentage": 0.2}', 'Répartition des commissions'),
('operation_limits', '{"daily_max": 1000000, "monthly_max": 30000000}', 'Limites par défaut des opérations'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'Paramètres de notification'),
('maintenance_mode', 'false', 'Mode maintenance'),
('max_failed_login_attempts', '5', 'Nombre maximum de tentatives de connexion échouées')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();

-- Add updated_at trigger for system_settings
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON public.system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Create helpful views for reporting
-- ===========================================

-- View for user summary with role and agency info
CREATE OR REPLACE VIEW public.user_summary AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.first_name,
  p.last_name,
  p.phone,
  p.balance,
  p.is_active,
  p.created_at,
  r.name as role_name,
  r.label as role_label,
  a.name as agency_name,
  a.city as agency_city
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id
LEFT JOIN public.agencies a ON p.agency_id = a.id;

-- View for operation summary with related data
CREATE OR REPLACE VIEW public.operation_summary AS
SELECT 
  o.id,
  o.reference_number,
  o.amount,
  o.status,
  o.created_at,
  o.completed_at,
  ot.name as operation_type_name,
  ot.description as operation_type_description,
  initiator.name as initiator_name,
  initiator.email as initiator_email,
  validator.name as validator_name,
  a.name as agency_name,
  o.commission_amount
FROM public.operations o
JOIN public.operation_types ot ON o.operation_type_id = ot.id
JOIN public.profiles initiator ON o.initiator_id = initiator.id
LEFT JOIN public.profiles validator ON o.validator_id = validator.id
LEFT JOIN public.agencies a ON o.agency_id = a.id;

-- Grant access to views for authenticated users
GRANT SELECT ON public.user_summary TO authenticated;
GRANT SELECT ON public.operation_summary TO authenticated;

-- Add RLS policies for views (inherit from base tables)
ALTER VIEW public.user_summary SET (security_barrier = true);
ALTER VIEW public.operation_summary SET (security_barrier = true);

-- ===============================================
-- Summary of initial data created:
-- ===============================================
-- ✅ 5 basic roles (agent, chef_agence, admin_general, sous_admin, developer)
-- ✅ 18 permissions covering all system functions
-- ✅ Role-permission assignments for proper access control
-- ✅ 5 sample agencies in different cities
-- ✅ 6 operation types with different characteristics
-- ✅ Dynamic fields for operation types (transfer, mobile recharge)
-- ✅ Commission rules with different types (percentage, fixed)
-- ✅ Agency-operation type relationships
-- ✅ System settings table with default configuration
-- ✅ Helpful views for reporting and dashboard queries
-- 
-- The system is now ready for:
-- - User registration and role assignment
-- - Operation creation and processing
-- - Commission calculation and distribution
-- - Financial tracking and reporting