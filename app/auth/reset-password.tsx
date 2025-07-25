import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await trpcClient.auth.confirmPasswordReset.mutate({ token, newPassword: password });
      Alert.alert('Success', 'Password reset! Please log in.');
      router.replace('/auth/login');
    } catch {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <TextInput placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry style={{ marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 }} />
      <Button title="Reset Password" onPress={handleReset} />
    </View>
  );
} 