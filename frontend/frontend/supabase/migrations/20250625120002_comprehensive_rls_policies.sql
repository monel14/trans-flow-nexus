-- ===============================================
-- MIGRATION: Comprehensive RLS Policies for Phase 1  
-- ===============================================
-- This migration implements comprehensive Row Level Security policies
-- for all tables based on the new schema structure

-- First, let's clean up and recreate all policies with the new structure

-- ===============================================
-- PROFILES TABLE RLS POLICIES
-- ===============================================

-- Drop existing policies and recreate with new structure
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can view profiles in their scope" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can manage profiles" ON public.profiles;

-- Users can view and update their own profile
CREATE POLICY "profiles_own_access" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Admins can view and manage all profiles
CREATE POLICY "profiles_admin_access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- Chefs can view and manage profiles in their agency
CREATE POLICY "profiles_chef_agency_access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles chef
      JOIN public.roles r ON chef.role_id = r.id
      WHERE chef.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND chef.agency_id = profiles.agency_id
      AND chef.is_active = true
    )
  );

-- ===============================================
-- AGENCIES TABLE RLS POLICIES
-- ===============================================

DROP POLICY IF EXISTS "admin_general_can_manage_agencies" ON public.agencies;

-- Admin general can manage all agencies
CREATE POLICY "agencies_admin_manage" ON public.agencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'admin_general'
      AND p.is_active = true
    )
  );

-- Chefs can view their own agency
CREATE POLICY "agencies_chef_view_own" ON public.agencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND p.agency_id = agencies.id
      AND p.is_active = true
    )
  );

-- All authenticated users can view basic agency info (for dropdowns, etc.)
CREATE POLICY "agencies_read_basic_info" ON public.agencies
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ===============================================
-- OPERATIONS TABLE RLS POLICIES
-- ===============================================

-- Enable RLS if not already enabled
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "operations_agent_own" ON public.operations;
DROP POLICY IF EXISTS "operations_chef_agency" ON public.operations;
DROP POLICY IF EXISTS "operations_admin_all" ON public.operations;

-- Agents can create operations and view their own
CREATE POLICY "operations_agent_own" ON public.operations
  FOR ALL USING (
    -- Agent can access their own operations
    initiator_id = auth.uid() OR
    -- OR if they are an agent in the same agency and have permission
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'agent'
      AND p.agency_id = operations.agency_id
      AND p.is_active = true
    )
  );

-- Chefs can view and manage operations in their agency
CREATE POLICY "operations_chef_agency" ON public.operations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND p.agency_id = operations.agency_id
      AND p.is_active = true
    )
  );

-- Admins and sous-admins can view and manage all operations
CREATE POLICY "operations_admin_all" ON public.operations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- ===============================================
-- OPERATION_TYPES AND RELATED TABLES RLS POLICIES
-- ===============================================

-- Operation types - developers can manage, others can read active ones
DROP POLICY IF EXISTS "developers_can_manage_operation_types" ON public.operation_types;
DROP POLICY IF EXISTS "Authenticated users can view active operation types" ON public.operation_types;

CREATE POLICY "operation_types_developer_manage" ON public.operation_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'developer'
      AND p.is_active = true
    )
  );

CREATE POLICY "operation_types_read_active" ON public.operation_types
  FOR SELECT TO authenticated
  USING (is_active = true AND status = 'active');

-- Operation type fields - same as operation types
DROP POLICY IF EXISTS "developers_can_manage_operation_type_fields" ON public.operation_type_fields;
DROP POLICY IF EXISTS "Authenticated users can view active operation type fields" ON public.operation_type_fields;

CREATE POLICY "operation_type_fields_developer_manage" ON public.operation_type_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'developer'
      AND p.is_active = true
    )
  );

CREATE POLICY "operation_type_fields_read_active" ON public.operation_type_fields
  FOR SELECT TO authenticated
  USING (
    NOT is_obsolete AND 
    EXISTS (
      SELECT 1 FROM public.operation_types ot 
      WHERE ot.id = operation_type_id 
      AND ot.is_active = true 
      AND ot.status = 'active'
    )
  );

-- Commission rules - same as operation types
DROP POLICY IF EXISTS "developers_can_manage_commission_rules" ON public.commission_rules;
DROP POLICY IF EXISTS "Authenticated users can view active commission rules" ON public.commission_rules;

CREATE POLICY "commission_rules_developer_manage" ON public.commission_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'developer'
      AND p.is_active = true
    )
  );

CREATE POLICY "commission_rules_read_active" ON public.commission_rules
  FOR SELECT TO authenticated
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.operation_types ot 
      WHERE ot.id = operation_type_id 
      AND ot.is_active = true 
      AND ot.status = 'active'
    )
  );

