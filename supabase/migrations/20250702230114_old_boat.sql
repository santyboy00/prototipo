/*
  # Create default chat rooms

  1. Default Chat Rooms
    - General chat room for all users
    - Specialty-based chat rooms for common specialties
    
  2. Sample Data
    - Creates initial chat rooms for testing
*/

-- Insert general chat room
INSERT INTO chat_rooms (name, type, created_by) 
SELECT 
  'Chat General',
  'general',
  id
FROM users 
WHERE role = 'teacher' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert specialty chat rooms for common specialties
DO $$
DECLARE
  specialty_name text;
  semester_num integer;
  creator_id uuid;
BEGIN
  -- Get a teacher to be the creator
  SELECT id INTO creator_id FROM users WHERE role = 'teacher' LIMIT 1;
  
  -- If no teacher exists, create a system user
  IF creator_id IS NULL THEN
    INSERT INTO users (email, full_name, role) 
    VALUES ('system@educonnect.com', 'Sistema EduConnect', 'teacher')
    RETURNING id INTO creator_id;
    
    INSERT INTO teachers (id, teacher_id, department) 
    VALUES (creator_id, 'SYS001', 'Sistema');
  END IF;

  -- Create specialty chat rooms for common specialties and semesters
  FOR specialty_name IN 
    SELECT DISTINCT unnest(ARRAY[
      'Ingeniería en Sistemas',
      'Ingeniería Industrial', 
      'Administración de Empresas',
      'Contaduría Pública',
      'Derecho',
      'Medicina',
      'Psicología',
      'Arquitectura'
    ])
  LOOP
    FOR semester_num IN 1..10 LOOP
      INSERT INTO chat_rooms (name, type, specialty, semester, created_by)
      VALUES (
        specialty_name || ' - Semestre ' || semester_num,
        'specialty',
        specialty_name,
        semester_num,
        creator_id
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;