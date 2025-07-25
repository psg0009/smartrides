import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AdminLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpcClient.admin.getLogs.query().then(setLogs).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const csv = await trpcClient.admin.exportLogs.query();
      const fileUri = FileSystem.cacheDirectory + 'compliance-logs.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 16 }}>Compliance Logs</Text>
      <Button title="Export as CSV" onPress={handleExport} />
      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text>{item}</Text>
        )}
        ListEmptyComponent={<Text>No logs yet.</Text>}
      />
    </View>
  );
} 