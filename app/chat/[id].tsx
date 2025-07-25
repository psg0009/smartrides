import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Message } from '@/types';
import { mockChatRooms, mockMessages } from '@/mocks/data';
import { useAuthStore } from '@/store/auth-store';
import ChatBubble from '@/components/ChatBubble';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [chatRoom, setChatRoom] = useState(mockChatRooms.find(room => room.id === id));
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    if (!chatRoom) {
      router.back();
      return;
    }
    
    // In a real app, you would fetch messages from an API
    setMessages(mockMessages);
  }, [chatRoom]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: user,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  if (!chatRoom) {
    return null;
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: chatRoom.rideId.includes('carpool') ? 'Carpool Chat' : 'Ride Chat',
          headerRight: () => (
            <View style={styles.headerRight}>
              {chatRoom.participants.slice(0, 2).map((participant, index) => (
                <Image 
                  key={participant.id}
                  source={{ uri: participant.avatar }}
                  style={[
                    styles.headerAvatar,
                    { marginLeft: index > 0 ? -10 : 0 }
                  ]}
                />
              ))}
              {chatRoom.participants.length > 2 && (
                <View style={styles.headerAvatarMore}>
                  <Text style={styles.headerAvatarMoreText}>
                    +{chatRoom.participants.length - 2}
                  </Text>
                </View>
              )}
            </View>
          ),
        }} 
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.gray[400]}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.disabledSendButton
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
          activeOpacity={0.7}
        >
          <Send size={20} color={!newMessage.trim() ? colors.gray[400] : colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerAvatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerAvatarMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  disabledSendButton: {
    backgroundColor: colors.gray[200],
  },
});