-- Attribution du rôle administrateur
-- À exécuter dans le SQL Editor du dashboard Supabase APRÈS avoir créé le compte
-- (Authentication > Users > Add user, avec "Auto Confirm User" activé).
--
-- L'email est stocké dans auth.users : la table profiles ne contient ni email,
-- ni first_name/last_name (uniquement full_name).

UPDATE public.profiles p
SET
  role = 'administrateur',
  full_name = 'Quentin DAVAKAN',
  phone = '+2290195153177',
  updated_at = NOW()
FROM auth.users u
WHERE u.id = p.id
  AND u.email = 'yekpondafe@gmail.com';

-- Filet de sécurité : si le trigger on_auth_user_created n'existait pas encore
-- lors de la création du compte, le profil est créé ici.
INSERT INTO public.profiles (id, full_name, phone, role)
SELECT u.id, 'Quentin DAVAKAN', '+2290195153177', 'administrateur'
FROM auth.users u
WHERE u.email = 'yekpondafe@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT u.email, p.role, p.full_name, p.phone
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'yekpondafe@gmail.com';
