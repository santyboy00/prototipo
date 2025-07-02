import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MessageCircle, 
  Search, 
  Plus,
  Users,
  Hash,
  Send,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/database';
import { ChatRoom, Message } from '../../types/database';

export default function ChatScreen() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();
  }, [user]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await databaseService.getChatRooms(user.id, user.role);
      if (data && !error) {
        setChatRooms(data);
        if (data.length > 0 && !selectedRoom) {
          setSelectedRoom(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await databaseService.getChatMessages(roomId);
      if (data && !error) {
        setMessages(data.reverse());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    try {
      const messageData = {
        chat_room_id: selectedRoom.id,
        user_id: user.id,
        content: newMessage.trim(),
        message_type: 'text' as const,
      };

      const { data, error } = await databaseService.sendMessage(messageData);
      if (data && !error) {
        setMessages(prev => [...prev, { ...data, user }]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    if (selectedRoom) {
      await loadMessages(selectedRoom.id);
    }
    setRefreshing(false);
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ChatRoomItem = ({ room }: { room: ChatRoom }) => (
    <TouchableOpacity
      style={[
        styles.roomItem,
        selectedRoom?.id === room.id && styles.roomItemSelected
      ]}
      onPress={() => setSelectedRoom(room)}
    >
      <View style={styles.roomIcon}>
        {room.type === 'course' ? (
          <Hash size={20} color="#667eea" />
        ) : (
          <Users size={20} color="#10b981" />
        )}
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomType}>
          {room.type === 'course' ? 'Curso' : 'Especialidad'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const MessageItem = ({ message }: { message: Message }) => {
    const isOwnMessage = message.user_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Image
            source={{ 
              uri: message.user?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
            }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.messageSender}>
              {message.user?.full_name}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {new Date(message.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar chats..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredRooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomItem room={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderIcon}>
                  {selectedRoom.type === 'course' ? (
                    <Hash size={20} color="#667eea" />
                  ) : (
                    <Users size={20} color="#10b981" />
                  )}
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>{selectedRoom.name}</Text>
                  <Text style={styles.chatHeaderSubtitle}>
                    {selectedRoom.type === 'course' ? 'Curso' : 'Especialidad'}
                  </Text>
                </View>
              </View>

              {/* Messages */}
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem message={item} />}
                style={styles.messagesList}
                showsVerticalScrollIndicator={false}
              />

              {/* Message Input */}
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !newMessage.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.noChatSelected}>
              <MessageCircle size={64} color="#ccc" />
              <Text style={styles.noChatText}>
                Selecciona un chat para comenzar
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e1e1e1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
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
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomItemSelected: {
    backgroundColor: '#f0f4ff',
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  chatHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  ownMessageBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#999',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 16,
  },
});