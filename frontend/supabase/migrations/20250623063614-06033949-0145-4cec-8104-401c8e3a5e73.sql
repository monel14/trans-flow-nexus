
-- Ajouter les clés étrangères manquantes pour permettre les relations Supabase

-- 1. Ajouter la clé étrangère pour agencies.chef_agence_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'agencies_chef_agence_id_fkey'
    ) THEN
        ALTER TABLE public.agencies 
        ADD CONSTRAINT agencies_chef_agence_id_fkey 
        FOREIGN KEY (chef_agence_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Ajouter la clé étrangère pour operations.initiator_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_initiator_id_fkey'
    ) THEN
        ALTER TABLE public.operations 
        ADD CONSTRAINT operations_initiator_id_fkey 
        FOREIGN KEY (initiator_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 3. Ajouter la clé étrangère pour request_tickets.requester_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_requester_id_fkey'
    ) THEN
        ALTER TABLE public.request_tickets 
        ADD CONSTRAINT request_tickets_requester_id_fkey 
        FOREIGN KEY (requester_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 4. Ajouter la clé étrangère pour request_tickets.assigned_to_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_assigned_to_id_fkey'
    ) THEN
        ALTER TABLE public.request_tickets 
        ADD CONSTRAINT request_tickets_assigned_to_id_fkey 
        FOREIGN KEY (assigned_to_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 5. Ajouter la clé étrangère pour request_tickets.resolved_by_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_resolved_by_id_fkey'
    ) THEN
        ALTER TABLE public.request_tickets 
        ADD CONSTRAINT request_tickets_resolved_by_id_fkey 
        FOREIGN KEY (resolved_by_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 6. Ajouter la clé étrangère pour request_ticket_comments.author_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_ticket_comments_author_id_fkey'
    ) THEN
        ALTER TABLE public.request_ticket_comments 
        ADD CONSTRAINT request_ticket_comments_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 7. Ajouter la clé étrangère pour operations.validator_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_validator_id_fkey'
    ) THEN
        ALTER TABLE public.operations 
        ADD CONSTRAINT operations_validator_id_fkey 
        FOREIGN KEY (validator_id) REFERENCES public.profiles(id);
    END IF;
END $$;
