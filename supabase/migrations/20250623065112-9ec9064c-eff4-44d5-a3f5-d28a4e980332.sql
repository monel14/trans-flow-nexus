
-- Créer une table pour les validations d'opérations avec gestion atomique
CREATE TABLE public.operation_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES public.operations(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES public.profiles(id),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validation_notes TEXT,
  balance_impact NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  commission_calculated NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  validation_data JSONB DEFAULT '{}',
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour gérer les étapes de recharge avec état
CREATE TABLE public.recharge_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.request_tickets(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(15,2) NOT NULL,
  recharge_method TEXT NOT NULL CHECK (recharge_method IN ('cash', 'bank_transfer', 'mobile_money', 'card')),
  reference_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  balance_before NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  balance_after NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les virements de commissions
CREATE TABLE public.commission_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_record_id UUID NOT NULL REFERENCES public.commission_records(id) ON DELETE CASCADE,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('agent_payment', 'chef_payment', 'bulk_transfer')),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(15,2) NOT NULL,
  transfer_method TEXT NOT NULL CHECK (transfer_method IN ('balance_credit', 'bank_transfer', 'mobile_money', 'cash')),
  reference_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transfer_data JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.operation_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recharge_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_transfers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour operation_validations
CREATE POLICY "Validators can manage their validations" 
  ON public.operation_validations 
  FOR ALL
  USING (validator_id = auth.uid());

CREATE POLICY "Agents can view validations of their operations" 
  ON public.operation_validations 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.operations o 
      WHERE o.id = operation_id 
      AND o.initiator_id = auth.uid()
    )
  );

-- Politiques RLS pour recharge_operations
CREATE POLICY "Agents can manage their recharge operations" 
  ON public.recharge_operations 
  FOR ALL
  USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all recharge operations" 
  ON public.recharge_operations 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND ur.is_active = true
    )
  );

-- Politiques RLS pour commission_transfers
CREATE POLICY "Recipients can view their commission transfers" 
  ON public.commission_transfers 
  FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Admins can manage commission transfers" 
  ON public.commission_transfers 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND ur.is_active = true
    )
  );

-- Index pour optimiser les performances
CREATE INDEX idx_operation_validations_operation ON public.operation_validations(operation_id);
CREATE INDEX idx_operation_validations_validator ON public.operation_validations(validator_id);
CREATE INDEX idx_recharge_operations_ticket ON public.recharge_operations(ticket_id);
CREATE INDEX idx_recharge_operations_agent ON public.recharge_operations(agent_id);
CREATE INDEX idx_commission_transfers_record ON public.commission_transfers(commission_record_id);
CREATE INDEX idx_commission_transfers_recipient ON public.commission_transfers(recipient_id);

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_operation_validations_updated_at 
  BEFORE UPDATE ON public.operation_validations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recharge_operations_updated_at 
  BEFORE UPDATE ON public.recharge_operations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_transfers_updated_at 
  BEFORE UPDATE ON public.commission_transfers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
