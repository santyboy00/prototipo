import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, GraduationCap, Building, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/database';

const SPECIALTIES = [
  'Ingeniería en Sistemas',
  'Ingeniería Industrial',
  'Administración de Empresas',
  'Contaduría Pública',
  'Derecho',
  'Medicina',
  'Psicología',
  'Arquitectura',
];

const DEPARTMENTS = [
  'Ciencias de la Computación',
  'Ingeniería',
  'Administración',
  'Ciencias Sociales',
  'Ciencias de la Salud',
  'Humanidades',
];

export default function RegisterScreen() {
  const { role } = useLocalSearchParams<{ role: 'student' | 'teacher' }>();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    teacherId: '',
    semester: '',
    specialty: '',
    department: '',
    enrollmentYear: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (role === 'student' && (!formData.studentId || !formData.semester || !formData.specialty)) {
      Alert.alert('Error', 'Por favor completa todos los campos de estudiante');
      return;
    }

    if (role === 'teacher' && (!formData.teacherId || !formData.department)) {
      Alert.alert('Error', 'Por favor completa todos los campos de maestro');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        full_name: formData.fullName,
        role: role,
      };

      const { error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Create role-specific profile
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        if (role === 'student') {
          await databaseService.createStudentProfile({
            id: currentUser.id,
            student_id: formData.studentId,
            semester: parseInt(formData.semester),
            specialty: formData.specialty,
            enrollment_year: parseInt(formData.enrollmentYear) || new Date().getFullYear(),
          });
        } else {
          await databaseService.createTeacherProfile({
            id: currentUser.id,
            teacher_id: formData.teacherId,
            department: formData.department,
            specialties: [formData.specialty].filter(Boolean),
          });
        }
      }

      Alert.alert('Éxito', 'Cuenta creada exitosamente', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.logo}
            />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Registro como {role === 'student' ? 'Estudiante' : 'Maestro'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Common fields */}
            <View style={styles.inputContainer}>
              <User color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#666"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#666" size={20} />
                ) : (
                  <Eye color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#666" size={20} />
                ) : (
                  <Eye color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Role-specific fields */}
            {role === 'student' ? (
              <>
                <View style={styles.inputContainer}>
                  <GraduationCap color="#666" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Matrícula"
                    placeholderTextColor="#666"
                    value={formData.studentId}
                    onChangeText={(value) => updateFormData('studentId', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Semestre (1-10)"
                    placeholderTextColor="#666"
                    value={formData.semester}
                    onChangeText={(value) => updateFormData('semester', value)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Especialidad"
                    placeholderTextColor="#666"
                    value={formData.specialty}
                    onChangeText={(value) => updateFormData('specialty', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Año de ingreso"
                    placeholderTextColor="#666"
                    value={formData.enrollmentYear}
                    onChangeText={(value) => updateFormData('enrollmentYear', value)}
                    keyboardType="numeric"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Building color="#666" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ID de empleado"
                    placeholderTextColor="#666"
                    value={formData.teacherId}
                    onChangeText={(value) => updateFormData('teacherId', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Departamento"
                    placeholderTextColor="#666"
                    value={formData.department}
                    onChangeText={(value) => updateFormData('department', value)}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
});