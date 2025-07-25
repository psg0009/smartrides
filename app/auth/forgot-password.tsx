import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { trpcClient } from '@/lib/trpc';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try {
      await trpcClient.auth.requestPasswordReset.mutate({ email });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send reset email');
    }
  };

  if (sent) return <Text>Check your email for a reset link.</Text>;

  return (
    <View style={{ padding: 24 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 }} />
      <Button title="Send Reset Link" onPress={handleSend} />
    </View>
  );
} 