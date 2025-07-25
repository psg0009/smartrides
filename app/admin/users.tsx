import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { trpcClient } from '@/lib/trpc';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpcClient.admin.listUsers.query().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleResend = async (userId: string) => {
    try {
      await trpcClient.admin.resendVerification.mutate({ userId });
      Alert.alert('Success', 'Verification email resent');
    } catch {
      Alert.alert('Error', 'Failed to resend email');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 24 }}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text>{item.email} ({item.verified ? 'Verified' : 'Unverified'})</Text>
            <Button title="Resend Verification" onPress={() => handleResend(item.id)} />
          </View>
        )}
      />
    </View>
  );
} 