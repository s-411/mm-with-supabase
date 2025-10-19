-- Seed default nirvana milestones and personal records for each user
-- This function will be called when a new user signs up

-- Function to seed default milestones for a user
CREATE OR REPLACE FUNCTION seed_nirvana_defaults_for_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert default milestones
  INSERT INTO nirvana_milestones (user_id, title, description, category, difficulty, completed, target_value, unit, order_index)
  VALUES
    -- Beginner Handstands
    (p_user_id, 'Wall Handstand 10s', 'Hold a wall-supported handstand for 10 seconds', 'handstand', 'beginner', false, 10, 'seconds', 1),
    (p_user_id, 'Wall Handstand 30s', 'Hold a wall-supported handstand for 30 seconds', 'handstand', 'beginner', false, 30, 'seconds', 2),
    (p_user_id, 'Wall Handstand 60s', 'Hold a wall-supported handstand for 60 seconds', 'handstand', 'beginner', false, 60, 'seconds', 3),

    -- Intermediate Handstands
    (p_user_id, 'Freestanding 5s', 'Hold a freestanding handstand for 5 seconds', 'handstand', 'intermediate', false, 5, 'seconds', 4),
    (p_user_id, 'Freestanding 10s', 'Hold a freestanding handstand for 10 seconds', 'handstand', 'intermediate', false, 10, 'seconds', 5),
    (p_user_id, 'Freestanding 30s', 'Hold a freestanding handstand for 30 seconds', 'handstand', 'intermediate', false, 30, 'seconds', 6),

    -- Press Handstand Progression
    (p_user_id, 'Pike Compression 5s', 'Lift feet off ground in pike position for 5 seconds', 'strength', 'intermediate', false, 5, 'seconds', 7),
    (p_user_id, 'Pike Compression 10s', 'Lift feet off ground in pike position for 10 seconds', 'strength', 'intermediate', false, 10, 'seconds', 8),
    (p_user_id, 'Press Negative', 'Controlled lowering from handstand to pike position', 'strength', 'intermediate', false, NULL, NULL, 9),

    -- Advanced Press Handstand
    (p_user_id, 'Assisted Press Handstand', 'Press to handstand with minimal assistance', 'handstand', 'advanced', false, NULL, NULL, 10),
    (p_user_id, 'Full Press Handstand', 'Unassisted press from pike to handstand', 'handstand', 'advanced', false, NULL, NULL, 11),
    (p_user_id, 'Straddle Press Handstand', 'Press to handstand with legs in straddle position', 'handstand', 'advanced', false, NULL, NULL, 12),

    -- Balance
    (p_user_id, 'One-Arm Handstand', 'Balance on one arm in handstand position', 'balance', 'advanced', false, NULL, NULL, 13);

  -- Insert default personal records
  INSERT INTO nirvana_personal_records (user_id, name, category, value, unit, notes)
  VALUES
    (p_user_id, 'Longest Handstand Hold', 'handstand', 0, 'seconds', 'Freestanding handstand'),
    (p_user_id, 'Longest Wall Handstand', 'handstand', 0, 'seconds', 'Wall-supported handstand'),
    (p_user_id, 'Pike Compression Hold', 'strength', 0, 'seconds', 'Feet lifted in pike position'),
    (p_user_id, 'Handstand Push-ups', 'strength', 0, 'reps', 'Maximum consecutive reps'),
    (p_user_id, 'L-sit Hold', 'strength', 0, 'seconds', 'Legs parallel to ground'),
    (p_user_id, 'Forward Fold Depth', 'flexibility', 0, 'cm', 'Distance from chest to legs'),
    (p_user_id, 'Side Splits Width', 'flexibility', 0, 'cm', 'Distance from hip to ground'),
    (p_user_id, 'Back Bend Hold', 'flexibility', 0, 'seconds', 'Bridge position hold time');
END;
$$ LANGUAGE plpgsql;

-- Seed default data for existing users who don't have any milestones yet
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT DISTINCT id FROM user_profiles
    WHERE id NOT IN (SELECT DISTINCT user_id FROM nirvana_milestones)
  LOOP
    PERFORM seed_nirvana_defaults_for_user(user_record.id);
  END LOOP;
END $$;

-- Create trigger to automatically seed defaults for new users
CREATE OR REPLACE FUNCTION trigger_seed_nirvana_defaults()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_nirvana_defaults_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seed_nirvana_defaults_on_user_creation ON user_profiles;
CREATE TRIGGER seed_nirvana_defaults_on_user_creation
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_nirvana_defaults();
