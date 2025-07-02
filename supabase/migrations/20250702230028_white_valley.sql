/*
  # Create teachers table

  1. New Tables
    - `teachers`
      - `id` (uuid, foreign key to users)
      - `teacher_id` (text, unique teacher identifier)
      - `department` (text)
      - `specialties` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `teachers` table
    - Add policies for teachers to read their own data
    - Add policies for students to read teacher data
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  teacher_id text UNIQUE NOT NULL,
  department text NOT NULL,
  specialties text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can read own data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update own data"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can read teacher data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'student'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();