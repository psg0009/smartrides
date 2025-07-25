import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';

export default function DriverRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      const data = await trpcClient.requests.list.query();
      setRequests(data);
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Open Ride Requests</Text>
      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : requests.length === 0 ? (
        <Text style={styles.empty}>No open requests.</Text>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.route}>{req.from} → {req.to}</Text>
            <Text style={styles.detail}>Date: {new Date(req.date).toLocaleString()}</Text>
            <Text style={styles.detail}>Passengers: {req.passengers} | Bags: {req.bags}</Text>
            <Text style={styles.detail}>Notes: {req.notes}</Text>
            <Button title="View & Accept" onPress={() => router.push(`/driver/request/${req.id}`)} style={styles.button} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  route: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  button: {
    marginTop: 12,
  },
}); 