import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Button from '@/components/Button';
import Toast from 'react-native-toast-message';
import { useStripe } from '@stripe/stripe-react-native';
import { trpcClient } from '@/lib/trpc';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function StudentOfferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: offer, isLoading, error } = trpcClient.requests.getOfferById.useQuery({ id: id as string }, { enabled: !!id });
  const [isLoadingPay, setIsLoadingPay] = useState(false);
  const { confirmPayment } = useStripe();

  const handleConfirm = async () => {
    if (!offer || !user) return;
    setIsLoadingPay(true);
    try {
      // 1. Call backend to get payment intent
      const serviceFee = Math.round(offer.price * 0.05 * 100) / 100;
      const total = Math.round((offer.price + serviceFee) * 100) / 100;
      const paymentResult = await trpcClient.payments.process.mutate({
        bookingId: `booking-${Date.now()}`,
        paymentMethod: 'card',
        amount: total,
        driverFare: offer.price,
        serviceFee,
        driverStripeAccountId: offer.driver?.stripeAccountId || '',
      });
      if (!paymentResult.success || !paymentResult.clientSecret) {
        Toast.show({ type: 'error', text1: 'Payment failed', text2: paymentResult.message });
        setIsLoadingPay(false);
        return;
      }
      // 2. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await confirmPayment(paymentResult.clientSecret, {
        paymentMethodType: 'Card',
      });
      if (stripeError) {
        Toast.show({ type: 'error', text1: 'Payment failed', text2: stripeError.message });
        setIsLoadingPay(false);
        return;
      }
      if (paymentIntent && paymentIntent.status === 'Succeeded') {
        // 3. Mark offer as accepted in backend
        await trpcClient.requests.offer.mutate({ offerId: offer.id, userId: user.id });
        Toast.show({ type: 'success', text1: 'Ride confirmed & paid!' });
        router.push('/(tabs)');
      } else {
        Toast.show({ type: 'error', text1: 'Payment not completed' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to confirm ride' });
    }
    setIsLoadingPay(false);
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }
  if (error || !offer) {
    return <View style={styles.container}><Text style={styles.title}>Offer not found.</Text></View>;
  }

  const serviceFee = Math.round(offer.price * 0.05 * 100) / 100;
  const total = Math.round((offer.price + serviceFee) * 100) / 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Ride Offer</Text>
      <Text style={styles.detail}>{offer.request?.from} → {offer.request?.to}</Text>
      <Text style={styles.detail}>Date: {offer.request?.date ? new Date(offer.request.date).toLocaleString() : ''}</Text>
      <Text style={styles.detail}>Driver: {offer.driver?.name || 'N/A'}</Text>
      <Text style={styles.detail}>Driver Offer: ${offer.price.toFixed(2)}</Text>
      <Text style={styles.detail}>SmartRides Fee: ${serviceFee.toFixed(2)}</Text>
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <Button
        title={isLoadingPay ? 'Paying...' : 'Confirm & Pay'}
        onPress={handleConfirm}
        isLoading={isLoadingPay}
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
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginVertical: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
}); 