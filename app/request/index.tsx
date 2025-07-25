import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/Button';
import Toast from 'react-native-toast-message';
import { trpcClient } from '@/lib/trpc';

export default function RideRequestScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengers, setPassengers] = useState('1');
  const [bags, setBags] = useState('0');
  const [notes, setNotes] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!from || !to || !date || !passengers) {
      Toast.show({ type: 'error', text1: 'Please fill in all required fields.' });
      return;
    }
    setIsLoading(true);
    try {
      await trpcClient.requests.create.mutate({
        from,
        to,
        date: date.toISOString(),
        passengers,
        bags,
        notes,
        priceRange,
        userId: 'user-1', // TODO: use real user ID
      });
      Toast.show({ type: 'success', text1: 'Ride request posted!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to post request' });
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>
      <TextInput
        style={styles.input}
        placeholder="From (Pickup Location)"
        value={from}
        onChangeText={setFrom}
      />
      <TextInput
        style={styles.input}
        placeholder="To (Dropoff Location)"
        value={to}
        onChangeText={setTo}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: '#333' }}>{date.toLocaleString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="# of Passengers"
        keyboardType="numeric"
        value={passengers}
        onChangeText={setPassengers}
      />
      <TextInput
        style={styles.input}
        placeholder="# of Bags"
        keyboardType="numeric"
        value={bags}
        onChangeText={setBags}
      />
      <TextInput
        style={styles.input}
        placeholder="Special Requests (Optional)"
        value={notes}
        onChangeText={setNotes}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferred Price Range (Optional)"
        value={priceRange}
        onChangeText={setPriceRange}
      />
      <Button
        title={isLoading ? 'Posting...' : 'Post Request'}
        onPress={handleSubmit}
        isLoading={isLoading}
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