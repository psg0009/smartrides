import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useBookingsStore } from '@/store/bookings-store';
import { useAuthStore } from '@/store/auth-store';
import BookingCard from '@/components/BookingCard';
import Button from '@/components/Button';

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { bookings, fetchUserBookings, isLoading } = useBookingsStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated]);
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleFindRides = () => {
    router.push('/rides');
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Calendar size={64} color={colors.gray[300]} />
        <Text style={styles.authTitle}>Login to view your bookings</Text>
        <Text style={styles.authDescription}>
          You need to be logged in to see and manage your ride bookings
        </Text>
        <Button 
          title="Login" 
          onPress={handleLogin}
          style={styles.authButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.bookingsContainer}
        contentContainerStyle={styles.bookingsContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : bookings.length > 0 ? (
          bookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyDescription}>
              You haven't booked any rides yet. Find and book a ride to get started.
            </Text>
            <Button 
              title="Find a ride" 
              onPress={handleFindRides}
              style={styles.findRideButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  bookingsContainer: {
    flex: 1,
  },
  bookingsContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 16,
  },
  findRideButton: {
    marginTop: 8,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  authButton: {
    width: '60%',
  },
});