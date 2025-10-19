-- Create a function to seed default nirvana session types for a user
CREATE OR REPLACE FUNCTION seed_default_nirvana_session_types(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only seed if user has no session types
  IF NOT EXISTS (SELECT 1 FROM nirvana_session_types WHERE user_id = p_user_id) THEN
    INSERT INTO nirvana_session_types (user_id, name, order_index) VALUES
      (p_user_id, 'Mobility: Shoulder, elbow, and wrist', 1),
      (p_user_id, 'Mobility: Spine', 2),
      (p_user_id, 'Mobility: hip, knee, and ankle', 3),
      (p_user_id, 'Beginner handstands', 4),
      (p_user_id, 'Handstands', 5),
      (p_user_id, 'Press handstand', 6),
      (p_user_id, 'Handstand push-up', 7),
      (p_user_id, 'Abs and glutes', 8),
      (p_user_id, 'Power yoga', 9),
      (p_user_id, 'Pilates', 10),
      (p_user_id, 'Back bends', 11),
      (p_user_id, 'Single leg squat', 12),
      (p_user_id, 'Side splits', 13),
      (p_user_id, 'Front splits', 14),
      (p_user_id, 'Yin yoga', 15);
  END IF;
END;
$$;

-- Create a trigger to automatically seed session types for new users
CREATE OR REPLACE FUNCTION trigger_seed_nirvana_session_types()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM seed_default_nirvana_session_types(NEW.id);
  RETURN NEW;
END;
$$;

-- Attach trigger to user_profiles table
DROP TRIGGER IF EXISTS on_user_created_seed_nirvana_session_types ON user_profiles;
CREATE TRIGGER on_user_created_seed_nirvana_session_types
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_nirvana_session_types();

-- Seed for existing users who don't have session types
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM user_profiles LOOP
    PERFORM seed_default_nirvana_session_types(user_record.id);
  END LOOP;
END $$;
