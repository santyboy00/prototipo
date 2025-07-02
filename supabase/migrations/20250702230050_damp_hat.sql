/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `chat_room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `message_type` (enum: text, image, file)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policies based on chat room access
*/

-- Create enum for message types
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read messages in accessible chat rooms"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id
      AND (
        -- Course chat rooms: enrolled students or course teacher
        (chat_rooms.type = 'course' AND (
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
        (chat_rooms.type = 'specialty' AND 
          EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.specialty = chat_rooms.specialty
            AND students.semester = chat_rooms.semester
          )
        ) OR
        -- General chat rooms: all authenticated users
        (chat_rooms.type = 'general')
      )
    )
  );

CREATE POLICY "Users can send messages to accessible chat rooms"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = messages.chat_room_id
      AND (
        -- Course chat rooms: enrolled students or course teacher
        (chat_rooms.type = 'course' AND (
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
        (chat_rooms.type = 'specialty' AND 
          EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.specialty = chat_rooms.specialty
            AND students.semester = chat_rooms.semester
          )
        ) OR
        -- General chat rooms: all authenticated users
        (chat_rooms.type = 'general')
      )
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS messages_chat_room_created_at_idx 
ON messages(chat_room_id, created_at DESC);