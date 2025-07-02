import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, GraduationCap, Building, Settings, Bell, Shield, LogOut, CreditCard as Edit3, Save, X } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = async () => {
    try {
      const { error } = await updateProfile(editedProfile);
      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      } else {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ 
    icon: Icon, 
    label, 
    value, 
    onPress, 
    showChevron = false,
    isSwitch = false,
    switchValue,
    onSwitchChange,
  }: any) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <Icon size={20} color="#667eea" />
        </View>
        <Text style={styles.profileItemLabel}>{label}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#e1e1e1', true: '#667eea' }}
            thumbColor="#fff"
          />
        ) : (
          <>
            <Text style={styles.profileItemValue}>{value}</Text>
            {showChevron && <Text style={styles.chevron}>›</Text>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image
            source={{ 
              uri: user?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'student' ? 'Estudiante' : 'Maestro'}
          </Text>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <X size={20} color="#fff" />
            ) : (
              <Edit3 size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Profile Information */}
        <ProfileSection title="Información Personal">
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <User size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Mail size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={editedProfile.email}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Save size={16} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedProfile({
                      full_name: user?.full_name || '',
                      email: user?.email || '',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <ProfileItem
                icon={User}
                label="Nombre completo"
                value={user?.full_name}
              />
              <ProfileItem
                icon={Mail}
                label="Correo electrónico"
                value={user?.email}
              />
              {user?.role === 'student' ? (
                <ProfileItem
                  icon={GraduationCap}
                  label="Rol"
                  value="Estudiante"
                />
              ) : (
                <ProfileItem
                  icon={Building}
                  label="Rol"
                  value="Maestro"
                />
              )}
            </>
          )}
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Configuración">
          <ProfileItem
            icon={Bell}
            label="Notificaciones"
            isSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <ProfileItem
            icon={Shield}
            label="Modo oscuro"
            isSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <ProfileItem
            icon={Settings}
            label="Configuración avanzada"
            value=""
            showChevron
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Account Actions */}
        <ProfileSection title="Cuenta">
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ProfileSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>EduConnect v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 EduConnect</Text>
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
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    opacity: 0.9,
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: -120,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
  },
  editForm: {
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
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  appInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginBottom: 4,
  },
});