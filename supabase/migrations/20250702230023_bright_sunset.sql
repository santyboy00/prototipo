/*
  # Create students table

  1. New Tables
    - `students`
      - `id` (uuid, foreign key to users)
      - `student_id` (text, unique student identifier)
      - `semester` (integer, 1-10)
      - `specialty` (text)
      - `enrollment_year` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `students` table
    - Add policies for students to read their own data
    - Add policies for teachers to read student data
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 10),
  specialty text NOT NULL,
  enrollment_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can read student data"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();