import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/database';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    courses: 0,
    messages: 0,
    helpRequests: 0,
    students: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      if (user.role === 'student') {
        const { data: enrollments } = await databaseService.getStudentEnrollments(user.id);
        setStats(prev => ({ ...prev, courses: enrollments?.length || 0 }));
      } else {
        const { data: courses } = await databaseService.getCoursesByTeacher(user.id);
        setStats(prev => ({ ...prev, courses: courses?.length || 0 }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const QuickAction = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Icon size={24} color="#667eea" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Image
              source={{ 
                uri: user?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>
                ¡Hola, {user?.full_name?.split(' ')[0]}!
              </Text>
              <Text style={styles.role}>
                {user?.role === 'student' ? 'Estudiante' : 'Maestro'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={BookOpen}
            title="Cursos"
            value={stats.courses}
            color="#667eea"
          />
          <StatCard
            icon={MessageSquare}
            title="Mensajes"
            value={stats.messages}
            color="#10b981"
          />
          <StatCard
            icon={Users}
            title={user?.role === 'student' ? 'Compañeros' : 'Estudiantes'}
            value={stats.students}
            color="#f59e0b"
          />
          <StatCard
            icon={TrendingUp}
            title="Ayudas"
            value={stats.helpRequests}
            color="#ef4444"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        {user?.role === 'student' ? (
          <>
            <QuickAction
              icon={BookOpen}
              title="Mis Cursos"
              subtitle="Ver cursos inscritos"
              onPress={() => {}}
            />
            <QuickAction
              icon={MessageSquare}
              title="Chat Grupal"
              subtitle="Conectar con compañeros"
              onPress={() => {}}
            />
            <QuickAction
              icon={HelpCircle}
              title="Solicitar Ayuda"
              subtitle="Obtener apoyo académico"
              onPress={() => {}}
            />
          </>
        ) : (
          <>
            <QuickAction
              icon={Users}
              title="Mis Estudiantes"
              subtitle="Gestionar estudiantes"
              onPress={() => {}}
            />
            <QuickAction
              icon={BookOpen}
              title="Mis Cursos"
              subtitle="Administrar cursos"
              onPress={() => {}}
            />
            <QuickAction
              icon={MessageSquare}
              title="Comunicación"
              subtitle="Chat con estudiantes"
              onPress={() => {}}
            />
          </>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        <View style={styles.activityCard}>
          <Calendar size={20} color="#667eea" />
          <Text style={styles.activityText}>
            No hay actividad reciente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  role: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  activityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
});