import React from 'react';
import { View, Button, Alert } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

export default function DeleteAccountScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await trpcClient.auth.deleteAccount.mutate();
      Alert.alert('Account deleted', 'Your account has been deleted.');
      logout();
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Button title="Delete My Account" color="red" onPress={handleDelete} />
    </View>
  );
} 