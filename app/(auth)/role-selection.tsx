import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, Users } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const handleRoleSelection = (role: 'student' | 'teacher') => {
    router.push({
      pathname: '/(auth)/register',
      params: { role },
    });
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.logo}
          />
          <Text style={styles.title}>¡Bienvenido a EduConnect!</Text>
          <Text style={styles.subtitle}>Selecciona tu rol para continuar</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('student')}
          >
            <View style={styles.roleIcon}>
              <GraduationCap color="#667eea" size={48} />
            </View>
            <Text style={styles.roleTitle}>Estudiante</Text>
            <Text style={styles.roleDescription}>
              Accede a tus cursos, chatea con compañeros y solicita ayuda académica
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('teacher')}
          >
            <View style={styles.roleIcon}>
              <Users color="#667eea" size={48} />
            </View>
            <Text style={styles.roleTitle}>Maestro</Text>
            <Text style={styles.roleDescription}>
              Gestiona tus cursos, interactúa con estudiantes y brinda apoyo académico
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  roleContainer: {
    gap: 20,
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    opacity: 0.9,
  },
});