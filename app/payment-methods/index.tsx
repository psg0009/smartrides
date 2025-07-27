import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

export default function PaymentMethodsScreen() {
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Please enter complete card details.');
      return;
    }
    setIsLoading(true);
    
    // TODO: Implement real Stripe integration when package is installed
    console.log('Would add card with details:', cardDetails);
    
    setTimeout(() => {
    setIsLoading(false);
      Alert.alert('Success', 'Card added successfully!');
    }, 1000);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Payment Method</Text>
      
      {/* TODO: Replace with real CardField when Stripe is installed */}
      <View style={styles.cardContainer}>
        <Text style={styles.placeholderText}>Card input field will be here</Text>
        <Text style={styles.placeholderSubtext}>4242 4242 4242 4242</Text>
      </View>
      
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
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  placeholderText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 2,
  },
  addButton: {
    marginTop: 24,
  },
});