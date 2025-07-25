import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  ChevronRight,
  Minus,
  Plus,
  UserPlus
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRidesStore } from '@/store/rides-store';
import { useBookingsStore } from '@/store/bookings-store';
import { trpcClient } from '@/lib/trpc';
import Button from '@/components/Button';

export default function GroupBookingScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();
  const { getRideById } = useRidesStore();
  const { createBooking, isLoading } = useBookingsStore();
  
  const [ride, setRide] = useState(getRideById(rideId));
  const [passengers, setPassengers] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [splitPayment, setSplitPayment] = useState(true);
  const [emails, setEmails] = useState<string[]>(['']);
  
  useEffect(() => {
    if (!ride) {
      Alert.alert('Error', 'Ride not found');
      router.back();
    }
  }, [ride]);
  
  if (!ride) {
    return null;
  }
  
  const departureDate = new Date(ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const totalPrice = ride.price * passengers;
  const pricePerPerson = splitPayment ? (totalPrice / (passengers)).toFixed(2) : totalPrice.toFixed(2);
  
  const handleDecreasePassengers = () => {
    if (passengers > 2) {
      setPassengers(passengers - 1);
      if (emails.length > passengers - 1) {
        setEmails(emails.slice(0, passengers - 1));
      }
    }
  };
  
  const handleIncreasePassengers = () => {
    if (passengers < ride.availableSeats) {
      setPassengers(passengers + 1);
      setEmails([...emails, '']);
    }
  };
  
  const handleEmailChange = (text: string, index: number) => {
    const newEmails = [...emails];
    newEmails[index] = text;
    setEmails(newEmails);
  };
  
  const handleBookRide = async () => {
    if (splitPayment && emails.some(email => !email)) {
      Alert.alert('Error', 'Please enter all passenger emails for split payment');
      return;
    }
    
    try {
      console.log('Creating group booking for ride:', ride.id);
      await createBooking(ride, passengers);
      console.log('Group booking created successfully');
      
      console.log('Processing payment...');
      const paymentResult = await trpcClient.payments.process.mutate({
        bookingId: `booking-${Date.now()}`,
        paymentMethod: paymentMethod as 'card' | 'university',
        amount: splitPayment ? (totalPrice / passengers) : totalPrice,
        cardDetails: paymentMethod === 'card' ? {
          cardNumber: '4242424242424242',
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'Test User'
        } : undefined,
        universityAccount: paymentMethod === 'university' ? {
          studentId: 'STU123456',
          accountNumber: 'ACC789012'
        } : undefined
      });
      
      console.log('Payment processed:', paymentResult);
      
      if (paymentResult.success) {
        router.push('/book/confirmation');
      } else {
        Alert.alert('Payment Failed', 'There was an issue processing your payment. Please try again.');
      }
    } catch (error) {
      console.error('Group booking/Payment error:', error);
      Alert.alert('Error', 'Failed to book ride or process payment');
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Group Booking</Text>
          <Text style={styles.sectionDescription}>
            Book a ride for your group and optionally split the payment
          </Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.locationContainer}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.locationText}>{ride.origin}</Text>
            </View>
            
            <View style={styles.routeLine}>
              <View style={styles.routeDot} />
              <View style={styles.routeDash} />
              <View style={styles.routeDot} />
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={20} color={colors.secondary} />
              <Text style={styles.locationText}>{ride.destination}</Text>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={18} color={colors.gray[600]} />
              <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={18} color={colors.gray[600]} />
              <Text style={styles.infoText}>{formattedTime}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Group Size</Text>
          
          <View style={styles.passengersContainer}>
            <TouchableOpacity 
              style={[styles.passengerButton, passengers === 2 && styles.disabledButton]}
              onPress={handleDecreasePassengers}
              disabled={passengers === 2}
              activeOpacity={0.7}
            >
              <Minus size={20} color={passengers === 2 ? colors.gray[400] : colors.text} />
            </TouchableOpacity>
            
            <View style={styles.passengerCountContainer}>
              <Text style={styles.passengerCount}>{passengers}</Text>
              <Text style={styles.passengerLabel}>
                passengers
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.passengerButton, passengers === ride.availableSeats && styles.disabledButton]}
              onPress={handleIncreasePassengers}
              disabled={passengers === ride.availableSeats}
              activeOpacity={0.7}
            >
              <Plus size={20} color={passengers === ride.availableSeats ? colors.gray[400] : colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.availableSeats}>
            {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} available
          </Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.splitPaymentHeader}>
            <Text style={styles.sectionTitle}>Split Payment</Text>
            <TouchableOpacity 
              style={styles.splitToggle}
              onPress={() => setSplitPayment(!splitPayment)}
              activeOpacity={0.7}
            >
              <Text style={styles.splitToggleText}>
                {splitPayment ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {splitPayment && (
            <>
              <Text style={styles.splitDescription}>
                Enter the email addresses of your group members to split the payment
              </Text>
              
              {emails.map((email, index) => (
                <View key={index} style={styles.emailInputContainer}>
                  <UserPlus size={20} color={colors.primary} style={styles.emailIcon} />
                  <TextInput
                    style={styles.emailInput}
                    placeholder={`Passenger ${index + 1} email`}
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => handleEmailChange(text, index)}
                  />
                </View>
              ))}
              
              <Text style={styles.splitNote}>
                Each passenger will receive an email to pay ${pricePerPerson}
              </Text>
            </>
          )}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentIconContainer}>
              <CreditCard size={20} color={colors.primary} />
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
              <Text style={styles.paymentSubtitle}>Pay with your card</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'university' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('university')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentIconContainer}>
              <Users size={20} color={colors.primary} />
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>University Account</Text>
              <Text style={styles.paymentSubtitle}>Charge to your student account</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base fare</Text>
            <Text style={styles.priceValue}>${ride.price.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Passengers</Text>
            <Text style={styles.priceValue}>x {passengers}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          
          {splitPayment && (
            <View style={styles.splitTotalRow}>
              <Text style={styles.splitTotalLabel}>Your portion</Text>
              <Text style={styles.splitTotalValue}>${pricePerPerson}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.footerPriceContainer}>
          <Text style={styles.footerPriceLabel}>
            {splitPayment ? 'Your portion' : 'Total'}
          </Text>
          <Text style={styles.footerPrice}>
            ${splitPayment ? pricePerPerson : totalPrice.toFixed(2)}
          </Text>
        </View>
        
        <Button
          title="Confirm Group Booking"
          onPress={handleBookRide}
          isLoading={isLoading}
          style={styles.confirmButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    height: 24,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  routeDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    minWidth: '45%',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.gray[600],
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  passengerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  passengerCountContainer: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  passengerCount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  passengerLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  availableSeats: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  splitPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  splitToggle: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  splitToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  splitDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  splitNote: {
    fontSize: 12,
    color: colors.gray[600],
    fontStyle: 'italic',
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.gray[50],
  },
  selectedPayment: {
    backgroundColor: colors.primaryLight + '40',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  splitTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight + '40',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  splitTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  splitTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerPriceContainer: {
    marginRight: 16,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
  },
});