-- ===============================================
-- AGENCY_OPERATION_TYPES TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.agency_operation_types ENABLE ROW LEVEL SECURITY;

-- Admin general can manage agency operation types
CREATE POLICY "agency_operation_types_admin_manage" ON public.agency_operation_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'admin_general'
      AND p.is_active = true
    )
  );

-- All authenticated users can read to determine available services
CREATE POLICY "agency_operation_types_read_enabled" ON public.agency_operation_types
  FOR SELECT TO authenticated
  USING (is_enabled = true);

-- ===============================================
-- TRANSACTION_LEDGER TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "transaction_ledger_own_view" ON public.transaction_ledger
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all transactions for audit
CREATE POLICY "transaction_ledger_admin_audit" ON public.transaction_ledger
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- Chefs can view transactions for users in their agency
CREATE POLICY "transaction_ledger_chef_agency" ON public.transaction_ledger
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles chef
      JOIN public.roles r ON chef.role_id = r.id
      JOIN public.profiles user_profile ON user_profile.id = transaction_ledger.user_id
      WHERE chef.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND chef.agency_id = user_profile.agency_id
      AND chef.is_active = true
    )
  );

-- System functions can insert transactions
CREATE POLICY "transaction_ledger_system_insert" ON public.transaction_ledger
  FOR INSERT WITH CHECK (true); -- Controlled by functions

-- ===============================================
-- COMMISSION_RECORDS TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;

-- Agents can view their own commissions
CREATE POLICY "commission_records_agent_own" ON public.commission_records
  FOR SELECT USING (agent_id = auth.uid());

-- Chefs can view their own commissions and those of their agency
CREATE POLICY "commission_records_chef_view" ON public.commission_records
  FOR SELECT USING (
    chef_agence_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles chef
      JOIN public.roles r ON chef.role_id = r.id
      JOIN public.profiles agent ON agent.id = commission_records.agent_id
      WHERE chef.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND chef.agency_id = agent.agency_id
      AND chef.is_active = true
    )
  );

-- Admins can view all commission records
CREATE POLICY "commission_records_admin_all" ON public.commission_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- System functions can insert/update commission records
CREATE POLICY "commission_records_system_manage" ON public.commission_records
  FOR INSERT WITH CHECK (true); -- Controlled by functions

CREATE POLICY "commission_records_system_update" ON public.commission_records
  FOR UPDATE USING (true); -- Controlled by functions

-- ===============================================
-- REQUEST_TICKETS TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.request_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own tickets
CREATE POLICY "request_tickets_own" ON public.request_tickets
  FOR ALL USING (requester_id = auth.uid());

-- Admins and sous-admins can view and manage tickets according to assignment
CREATE POLICY "request_tickets_admin_manage" ON public.request_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- Assigned users can view and update their assigned tickets
CREATE POLICY "request_tickets_assigned_view" ON public.request_tickets
  FOR ALL USING (assigned_to_id = auth.uid());

-- ===============================================
-- REQUEST_TICKET_COMMENTS TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.request_ticket_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on tickets they can access
CREATE POLICY "request_ticket_comments_ticket_access" ON public.request_ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.request_tickets rt
      WHERE rt.id = request_ticket_comments.ticket_id
      AND (
        rt.requester_id = auth.uid() OR
        rt.assigned_to_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON p.role_id = r.id
          WHERE p.id = auth.uid() 
          AND r.name IN ('admin_general', 'sous_admin')
          AND p.is_active = true
        )
      )
    )
  );

-- Users can add comments to tickets they can access
CREATE POLICY "request_ticket_comments_insert" ON public.request_ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.request_tickets rt
      WHERE rt.id = request_ticket_comments.ticket_id
      AND (
        rt.requester_id = auth.uid() OR
        rt.assigned_to_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          JOIN public.roles r ON p.role_id = r.id
          WHERE p.id = auth.uid() 
          AND r.name IN ('admin_general', 'sous_admin')
          AND p.is_active = true
        )
      )
    )
  );

-- ===============================================
-- NOTIFICATIONS TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "notifications_recipient_only" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_recipient_update" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_system_insert" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Controlled by triggers/functions

-- ===============================================
-- APP_AUDIT_LOG TABLE RLS POLICIES
-- ===============================================

ALTER TABLE public.app_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin general and developers can read audit logs
CREATE POLICY "app_audit_log_admin_read" ON public.app_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'developer')
      AND p.is_active = true
    )
  );

-- System can insert audit logs
CREATE POLICY "app_audit_log_system_insert" ON public.app_audit_log
  FOR INSERT WITH CHECK (true); -- Controlled by triggers

-- ===============================================
-- OPERATION_VALIDATIONS TABLE RLS POLICIES
-- ===============================================

