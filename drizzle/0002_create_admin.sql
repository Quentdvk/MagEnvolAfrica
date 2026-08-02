-- Création du compte administrateur
-- À exécuter dans le SQL Editor du dashboard Supabase

-- 1. Créer l'utilisateur via l'API Supabase Auth (nécessite d'être fait via le dashboard ou API)
-- Email: yekpondafe@gmail.com
-- Mot de passe: 3NAtiposy@22

-- 2. Une fois l'utilisateur créé, exécuter ce SQL pour lui donner le rôle administrateur

-- Mettre à jour le profil de l'administrateur
UPDATE profiles 
SET 
  role = 'administrator',
  first_name = 'Quentin',
  last_name = 'DAVAKAN',
  phone = '+2290195153177',
  updated_at = NOW()
WHERE email = 'yekpondafe@gmail.com';

-- Vérification
SELECT id, email, role, first_name, last_name, phone 
FROM profiles 
WHERE email = 'yekpondafe@gmail.com';
