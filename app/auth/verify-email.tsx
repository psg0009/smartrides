import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      trpcClient.auth.verifyEmail.mutate({ token })
        .then(() => setVerified(true))
        .catch(() => Alert.alert('Error', 'Verification failed'));
    }
  }, [token]);

  return (
    <View style={{ padding: 24 }}>
      {verified ? (
        <>
          <Text>Email verified!</Text>
          <Button title="Go to Login" onPress={() => router.replace('/auth/login')} />
        </>
      ) : (
        <Text>Verifying...</Text>
      )}
    </View>
  );
} 