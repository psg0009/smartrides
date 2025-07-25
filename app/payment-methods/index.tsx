import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardField, useStripe, CardFieldInput } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

export default function PaymentMethodsScreen() {
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Toast.show({ type: 'error', text1: 'Please enter complete card details.' });
      return;
    }
    setIsLoading(true);
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      // paymentMethodData: { billingDetails: { ... } }, // Optionally add billing details
    });
    setIsLoading(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to add card', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Card added successfully!' });
      // Optionally, save paymentMethod.id to user profile in backend
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Payment Method</Text>
      <CardField
        postalCodeEnabled={true}
        placeholders={{ number: '4242 4242 4242 4242' }}
        style={styles.cardContainer}
        onCardChange={(details: CardFieldInput.Details) => setCardDetails(details)}
            />
            <Button
        title={isLoading ? 'Adding...' : 'Add Card'}
              onPress={handleAddCard}
        disabled={isLoading}
        style={styles.addButton}
            />
          </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: colors.text,
    textAlign: 'center',
  },
  cardContainer: {
    height: 50,
    marginVertical: 16,
  },
  addButton: {
    marginTop: 24,
  },
});