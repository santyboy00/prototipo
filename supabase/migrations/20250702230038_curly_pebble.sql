/*
  # Create enrollments table

  1. New Tables
    - `enrollments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `course_id` (uuid, foreign key)
      - `enrolled_at` (timestamp)

  2. Security
    - Enable RLS on `enrollments` table
    - Add policies for students to read their enrollments
    - Add policies for teachers to read enrollments in their courses
*/

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can read their enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can read enrollments in their courses"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = enrollments.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can enroll in courses"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());