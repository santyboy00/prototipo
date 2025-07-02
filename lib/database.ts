import { supabase } from './supabase';
import { User, Student, Teacher, Course, Enrollment, ChatRoom, Message, HelpRequest, HelpResponse } from '../types/database';

export const databaseService = {
  // User operations
  async createUserProfile(user: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    return { data, error };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Student operations
  async createStudentProfile(student: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    return { data, error };
  },

  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, users(*)')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getStudentsBySpecialty(specialty: string, semester: number) {
    const { data, error } = await supabase
      .from('students')
      .select('*, users(*)')
      .eq('specialty', specialty)
      .eq('semester', semester);
    return { data, error };
  },

  // Teacher operations
  async createTeacherProfile(teacher: Partial<Teacher>) {
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacher])
      .select()
      .single();
    return { data, error };
  },

  async getTeacherProfile(userId: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*, users(*)')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Course operations
  async createCourse(course: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single();
    return { data, error };
  },

  async getCoursesByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId);
    return { data, error };
  },

  async getCoursesBySpecialty(specialty: string, semester: number) {
    const { data, error } = await supabase
      .from('courses')
      .select('*, teachers(*, users(*))')
      .eq('specialty', specialty)
      .eq('semester', semester);
    return { data, error };
  },

  // Enrollment operations
  async enrollStudent(studentId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{ student_id: studentId, course_id: courseId }])
      .select()
      .single();
    return { data, error };
  },

  async getStudentEnrollments(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*, teachers(*, users(*)))')
      .eq('student_id', studentId);
    return { data, error };
  },

  async getCourseEnrollments(courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, students(*, users(*))')
      .eq('course_id', courseId);
    return { data, error };
  },

  // Chat operations
  async createChatRoom(chatRoom: Partial<ChatRoom>) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert([chatRoom])
      .select()
      .single();
    return { data, error };
  },

  async getChatRooms(userId: string, userRole: string) {
    let query = supabase
      .from('chat_rooms')
      .select('*');

    if (userRole === 'student') {
      // Get chat rooms for student's specialty and courses
      const { data: student } = await this.getStudentProfile(userId);
      if (student) {
        query = query.or(`specialty.eq.${student.specialty},course_id.in.(${student.enrollments?.map((e: any) => e.course_id).join(',')})`);
      }
    }

    const { data, error } = await query;
    return { data, error };
  },

  async sendMessage(message: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    return { data, error };
  },

  async getChatMessages(chatRoomId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, users(*)')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Help request operations
  async createHelpRequest(helpRequest: Partial<HelpRequest>) {
    const { data, error } = await supabase
      .from('help_requests')
      .insert([helpRequest])
      .select()
      .single();
    return { data, error };
  },

  async getHelpRequests(filters?: { specialty?: string; semester?: number; status?: string }) {
    let query = supabase
      .from('help_requests')
      .select('*, students(*, users(*)), courses(*)');

    if (filters?.specialty) {
      query = query.eq('specialty', filters.specialty);
    }
    if (filters?.semester) {
      query = query.eq('semester', filters.semester);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async addHelpResponse(response: Partial<HelpResponse>) {
    const { data, error } = await supabase
      .from('help_responses')
      .insert([response])
      .select()
      .single();
    return { data, error };
  },

  async getHelpResponses(helpRequestId: string) {
    const { data, error } = await supabase
      .from('help_responses')
      .select('*, users(*)')
      .eq('help_request_id', helpRequestId)
      .order('created_at', { ascending: true });
    return { data, error };
  },
};