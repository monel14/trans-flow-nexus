-- Script de correction pour résoudre les problèmes identifiés

-- 1. Vérifier et insérer la configuration système si elle n'existe pas
INSERT INTO public.system_settings (id, config) 
VALUES (1, '{
    "app_name": "TransFlow Nexus",
    "default_currency": "XOF",
    "timezone": "Africa/Ouagadougou",
    "max_file_size": 5242880,
    "supported_file_types": "image/jpeg,image/png,application/pdf",
    "password_min_length": 8,
    "password_require_uppercase": true,
    "password_require_lowercase": true,
    "password_require_numbers": true,
    "password_require_symbols": false,
    "password_expiry_days": 90,
    "session_timeout_minutes": 60,
    "max_login_attempts": 5,
    "lockout_duration_minutes": 30,
    "email_notifications_enabled": true,
    "sms_notifications_enabled": false,
    "smtp_host": "",
    "smtp_port": 587,
    "smtp_username": "",
    "smtp_password": "",
    "smtp_encryption": "tls",
    "welcome_email_template": "Bienvenue sur TransFlow Nexus!\\n\\nVotre compte a été créé avec succès.",
    "operation_validated_template": "Votre opération #{operation_id} a été validée.",
    "balance_low_template": "Attention: Votre solde est faible ({balance}).",
    "min_operation_amount": 1000,
    "max_operation_amount": 10000000,
    "min_recharge_amount": 10000,
    "max_recharge_amount": 5000000
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Corriger les politiques RLS pour error_logs - permettre l'insertion à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "error_logs_insert_policy" ON public.error_logs;

CREATE POLICY "error_logs_insert_policy" ON public.error_logs
    FOR INSERT
    WITH CHECK (true); -- Permettre l'insertion à tous (même non authentifiés pour les logs système)

-- 3. Vérifier que les politiques de lecture sont correctes
DROP POLICY IF EXISTS "error_logs_read_policy" ON public.error_logs;

CREATE POLICY "error_logs_read_policy" ON public.error_logs
    FOR SELECT
    USING (
        -- Permettre la lecture à tous les utilisateurs authentifiés
        auth.uid() IS NOT NULL
        OR 
        -- Ou si c'est un log système (sans user_id)
        user_id IS NULL
    );

-- 4. Ajouter une politique permissive pour les logs de test
CREATE POLICY "error_logs_test_policy" ON public.error_logs
    FOR ALL
    USING (
        -- Permettre tous les accès aux logs de test
        (context->>'test')::boolean = true
    );

-- 5. Insérer un log de test pour vérifier le bon fonctionnement
INSERT INTO public.error_logs (
    level,
    source,
    message,
    context
) VALUES (
    'info',
    'system',
    'Test initial après création des tables',
    '{"test": true, "created_by": "migration_script"}'::jsonb
);

-- 6. Afficher les informations pour diagnostic
SELECT 'system_settings' as table_name, count(*) as row_count FROM public.system_settings
UNION ALL
SELECT 'error_logs' as table_name, count(*) as row_count FROM public.error_logs;