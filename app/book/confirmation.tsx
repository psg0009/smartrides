import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { notificationService } from '@/lib/notifications';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  useEffect(() => {
    // Send booking confirmation notification
    const sendConfirmationNotification = async () => {
      await notificationService.sendLocalNotification({
        type: 'booking_confirmed',
        title: '✅ Booking Confirmed!',
        body: 'Your ride has been successfully booked. Check your bookings for details.',
        bookingId: params.bookingId as string,
      });
    };
    
    sendConfirmationNotification();
  }, [params.bookingId]);
  
  const handleViewBookings = () => {
    router.push('/bookings');
  };
  
  const handleFindMoreRides = () => {
    router.push('/rides');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color={colors.success} />
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        
        <Text style={styles.message}>
          Your ride has been successfully booked. You can view the details in your bookings.
        </Text>
        
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.image}
        />
        
        <Text style={styles.instructionsTitle}>What's Next?</Text>
        
        <View style={styles.instructionContainer}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            You'll receive a confirmation email with all the details.
          </Text>
        </View>
        
        <View style={styles.instructionContainer}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            The driver will contact you before the ride through the app.
          </Text>
        </View>
        
        <View style={styles.instructionContainer}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Be at the pickup location 5 minutes before the scheduled time.
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="View My Bookings"
          onPress={handleViewBookings}
          style={styles.primaryButton}
        />
        
        <Button
          title="Find More Rides"
          variant="outline"
          onPress={handleFindMoreRides}
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    
  },
});