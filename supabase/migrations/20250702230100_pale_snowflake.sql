/*
  # Create help requests table

  1. New Tables
    - `help_requests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `subject` (text)
      - `course_id` (uuid, optional foreign key)
      - `student_id` (uuid, foreign key)
      - `status` (enum: open, in_progress, resolved)
      - `priority` (enum: low, medium, high)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `help_requests` table
    - Add policies for students and teachers
*/

-- Create enums
CREATE TYPE help_request_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE help_request_priority AS ENUM ('low', 'medium', 'high');

-- Create help_requests table
CREATE TABLE IF NOT EXISTS help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  subject text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status help_request_status DEFAULT 'open',
  priority help_request_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can read all help requests"
  ON help_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'student'
    )
  );

CREATE POLICY "Teachers can read all help requests"
  ON help_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Students can create help requests"
  ON help_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their help requests"
  ON help_requests
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();