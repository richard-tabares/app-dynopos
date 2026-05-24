-- ============================================
-- FIX: Perfiles de cajeros corruptos por UPDATE
-- incorrecto en migración anterior
-- 
-- Problema: La migración 20260524163800 ejecutó
--   UPDATE profiles SET id = business_id
-- lo que sobrescribió el PK (id) de perfiles de
-- cajeros con el ID del admin, perdiendo el
-- verdadero auth.users.id del cajero.
--
-- Fix: Para cada perfil corrupto (role='cajero'
-- e id=business_id), busca el auth.users.id
-- correcto examinando usuarios cuyo id NO aparece
-- como business_id en ningún perfil.
-- ============================================

-- Primero, verificamos si hay perfiles corruptos
DO $$
DECLARE
    corrupted_count INTEGER;
    fixed_count INTEGER := 0;
    rec RECORD;
    match_id UUID;
BEGIN
    SELECT COUNT(*) INTO corrupted_count
    FROM profiles
    WHERE role = 'cajero' AND id = business_id;

    IF corrupted_count = 0 THEN
        RAISE NOTICE 'No se encontraron perfiles de cajeros corruptos. Todo correcto.';
        RETURN;
    END IF;

    RAISE WARNING 'Se encontraron % perfil(es) de cajero(s) corrupto(s) (id = business_id). Intentando reparar...', corrupted_count;

    FOR rec IN
        SELECT id AS current_id, business_id, display_name, created_at
        FROM profiles
        WHERE role = 'cajero' AND id = business_id
        FOR UPDATE
    LOOP
        -- Buscar un auth.user cuyo id:
        -- 1. NO sea business_id de ningún perfil (no es admin)
        -- 2. NO sea id de ningún perfil (no tiene perfil aún)
        -- 3. Esté en el mismo negocio (approximado por created_at)
        SELECT au.id INTO match_id
        FROM auth.users au
        WHERE au.id NOT IN (SELECT business_id FROM profiles)
          AND au.id NOT IN (SELECT id FROM profiles)
          AND au.created_at::date = rec.created_at
        LIMIT 1;

        IF match_id IS NOT NULL THEN
            UPDATE profiles
            SET id = match_id
            WHERE id = rec.current_id AND business_id = rec.business_id;
            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Reparado perfil de cajero: nuevo id=% (business_id=%)', match_id, rec.business_id;
        ELSE
            RAISE WARNING 'No se pudo reparar perfil de cajero: display_name="%", business_id=% - Recrea el usuario manualmente', rec.display_name, rec.business_id;
        END IF;
    END LOOP;

    RAISE NOTICE 'Reparación completada: % de % perfil(es) corregido(s).', fixed_count, corrupted_count;

    IF fixed_count < corrupted_count THEN
        RAISE WARNING '% perfil(es) requieren intervención manual. Ve a Settings > Usuarios y recrea los cajeros afectados.', corrupted_count - fixed_count;
    END IF;
END;
$$;

-- Verificar que ningún perfil tenga id = business_id incorrectamente
DO $$
DECLARE
    remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining
    FROM profiles
    WHERE role = 'cajero' AND id = business_id;

    IF remaining > 0 THEN
        RAISE WARNING 'Aún quedan % perfil(es) de cajero(s) con id = business_id. Se necesita intervención manual.', remaining;
    ELSE
        RAISE NOTICE 'Todos los perfiles de cajeros están correctos.';
    END IF;
END;
$$;
