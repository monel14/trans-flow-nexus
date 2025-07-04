
-- 1. Correction des tables existantes et ajout des colonnes manquantes (version corrigée)

-- Mise à jour de la table agencies pour inclure chef_agence_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'chef_agence_id') THEN
        ALTER TABLE public.agencies ADD COLUMN chef_agence_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'updated_at') THEN
        ALTER TABLE public.agencies ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Mise à jour de la table profiles pour inclure les colonnes essentielles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
        ALTER TABLE public.profiles ADD COLUMN role_id INTEGER REFERENCES public.roles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'agency_id') THEN
        ALTER TABLE public.profiles ADD COLUMN agency_id INTEGER REFERENCES public.agencies(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'balance') THEN
        ALTER TABLE public.profiles ADD COLUMN balance DECIMAL(15,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Ajout des contraintes seulement si elles n'existent pas
DO $$
BEGIN
    -- Contrainte unique email
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_email_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE(email);
    END IF;
    
    -- Contrainte unique phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_phone_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE(phone);
    END IF;
    
    -- FK vers auth.users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_user_id_fkey') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- FK operation_type_fields vers operation_types
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'operation_type_fields_operation_type_id_fkey') THEN
        ALTER TABLE public.operation_type_fields ADD CONSTRAINT operation_type_fields_operation_type_id_fkey 
        FOREIGN KEY (operation_type_id) REFERENCES public.operation_types(id) ON DELETE CASCADE;
    END IF;
    
    -- Contrainte unique operation_type_fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'operation_type_fields_unique_name') THEN
        ALTER TABLE public.operation_type_fields ADD CONSTRAINT operation_type_fields_unique_name 
        UNIQUE (operation_type_id, name);
    END IF;
    
    -- FK operation_types created_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'operation_types_created_by_fkey') THEN
        ALTER TABLE public.operation_types ADD CONSTRAINT operation_types_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
    
    -- FK operation_types updated_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'operation_types_updated_by_fkey') THEN
        ALTER TABLE public.operation_types ADD CONSTRAINT operation_types_updated_by_fkey 
        FOREIGN KEY (updated_by) REFERENCES auth.users(id);
    END IF;
    
    -- FK role_permissions vers roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'role_permissions_role_id_fkey') THEN
        ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
    END IF;
    
    -- FK role_permissions vers permissions
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'role_permissions_permission_id_fkey') THEN
        ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey 
        FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
    END IF;
    
    -- FK user_roles vers auth.users
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_roles_user_id_fkey') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- FK user_roles vers roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_roles_role_id_fkey') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES public.roles(id);
    END IF;
    
    -- FK user_roles vers agencies
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_roles_agency_id_fkey') THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_agency_id_fkey 
        FOREIGN KEY (agency_id) REFERENCES public.agencies(id);
    END IF;
END $$;

-- 2. Création des nouvelles tables seulement si elles n'existent pas

-- Table de liaison entre agences et types d'opérations
CREATE TABLE IF NOT EXISTS public.agency_operation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id INTEGER NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  operation_type_id UUID NOT NULL REFERENCES public.operation_types(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  daily_limit DECIMAL(15,2),
  monthly_limit DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agency_id, operation_type_id)
);

-- Table principale des opérations/transactions
CREATE TABLE IF NOT EXISTS public.operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type_id UUID NOT NULL REFERENCES public.operation_types(id),
  reference_number TEXT NOT NULL UNIQUE,
  initiator_id UUID NOT NULL REFERENCES auth.users(id),
  agency_id INTEGER NOT NULL REFERENCES public.agencies(id),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  operation_data JSONB NOT NULL DEFAULT '{}',
  fee_amount DECIMAL(15,2) DEFAULT 0.00,
  commission_amount DECIMAL(15,2) DEFAULT 0.00,
  validator_id UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal des mouvements de solde (ledger)
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_id UUID REFERENCES public.operations(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'commission', 'fee', 'recharge', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enregistrement des commissions générées
CREATE TABLE IF NOT EXISTS public.commission_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES public.operations(id),
  agent_id UUID NOT NULL REFERENCES auth.users(id),
  chef_agence_id UUID REFERENCES auth.users(id),
  commission_rule_id UUID NOT NULL REFERENCES public.commission_rules(id),
  agent_commission DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  chef_commission DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_commission DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Système de tickets de demande
CREATE TABLE IF NOT EXISTS public.request_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_to_id UUID REFERENCES auth.users(id),
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('recharge', 'support', 'technical', 'complaint', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requested_amount DECIMAL(15,2),
  resolution_notes TEXT,
  resolved_by_id UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pièces jointes des tickets
CREATE TABLE IF NOT EXISTS public.request_ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.request_tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commentaires des tickets
CREATE TABLE IF NOT EXISTS public.request_ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.request_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Système de notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  sender_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('operation', 'commission', 'ticket', 'system', 'balance', 'validation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal d'audit de l'application
CREATE TABLE IF NOT EXISTS public.app_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Triggers pour updated_at (seulement si ils n'existent pas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_agencies_updated_at') THEN
        CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_agency_operation_types_updated_at') THEN
        CREATE TRIGGER update_agency_operation_types_updated_at BEFORE UPDATE ON public.agency_operation_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_operations_updated_at') THEN
        CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON public.operations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_commission_records_updated_at') THEN
        CREATE TRIGGER update_commission_records_updated_at BEFORE UPDATE ON public.commission_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_request_tickets_updated_at') THEN
        CREATE TRIGGER update_request_tickets_updated_at BEFORE UPDATE ON public.request_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_request_ticket_comments_updated_at') THEN
        CREATE TRIGGER update_request_ticket_comments_updated_at BEFORE UPDATE ON public.request_ticket_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 4. Index pour optimiser les performances (seulement si ils n'existent pas)
CREATE INDEX IF NOT EXISTS idx_operations_status ON public.operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_initiator_agency ON public.operations(initiator_id, agency_id);
CREATE INDEX IF NOT EXISTS idx_operations_created_at ON public.operations(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_user_id ON public.transaction_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_created_at ON public.transaction_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_records_agent_id ON public.commission_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_status ON public.commission_records(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON public.app_audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_request_tickets_status ON public.request_tickets(status);
CREATE INDEX IF NOT EXISTS idx_request_tickets_assigned_to ON public.request_tickets(assigned_to_id);

-- 5. Activation de RLS sur les nouvelles tables
ALTER TABLE public.agency_operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_audit_log ENABLE ROW LEVEL SECURITY;
