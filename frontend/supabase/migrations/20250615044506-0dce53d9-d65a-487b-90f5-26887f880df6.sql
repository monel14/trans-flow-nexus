
-- Créer la table pour les types d'opérations
CREATE TABLE public.operation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  impacts_balance BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Créer la table pour les champs dynamiques des types d'opérations
CREATE TABLE public.operation_type_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'tel', 'select', 'textarea', 'file', 'date', 'checkbox', 'radio')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_obsolete BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  validation_rules JSONB DEFAULT '{}',
  options JSONB DEFAULT '[]', -- Pour les champs select, radio, checkbox
  placeholder TEXT,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(operation_type_id, name)
);

-- Créer la table pour les règles de commission
CREATE TABLE public.commission_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE CASCADE,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('fixed', 'percentage', 'tiered')),
  fixed_amount DECIMAL(15,2), -- Pour commission fixe
  percentage_rate DECIMAL(5,4), -- Pour commission pourcentage (ex: 2.5% = 0.025)
  tiered_rules JSONB DEFAULT '[]', -- Pour commission par paliers
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_type_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour operation_types (seuls les développeurs peuvent gérer)
CREATE POLICY "Developers can manage operation types" 
  ON public.operation_types 
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

-- Politiques RLS pour operation_type_fields
CREATE POLICY "Developers can manage operation type fields" 
  ON public.operation_type_fields 
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

-- Politiques RLS pour commission_rules
CREATE POLICY "Developers can manage commission rules" 
  ON public.commission_rules 
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

-- Politique de lecture pour tous les utilisateurs authentifiés (pour utiliser les types d'opérations)
CREATE POLICY "Authenticated users can view active operation types" 
  ON public.operation_types 
  FOR SELECT
  TO authenticated
  USING (is_active = true AND status = 'active');

CREATE POLICY "Authenticated users can view active operation type fields" 
  ON public.operation_type_fields 
  FOR SELECT
  TO authenticated
  USING (
    NOT is_obsolete AND 
    EXISTS (
      SELECT 1 FROM public.operation_types ot 
      WHERE ot.id = operation_type_id 
      AND ot.is_active = true 
      AND ot.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can view active commission rules" 
  ON public.commission_rules 
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.operation_types ot 
      WHERE ot.id = operation_type_id 
      AND ot.is_active = true 
      AND ot.status = 'active'
    )
  );

-- Index pour optimiser les performances
CREATE INDEX idx_operation_types_status ON public.operation_types(status, is_active);
CREATE INDEX idx_operation_type_fields_type_order ON public.operation_type_fields(operation_type_id, display_order);
CREATE INDEX idx_commission_rules_type ON public.commission_rules(operation_type_id, is_active);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operation_types_updated_at 
  BEFORE UPDATE ON public.operation_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operation_type_fields_updated_at 
  BEFORE UPDATE ON public.operation_type_fields 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_rules_updated_at 
  BEFORE UPDATE ON public.commission_rules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