-- These policies are already defined, but let's ensure they work with new structure
DROP POLICY IF EXISTS "Validators can manage their validations" ON public.operation_validations;
DROP POLICY IF EXISTS "Agents can view validations of their operations" ON public.operation_validations;

CREATE POLICY "operation_validations_validator_manage" ON public.operation_validations
  FOR ALL USING (validator_id = auth.uid());

CREATE POLICY "operation_validations_agent_view" ON public.operation_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.operations o 
      WHERE o.id = operation_id 
      AND o.initiator_id = auth.uid()
    )
  );

-- Admins can view all validations
CREATE POLICY "operation_validations_admin_view" ON public.operation_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- ===============================================
-- RECHARGE_OPERATIONS TABLE RLS POLICIES
-- ===============================================

-- Update existing policies to work with new structure
DROP POLICY IF EXISTS "Agents can manage their recharge operations" ON public.recharge_operations;
DROP POLICY IF EXISTS "Admins can view all recharge operations" ON public.recharge_operations;

CREATE POLICY "recharge_operations_agent_own" ON public.recharge_operations
  FOR ALL USING (agent_id = auth.uid());

CREATE POLICY "recharge_operations_admin_view" ON public.recharge_operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- Chefs can view recharge operations for their agency
CREATE POLICY "recharge_operations_chef_agency" ON public.recharge_operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles chef
      JOIN public.roles r ON chef.role_id = r.id
      JOIN public.profiles agent ON agent.id = recharge_operations.agent_id
      WHERE chef.id = auth.uid() 
      AND r.name = 'chef_agence'
      AND chef.agency_id = agent.agency_id
      AND chef.is_active = true
    )
  );

-- ===============================================
-- COMMISSION_TRANSFERS TABLE RLS POLICIES
-- ===============================================

-- Update existing policies to work with new structure
DROP POLICY IF EXISTS "Recipients can view their commission transfers" ON public.commission_transfers;
DROP POLICY IF EXISTS "Admins can manage commission transfers" ON public.commission_transfers;

CREATE POLICY "commission_transfers_recipient_view" ON public.commission_transfers
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "commission_transfers_admin_manage" ON public.commission_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin')
      AND p.is_active = true
    )
  );

-- System functions can insert/update transfers
CREATE POLICY "commission_transfers_system_manage" ON public.commission_transfers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "commission_transfers_system_update" ON public.commission_transfers
  FOR UPDATE USING (true);

-- ===============================================
-- PERMISSIONS AND ROLES TABLE RLS POLICIES  
-- ===============================================

-- Roles table - Admin general can manage, others can read
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_admin_manage" ON public.roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'admin_general'
      AND p.is_active = true
    )
  );

CREATE POLICY "roles_read_all" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

-- Permissions table - Admin general and developers can manage
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_admin_dev_manage" ON public.permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'developer')
      AND p.is_active = true
    )
  );

-- Role permissions table - Admin general and developers can manage
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_admin_dev_manage" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name IN ('admin_general', 'developer')
      AND p.is_active = true
    )
  );

-- ===============================================
-- UPDATE USER_ROLES TABLE (DEPRECATED) POLICIES
-- ===============================================

-- Keep backward compatibility but mark as deprecated
DROP POLICY IF EXISTS "user_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_general_can_manage_all_user_roles" ON public.user_roles;

CREATE POLICY "user_roles_deprecated_view_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_deprecated_admin_manage" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
      AND r.name = 'admin_general'
      AND p.is_active = true
    )
  );

-- Add comment to indicate deprecation
COMMENT ON TABLE public.user_roles IS 'DEPRECATED: Use profiles.role_id and profiles.agency_id instead. This table is kept for backward compatibility only.';

-- ===============================================
-- Summary of RLS Policies Created
-- ===============================================
-- ✅ profiles: Own access + admin/chef hierarchy access
-- ✅ agencies: Admin manage + chef view own + basic read for all
-- ✅ operations: Agent own + chef agency + admin all
-- ✅ operation_types/fields/rules: Developer manage + authenticated read active
-- ✅ agency_operation_types: Admin manage + authenticated read enabled
-- ✅ transaction_ledger: Own view + admin audit + chef agency view
-- ✅ commission_records: Agent own + chef view agency + admin all
-- ✅ request_tickets: Own + admin manage + assigned view
-- ✅ request_ticket_comments: Ticket access based
-- ✅ notifications: Recipient only access
-- ✅ app_audit_log: Admin general + developer read only
-- ✅ operation_validations: Validator manage + agent/admin view
-- ✅ recharge_operations: Agent own + admin view + chef agency view
-- ✅ commission_transfers: Recipient view + admin manage
-- ✅ roles/permissions: Admin manage + read access
-- ✅ user_roles: Deprecated but compatible policies maintained