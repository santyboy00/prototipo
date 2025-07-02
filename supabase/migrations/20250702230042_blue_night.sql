/*
  # Create chat rooms table

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (enum: course, specialty, general)
      - `course_id` (uuid, optional foreign key)
      - `specialty` (text, optional)
      - `semester` (integer, optional)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `chat_rooms` table
    - Add policies based on room type and user access
*/

-- Create enum for chat room types
CREATE TYPE chat_room_type AS ENUM ('course', 'specialty', 'general');

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type chat_room_type NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  specialty text,
  semester integer CHECK (semester >= 1 AND semester <= 10),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read chat rooms they have access to"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    -- Course chat rooms: enrolled students or course teacher
    (type = 'course' AND (
      EXISTS (
        SELECT 1 FROM enrollments 
        WHERE enrollments.course_id = chat_rooms.course_id 
        AND enrollments.student_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = chat_rooms.course_id 
        AND courses.teacher_id = auth.uid()
      )
    )) OR
    -- Specialty chat rooms: students in same specialty/semester
    (type = 'specialty' AND 
      EXISTS (
        SELECT 1 FROM students 
        WHERE students.id = auth.uid() 
        AND students.specialty = chat_rooms.specialty
        AND students.semester = chat_rooms.semester
      )
    ) OR
    -- General chat rooms: all authenticated users
    (type = 'general')
  );

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();