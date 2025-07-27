import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Send, Paperclip, Camera, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  messageType: 'text' | 'image' | 'location';
  createdAt: string;
  read: boolean;
}

interface RealTimeChatProps {
  chatRoomId: string;
  rideId: string;
  onMessageSent?: (message: Message) => void;
}

export default function RealTimeChat({ chatRoomId, rideId, onMessageSent }: RealTimeChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // TODO: Replace with real tRPC hooks when routes are implemented
  const chatMessages: Message[] = [
    {
      id: '1',
      content: 'Hello! I\'m your driver.',
      senderId: 'driver-1',
      sender: {
        id: 'driver-1',
        name: 'John Driver',
        avatar: 'https://via.placeholder.com/32',
      },
      messageType: 'text',
      createdAt: new Date().toISOString(),
      read: true,
    },
  ];

  const sendMessageMutation = {
    mutateAsync: async (data: any) => {
      console.log('Would send message:', data);
      return {
        id: `msg-${Date.now()}`,
        chatRoomId: data.chatRoomId,
        senderId: user?.id,
        content: data.content,
        messageType: data.messageType,
        createdAt: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          name: user?.name || '',
          avatar: user?.avatar || '',
        },
        read: false,
      };
    }
  };

  const markAsReadMutation = {
    mutate: async (data: any) => {
      console.log('Would mark messages as read:', data);
    }
  };

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Mark messages as read when component mounts
    if (chatRoomId) {
      markAsReadMutation.mutate({ chatRoomId });
    }

    return () => {
      // Cleanup WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatRoomId]);

  const initializeWebSocket = () => {
    try {
      const token = useAuthStore.getState().jwt;
      if (!token) return;

      const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000'}/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        // Subscribe to chat room
        ws.send(JSON.stringify({
          type: 'subscribe_chat',
          chatRoomId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat' && data.data.chatRoomId === chatRoomId) {
            handleNewMessage(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        Alert.alert('Connection Error', 'Chat connection lost. Trying to reconnect...');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          initializeWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Mark as read if user is not the sender
    if (message.senderId !== user?.id) {
      markAsReadMutation.mutate({ chatRoomId });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      const result = await sendMessageMutation.mutateAsync({
        chatRoomId,
        content: newMessage.trim(),
        messageType: 'text',
      });

      setNewMessage('');
      onMessageSent?.(result as Message);

      // Send via WebSocket for real-time delivery
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat',
          chatRoomId,
          data: {
            content: newMessage.trim(),
            messageType: 'text',
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLocation = async () => {
    try {
      // TODO: Implement real location sharing when expo-location is available
      Alert.alert('Location Sharing', 'Location sharing feature will be available soon!');
      
      // For now, just send a mock location message
      const locationMessage = `📍 My location: 40.7128, -74.0060`;
      
      await sendMessageMutation.mutateAsync({
        chatRoomId,
        content: locationMessage,
        messageType: 'location',
      });

      // Send via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat',
          chatRoomId,
          data: {
            content: locationMessage,
            messageType: 'location',
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share location. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;
    const messageTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Image
            source={{ uri: item.sender.avatar || 'https://via.placeholder.com/32' }}
            style={styles.avatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          
          {item.messageType === 'location' ? (
            <View style={styles.locationMessage}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {item.content}
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.gray[400]}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSendLocation}
              disabled={isSending}
            >
              <MapPin size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {/* TODO: Add image picker */}}
              disabled={isSending}
            >
              <Camera size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || isSending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: colors.text,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: colors.gray[500],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[400],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
}); 