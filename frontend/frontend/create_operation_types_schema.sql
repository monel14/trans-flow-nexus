-- Script pour créer ou mettre à jour la table operation_types selon la nouvelle structure
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table operation_types si elle n'existe pas ou la modifier
CREATE TABLE IF NOT EXISTS public.operation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    impacts_balance BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operation_types_updated_at 
    BEFORE UPDATE ON public.operation_types 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Table pour les champs dynamiques des types d'opérations
CREATE TABLE IF NOT EXISTS public.operation_type_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'tel', 'select', 'textarea', 'file', 'date', 'checkbox', 'radio')),
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_obsolete BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    validation_rules JSONB,
    options TEXT[],
    placeholder TEXT,
    help_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(operation_type_id, name)
);

CREATE TRIGGER update_operation_type_fields_updated_at 
    BEFORE UPDATE ON public.operation_type_fields 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Table pour les règles de commission
CREATE TABLE IF NOT EXISTS public.commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE CASCADE,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('fixed', 'percentage', 'tiered')),
    fixed_amount DECIMAL(15,2),
    percentage_rate DECIMAL(5,2),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    tiered_rules JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_commission_rules_updated_at 
    BEFORE UPDATE ON public.commission_rules 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Politiques RLS pour operation_types
ALTER TABLE public.operation_types ENABLE ROW LEVEL SECURITY;

-- Politique pour les développeurs (accès complet)
CREATE POLICY "Developers can manage operation types" ON public.operation_types
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'developer'
            AND ur.is_active = true
        )
    );

-- Politique pour lecture par tous les utilisateurs authentifiés (types actifs seulement)
CREATE POLICY "Authenticated users can view active operation types" ON public.operation_types
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND is_active = true 
        AND status = 'active'
    );

-- 6. Politiques RLS pour operation_type_fields
ALTER TABLE public.operation_type_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage operation type fields" ON public.operation_type_fields
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'developer'
            AND ur.is_active = true
        )
    );

CREATE POLICY "Authenticated users can view operation type fields" ON public.operation_type_fields
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND NOT is_obsolete
    );

-- 7. Politiques RLS pour commission_rules
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage commission rules" ON public.commission_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'developer'
            AND ur.is_active = true
        )
    );

CREATE POLICY "Authenticated users can view commission rules" ON public.commission_rules
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND is_active = true
    );

-- 8. Données d'exemple (optionnel)
INSERT INTO public.operation_types (name, description, impacts_balance, status) VALUES
    ('Virement', 'Virement bancaire entre comptes', true, 'active'),
    ('Dépôt', 'Dépôt d''espèces sur un compte', true, 'active'),
    ('Retrait', 'Retrait d''espèces depuis un compte', true, 'active'),
    ('Consultation de solde', 'Vérification du solde d''un compte', false, 'active'),
    ('Transfert mobile', 'Transfert via mobile money', true, 'active')
ON CONFLICT (name) DO NOTHING;

-- 9. Champs d'exemple pour le type "Virement"
DO $$
DECLARE
    virement_id UUID;
BEGIN
    -- Récupérer l'ID du type "Virement"
    SELECT id INTO virement_id FROM public.operation_types WHERE name = 'Virement';
    
    IF virement_id IS NOT NULL THEN
        INSERT INTO public.operation_type_fields (operation_type_id, name, label, field_type, is_required, display_order, placeholder) VALUES
            (virement_id, 'montant', 'Montant', 'number', true, 1, 'Entrez le montant en XOF'),
            (virement_id, 'beneficiaire', 'Bénéficiaire', 'text', true, 2, 'Nom complet du bénéficiaire'),
            (virement_id, 'compte_destination', 'Compte de destination', 'text', true, 3, 'Numéro de compte du bénéficiaire'),
            (virement_id, 'motif', 'Motif du virement', 'textarea', false, 4, 'Raison du virement (optionnel)')
        ON CONFLICT (operation_type_id, name) DO NOTHING;
        
        -- Règle de commission pour virement (2.5% du montant)
        INSERT INTO public.commission_rules (operation_type_id, commission_type, percentage_rate) VALUES
            (virement_id, 'percentage', 2.5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 10. Autoriser la lecture publique des types d'opérations actifs (pour le frontend)
GRANT SELECT ON public.operation_types TO anon, authenticated;
GRANT SELECT ON public.operation_type_fields TO anon, authenticated;
GRANT SELECT ON public.commission_rules TO anon, authenticated;

-- 11. Autorisations complètes pour les développeurs
GRANT ALL ON public.operation_types TO authenticated;
GRANT ALL ON public.operation_type_fields TO authenticated;
GRANT ALL ON public.commission_rules TO authenticated;