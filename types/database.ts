export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  student_id: string;
  semester: number;
  specialty: string;
  enrollment_year: number;
}

export interface Teacher extends User {
  teacher_id: string;
  department: string;
  specialties: string[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  semester: number;
  specialty: string;
  teacher_id: string;
  teacher?: Teacher;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  student?: Student;
  course?: Course;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'course' | 'specialty' | 'general';
  course_id?: string;
  specialty?: string;
  semester?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  user?: User;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  course_id?: string;
  student_id: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  student?: Student;
  course?: Course;
}

export interface HelpResponse {
  id: string;
  help_request_id: string;
  user_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  user?: User;
}