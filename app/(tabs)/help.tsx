import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleHelp as HelpCircle, Plus, Search, Filter, MessageSquare, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, X } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/database';
import { HelpRequest, HelpResponse } from '../../types/database';

export default function HelpScreen() {
  const { user } = useAuth();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [responses, setResponses] = useState<HelpResponse[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [newResponse, setNewResponse] = useState('');

  useEffect(() => {
    loadHelpRequests();
  }, [filterStatus]);

  const loadHelpRequests = async () => {
    try {
      const filters: any = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const { data, error } = await databaseService.getHelpRequests(filters);
      if (data && !error) {
        setHelpRequests(data);
      }
    } catch (error) {
      console.error('Error loading help requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (requestId: string) => {
    try {
      const { data, error } = await databaseService.getHelpResponses(requestId);
      if (data && !error) {
        setResponses(data);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const createHelpRequest = async () => {
    if (!newRequest.title || !newRequest.description || !user) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const requestData = {
        ...newRequest,
        student_id: user.id,
        status: 'open' as const,
      };

      const { data, error } = await databaseService.createHelpRequest(requestData);
      if (data && !error) {
        setHelpRequests(prev => [data, ...prev]);
        setNewRequest({
          title: '',
          description: '',
          subject: '',
          priority: 'medium',
        });
        setShowCreateModal(false);
        Alert.alert('Éxito', 'Solicitud de ayuda creada');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la solicitud');
    }
  };

  const addResponse = async () => {
    if (!newResponse.trim() || !selectedRequest || !user) return;

    try {
      const responseData = {
        help_request_id: selectedRequest.id,
        user_id: user.id,
        content: newResponse.trim(),
        is_solution: false,
      };

      const { data, error } = await databaseService.addHelpResponse(responseData);
      if (data && !error) {
        setResponses(prev => [...prev, { ...data, user }]);
        setNewResponse('');
      }
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHelpRequests();
    setRefreshing(false);
  };

  const openRequestDetail = async (request: HelpRequest) => {
    setSelectedRequest(request);
    await loadResponses(request.id);
    setShowDetailModal(true);
  };

  const filteredRequests = helpRequests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Abierta';
      case 'in_progress': return 'En progreso';
      case 'resolved': return 'Resuelta';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const HelpRequestItem = ({ request }: { request: HelpRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => openRequestDetail(request)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{request.title}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.requestSubject}>{request.subject}</Text>
      <Text style={styles.requestDescription} numberOfLines={2}>
        {request.description}
      </Text>
      
      <View style={styles.requestFooter}>
        <View style={styles.requestMeta}>
          <View style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(request.priority) }
          ]} />
          <Text style={styles.requestAuthor}>
            {request.student?.full_name}
          </Text>
        </View>
        <Text style={styles.requestTime}>
          {new Date(request.created_at).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ResponseItem = ({ response }: { response: HelpResponse }) => (
    <View style={styles.responseCard}>
      <View style={styles.responseHeader}>
        <Text style={styles.responseAuthor}>
          {response.user?.full_name}
        </Text>
        <Text style={styles.responseTime}>
          {new Date(response.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <Text style={styles.responseContent}>{response.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
        {user?.role === 'student' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ayuda..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statusFilters}>
          {['all', 'open', 'in_progress', 'resolved'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'Todas' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Help Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HelpRequestItem request={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Create Request Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Solicitud de Ayuda</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Título de la solicitud"
              value={newRequest.title}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Materia o tema"
              value={newRequest.subject}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, subject: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu problema o duda..."
              value={newRequest.description}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Prioridad:</Text>
            <View style={styles.priorityContainer}>
              {['low', 'medium', 'high'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    newRequest.priority === priority && styles.priorityButtonActive,
                    { borderColor: getPriorityColor(priority) }
                  ]}
                  onPress={() => setNewRequest(prev => ({ ...prev, priority: priority as any }))}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    newRequest.priority === priority && { color: getPriorityColor(priority) }
                  ]}>
                    {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={createHelpRequest}
            >
              <Text style={styles.createButtonText}>Crear Solicitud</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedRequest?.title}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedRequest && (
            <View style={styles.modalContent}>
              <View style={styles.requestDetailHeader}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(selectedRequest.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(selectedRequest.status)}
                  </Text>
                </View>
                <Text style={styles.requestDetailSubject}>
                  {selectedRequest.subject}
                </Text>
              </View>

              <Text style={styles.requestDetailDescription}>
                {selectedRequest.description}
              </Text>

              <Text style={styles.responsesTitle}>
                Respuestas ({responses.length})
              </Text>

              <FlatList
                data={responses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ResponseItem response={item} />}
                style={styles.responsesList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.responseInputContainer}>
                <TextInput
                  style={styles.responseInput}
                  placeholder="Escribe una respuesta..."
                  value={newResponse}
                  onChangeText={setNewResponse}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendResponseButton,
                    !newResponse.trim() && styles.sendResponseButtonDisabled
                  ]}
                  onPress={addResponse}
                  disabled={!newResponse.trim()}
                >
                  <MessageSquare size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  requestSubject: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  requestAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  requestTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  requestDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestDetailSubject: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginLeft: 12,
  },
  requestDetailDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  responsesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  responsesList: {
    flex: 1,
    marginBottom: 16,
  },
  responseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  responseTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  responseContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 22,
  },
  responseInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  responseInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  sendResponseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendResponseButtonDisabled: {
    opacity: 0.5,
  },
});