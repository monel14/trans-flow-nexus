-- Migration pour corriger les comptes de démonstration
-- Active les comptes non confirmés pour le développement

-- Fonction pour confirmer automatiquement les comptes de test
CREATE OR REPLACE FUNCTION confirm_demo_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_emails text[] := ARRAY[
        'admin@transflow.com',
        'sousadmin@transflow.com', 
        'chef@transflow.com',
        'agent@transflow.com',
        'dev@transflow.com'
    ];
    email_addr text;
BEGIN
    -- Confirmer tous les comptes de démonstration
    FOREACH email_addr IN ARRAY demo_emails
    LOOP
        -- Mettre à jour le statut email_confirmed pour ces comptes
        UPDATE auth.users 
        SET email_confirmed_at = now(),
            confirmed_at = now()
        WHERE email = email_addr 
        AND email_confirmed_at IS NULL;
        
        RAISE NOTICE 'Email confirmé pour: %', email_addr;
    END LOOP;
END;
$$;

-- Exécuter la fonction
SELECT confirm_demo_accounts();

-- Supprimer la fonction temporaire
DROP FUNCTION confirm_demo_accounts();