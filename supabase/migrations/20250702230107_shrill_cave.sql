/*
  # Create help responses table

  1. New Tables
    - `help_responses`
      - `id` (uuid, primary key)
      - `help_request_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `is_solution` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `help_responses` table
    - Add policies for authenticated users
*/

-- Create help_responses table
CREATE TABLE IF NOT EXISTS help_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id uuid NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE help_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read help responses"
  ON help_responses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create help responses"
  ON help_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their help responses"
  ON help_responses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS help_responses_request_created_at_idx 
ON help_responses(help_request_id, created_at ASC);