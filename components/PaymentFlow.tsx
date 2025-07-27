import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CreditCard, Lock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/store/auth-store';

interface PaymentFlowProps {
  bookingId: string;
  amount: number;
  driverFare: number;
  serviceFee: number;
  driverStripeAccountId: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentFailure: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'university' | 'paypal';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export default function PaymentFlow({
  bookingId,
  amount,
  driverFare,
  serviceFee,
  driverStripeAccountId,
  onPaymentSuccess,
  onPaymentFailure,
}: PaymentFlowProps) {
  const { user } = useAuthStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // TODO: Replace with real tRPC hooks when routes are implemented
  const userPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      isDefault: true,
    },
    {
      id: 'pm_2',
      type: 'card',
      last4: '5555',
      brand: 'mastercard',
      isDefault: false,
    },
  ];

  useEffect(() => {
    setPaymentMethods(userPaymentMethods);
    // Set default payment method
    const defaultMethod = userPaymentMethods.find((method: PaymentMethod) => method.isDefault);
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod);
    }
  }, [userPaymentMethods]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Implement real payment processing when backend is ready
      console.log('Processing payment:', {
        bookingId,
        paymentMethod: selectedPaymentMethod.type,
        amount,
        driverFare,
        serviceFee,
        driverStripeAccountId,
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentId = `pay_${Date.now()}`;
      onPaymentSuccess(paymentId);
      Alert.alert('Success', 'Payment successful! Your booking has been confirmed.');
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentFailure(errorMessage);
      Alert.alert('Payment Failed', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNewCard = async () => {
    try {
      // In a real app, you would show a card input form
      // For now, we'll simulate adding a new card
      const newCard = {
        id: `card-${Date.now()}`,
        type: 'card' as const,
        last4: '4242',
        brand: 'visa',
        isDefault: false,
      };

      setPaymentMethods(prev => [...prev, newCard]);
      setSelectedPaymentMethod(newCard);

      Alert.alert('Success', 'Card added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add card. Please try again.');
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedPaymentMethod?.id === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethod
        ]}
        onPress={() => handlePaymentMethodSelect(method)}
      >
        <View style={styles.paymentMethodInfo}>
          <CreditCard size={20} color={colors.primary} />
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodName}>
              {method.type === 'card' ? `${method.brand?.toUpperCase()} •••• ${method.last4}` : method.type}
            </Text>
            {method.isDefault && (
              <Text style={styles.defaultBadge}>Default</Text>
            )}
          </View>
        </View>
        {isSelected && (
          <CheckCircle size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderPaymentSummary = () => (
    <View style={styles.paymentSummary}>
      <Text style={styles.summaryTitle}>Payment Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Driver Fare</Text>
        <Text style={styles.summaryValue}>${driverFare.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Service Fee</Text>
        <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Lock size={24} color={colors.primary} />
        <Text style={styles.title}>Secure Payment</Text>
      </View>

      {/* Payment Summary */}
      {renderPaymentSummary()}

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        {paymentMethods.length > 0 ? (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        ) : (
          <View style={styles.noPaymentMethods}>
            <CreditCard size={48} color={colors.gray[400]} />
            <Text style={styles.noPaymentMethodsText}>No payment methods</Text>
            <Text style={styles.noPaymentMethodsSubtext}>
              Add a payment method to continue
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addPaymentMethodButton}
          onPress={handleAddNewCard}
        >
          <CreditCard size={16} color={colors.primary} />
          <Text style={styles.addPaymentMethodText}>Add New Card</Text>
        </TouchableOpacity>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Lock size={16} color={colors.gray[600]} />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure
        </Text>
      </View>

      {/* Payment Button */}
      <TouchableOpacity
        style={[
          styles.payButton,
          (!selectedPaymentMethod || isProcessing) && styles.payButtonDisabled
        ]}
        onPress={handleProcessPayment}
        disabled={!selectedPaymentMethod || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <DollarSign size={20} color="#FFFFFF" />
        )}
        <Text style={styles.payButtonText}>
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Text>
      </TouchableOpacity>

      {/* Terms */}
      <View style={styles.terms}>
        <Text style={styles.termsText}>
          By completing this payment, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  paymentSummary: {
    backgroundColor: colors.gray[50],
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentMethodsList: {
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  defaultBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  noPaymentMethods: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: 16,
  },
  noPaymentMethodsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[600],
    marginTop: 12,
    marginBottom: 4,
  },
  noPaymentMethodsSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  addPaymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  addPaymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.gray[50],
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  terms: {
    padding: 16,
    paddingTop: 0,
  },
  termsText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
}); 