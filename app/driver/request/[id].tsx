import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '@/components/Button';
import Toast from 'react-native-toast-message';
import { trpcClient } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

export default function DriverRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: request, isLoading, error } = trpcClient.requests.getById.useQuery({ id: id as string }, { enabled: !!id });
  const [price, setPrice] = useState('');
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);

  const handleAccept = async () => {
    if (!price) {
      Toast.show({ type: 'error', text1: 'Please enter your offer price.' });
      return;
    }
    if (!user) {
      Toast.show({ type: 'error', text1: 'You must be logged in as a driver.' });
      return;
    }
    setIsLoadingOffer(true);
    try {
      await trpcClient.requests.respond.mutate({
        requestId: id as string,
        driverId: user.id,
        price,
      });
      Toast.show({ type: 'success', text1: 'Offer sent to student!' });
      router.back();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send offer.' });
    }
    setIsLoadingOffer(false);
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }
  if (error || !request) {
    return <View style={styles.container}><Text style={styles.title}>Request not found.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Respond to Ride Request</Text>
      <Text style={styles.detail}>{request.from} → {request.to}</Text>
      <Text style={styles.detail}>Date: {new Date(request.date).toLocaleString()}</Text>
      <Text style={styles.detail}>Passengers: {request.passengers} | Bags: {request.bags}</Text>
      <Text style={styles.detail}>Notes: {request.notes}</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Offer Price ($)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <Button
        title={isLoadingOffer ? 'Sending...' : 'Send Offer'}
        onPress={handleAccept}
        isLoading={isLoadingOffer}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    marginTop: 16,
  },
}); 