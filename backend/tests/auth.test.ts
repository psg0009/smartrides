import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { appRouter } from '../trpc/app-router';
import { createContext } from '../trpc/create-context';
import { prisma } from '../prisma';
const bcrypt = require('bcryptjs');

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any test data
  });

  describe('Signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        role: 'student',
        university: 'Test University',
        verified: false,
        verificationStatus: 'none',
        rating: 0,
        avatar: null,
        stripeAccountId: null,
        stripeCustomerId: null,
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as any).mockResolvedValue(mockUser);

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      const result = await caller.auth.signup({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        university: 'Test University',
      });

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          university: mockUser.university,
          verified: mockUser.verified,
          rating: mockUser.rating,
          avatar: mockUser.avatar,
        },
        token: expect.any(String),
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          passwordHash: expect.any(String),
          university: 'Test University',
          role: 'student',
        },
      });
    });

    it('should hash password correctly', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedPassword',
        role: 'student',
        university: 'Test University',
        verified: false,
        verificationStatus: 'none',
        rating: 0,
        avatar: null,
        stripeAccountId: null,
        stripeCustomerId: null,
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as any).mockResolvedValue(mockUser);

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      await caller.auth.signup({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        university: 'Test University',
      });

      const createCall = (prisma.user.create as any).mock.calls[0][0];
      const hashedPassword = createCall.data.passwordHash;
      
      expect(hashedPassword).not.toBe('password123');
      expect(await bcrypt.compare('password123', hashedPassword)).toBe(true);
    });

    it('should not allow duplicate emails', async () => {
      (prisma.user.create as any).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      await expect(
        caller.auth.signup({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
          university: 'Test University',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('Login', () => {
    it('should login user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'student',
        university: 'Test University',
        verified: true,
        verificationStatus: 'approved',
        rating: 4.5,
        avatar: null,
        stripeAccountId: null,
        stripeCustomerId: null,
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      const result = await caller.auth.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          university: mockUser.university,
          verified: mockUser.verified,
          rating: mockUser.rating,
          avatar: mockUser.avatar,
        },
        token: expect.any(String),
      });
    });

    it('should reject login with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        role: 'student',
        university: 'Test University',
        verified: true,
        verificationStatus: 'approved',
        rating: 4.5,
        avatar: null,
        stripeAccountId: null,
        stripeCustomerId: null,
        pushToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      await expect(
        caller.auth.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const caller = appRouter.createCaller({
        req: {} as any,
        user: null,
        isAdmin: false,
      });

      await expect(
        caller.auth.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
}); 