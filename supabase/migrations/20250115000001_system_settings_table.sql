-- Création de la table system_settings pour la configuration globale
-- Cette table ne contient qu'une seule ligne pour centraliser tous les paramètres système

CREATE TABLE public.system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{
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
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT,
    -- Contrainte pour s'assurer qu'on ne peut pas insérer d'autres lignes
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Insérer la ligne unique initiale
INSERT INTO public.system_settings (id) VALUES (1);

-- RLS (Row Level Security) - Seuls les développeurs peuvent modifier
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "system_settings_read_policy" ON public.system_settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Politique d'écriture : Seuls les développeurs peuvent modifier
CREATE POLICY "system_settings_write_policy" ON public.system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid()
            AND r.name = 'developer'
        )
    );

-- Index pour optimiser les requêtes JSON
CREATE INDEX idx_system_settings_config_gin ON public.system_settings USING GIN (config);

-- Commentaires pour la documentation
COMMENT ON TABLE public.system_settings IS 'Table de configuration globale du système avec une seule ligne';
COMMENT ON COLUMN public.system_settings.config IS 'Configuration JSON contenant tous les paramètres système';
COMMENT ON COLUMN public.system_settings.updated_at IS 'Timestamp de dernière modification';
COMMENT ON COLUMN public.system_settings.updated_by IS 'ID de l''utilisateur qui a effectué la dernière modification';