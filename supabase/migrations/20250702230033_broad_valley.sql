/*
  # Create courses table

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `description` (text)
      - `semester` (integer)
      - `specialty` (text)
      - `teacher_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `courses` table
    - Add policies for teachers to manage their courses
    - Add policies for students to read courses in their specialty/semester
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 10),
  specialty text NOT NULL,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can manage their courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can read courses in their specialty"
  ON courses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = auth.uid() 
      AND students.specialty = courses.specialty
      AND students.semester = courses.semester
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();