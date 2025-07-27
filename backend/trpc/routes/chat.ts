import { z } from 'zod';
import { protectedProcedure } from '../create-context';
import { prisma } from '../../prisma';

// Mock chat room data for now - will be replaced with real database models
const mockChatRooms = new Map();
const mockMessages = new Map();

// Create or get chat room for a ride
export const createChatRoom = protectedProcedure
  .input(z.object({
    rideId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    // Check if chat room already exists
    let chatRoom = mockChatRooms.get(input.rideId);
    
    if (!chatRoom) {
      // Create new chat room
      chatRoom = {
        id: `chat-${input.rideId}`,
        rideId: input.rideId,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockChatRooms.set(input.rideId, chatRoom);
      mockMessages.set(input.rideId, []);
    }

    // Add current user to chat room if not already a participant
    const existingParticipant = chatRoom.participants.find((p: any) => p.userId === userId);
    if (!existingParticipant) {
      chatRoom.participants.push({
        userId,
        joinedAt: new Date(),
        lastReadAt: new Date(),
      });
    }

    return chatRoom;
  });

// Get chat room messages
export const getChatMessages = protectedProcedure
  .input(z.object({
    chatRoomId: z.string(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    // Verify user is participant in chat room
    const chatRoom = mockChatRooms.get(input.chatRoomId);
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    const participant = chatRoom.participants.find((p: any) => p.userId === userId);
    if (!participant) {
      throw new Error('Not authorized to access this chat room');
    }

    // Get messages
    const messages = mockMessages.get(input.chatRoomId) || [];
    const paginatedMessages = messages
      .slice(input.offset, input.offset + input.limit)
      .reverse(); // Return in chronological order

    // Update last read timestamp
    participant.lastReadAt = new Date();

    return paginatedMessages;
  });

// Send message
export const sendMessage = protectedProcedure
  .input(z.object({
    chatRoomId: z.string(),
    content: z.string().min(1).max(1000),
    messageType: z.enum(['text', 'image', 'location']).default('text'),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    // Verify user is participant in chat room
    const chatRoom = mockChatRooms.get(input.chatRoomId);
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    const participant = chatRoom.participants.find((p: any) => p.userId === userId);
    if (!participant) {
      throw new Error('Not authorized to send messages in this chat room');
    }

    // Create message
    const message = {
      id: `msg-${Date.now()}`,
      chatRoomId: input.chatRoomId,
      senderId: userId,
      content: input.content,
      messageType: input.messageType,
      createdAt: new Date(),
      sender: {
        id: userId,
        name: ctx.user.name || 'Unknown User',
        avatar: ctx.user.avatar || '',
      }
    };

    // Store message
    const messages = mockMessages.get(input.chatRoomId) || [];
    messages.push(message);
    mockMessages.set(input.chatRoomId, messages);

    // Update chat room timestamp
    chatRoom.updatedAt = new Date();

    return message;
  });

// Get user's chat rooms
export const getUserChatRooms = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    const userChatRooms = Array.from(mockChatRooms.values())
      .filter((chatRoom: any) => 
        chatRoom.participants.some((p: any) => p.userId === userId)
      )
      .map((chatRoom: any) => {
        const messages = mockMessages.get(chatRoom.id) || [];
        const lastMessage = messages[messages.length - 1] || null;
        
        return {
          ...chatRoom,
          unreadCount: 0, // TODO: Calculate unread count
          lastMessage,
        };
      })
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return userChatRooms;
  });

// Mark messages as read
export const markMessagesAsRead = protectedProcedure
  .input(z.object({
    chatRoomId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    const chatRoom = mockChatRooms.get(input.chatRoomId);
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    const participant = chatRoom.participants.find((p: any) => p.userId === userId);
    if (participant) {
      participant.lastReadAt = new Date();
    }

    return { success: true };
  });

// Get unread message count
export const getUnreadCount = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;
    
    let totalUnread = 0;
    
    mockChatRooms.forEach((chatRoom: any) => {
      if (chatRoom.participants.some((p: any) => p.userId === userId)) {
        const messages = mockMessages.get(chatRoom.id) || [];
        const participant = chatRoom.participants.find((p: any) => p.userId === userId);
        
        if (participant) {
          const unreadMessages = messages.filter((msg: any) => 
            msg.senderId !== userId && 
            new Date(msg.createdAt) > new Date(participant.lastReadAt)
          );
          totalUnread += unreadMessages.length;
        }
      }
    });

    return totalUnread;
  });

export default {
  createChatRoom,
  getChatMessages,
  sendMessage,
  getUserChatRooms,
  markMessagesAsRead,
  getUnreadCount,
}; 