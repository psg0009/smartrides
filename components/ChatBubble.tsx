import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { user } = useAuthStore();
  const isCurrentUser = user?.id === message.sender.id;
  
  const messageTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      {!isCurrentUser && (
        <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />
      )}
      
      <View style={[
        styles.bubbleContainer,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        
        <Text style={styles.messageText}>{message.content}</Text>
        
        <Text style={styles.timestamp}>{messageTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  bubbleContainer: {
    borderRadius: 16,
    padding: 12,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
  },
  otherUserBubble: {
    backgroundColor: colors.gray[100],
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  timestamp: {
    fontSize: 10,
    color: colors.gray[500],
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});