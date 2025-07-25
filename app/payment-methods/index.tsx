import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  CreditCard, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Check, 
  School, 
  AlertCircle 
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

type PaymentMethod = {
  id: string;
  type: 'card' | 'university';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'university',
      name: 'State University Account',
      isDefault: false,
    },
  ]);
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <CreditCard size={64} color={colors.gray[300]} />
        <Text style={styles.authTitle}>Login to manage payment methods</Text>
        <Text style={styles.authDescription}>
          You need to be logged in to view and manage your payment methods
        </Text>
        <Button 
          title="Login" 
          onPress={() => router.push('/auth/login')}
          style={styles.authButton}
        />
      </View>
    );
  }
  
  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };
  
  const handleDeleteMethod = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleAddCard = () => {
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (cardNumber.length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }
    
    const lastFour = cardNumber.slice(-4);
    
    const newCard: PaymentMethod = {
      id: `card-${Date.now()}`,
      type: 'card',
      name: cardName,
      lastFour,
      expiryDate,
      isDefault: paymentMethods.length === 0,
    };
    
    setPaymentMethods([...paymentMethods, newCard]);
    setShowAddCard(false);
    
    // Reset form
    setCardName('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
  };
  
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCardNumber(cleaned);
  };
  
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length > 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>
          Manage your payment methods for ride bookings
        </Text>
      </View>
      
      {paymentMethods.length > 0 ? (
        <View style={styles.methodsContainer}>
          {paymentMethods.map(method => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodIconContainer}>
                {method.type === 'card' ? (
                  <CreditCard size={24} color={colors.primary} />
                ) : (
                  <School size={24} color={colors.primary} />
                )}
              </View>
              
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                {method.type === 'card' && (
                  <Text style={styles.methodDetails}>
                    •••• {method.lastFour} | Expires {method.expiryDate}
                  </Text>
                )}
              </View>
              
              <View style={styles.methodActions}>
                {method.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Check size={12} color={colors.success} />
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleSetDefault(method.id)}
                    style={styles.setDefaultButton}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  onPress={() => handleDeleteMethod(method.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Payment Methods</Text>
          <Text style={styles.emptyDescription}>
            Add a payment method to book rides easily
          </Text>
        </View>
      )}
      
      {!showAddCard ? (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddCard(true)}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.background} />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addCardContainer}>
          <Text style={styles.addCardTitle}>Add New Card</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name on Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name on card"
              placeholderTextColor={colors.gray[400]}
              value={cardName}
              onChangeText={setCardName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter card number"
              placeholderTextColor={colors.gray[400]}
              keyboardType="numeric"
              maxLength={16}
              value={cardNumber}
              onChangeText={formatCardNumber}
            />
          </View>
          
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
                maxLength={5}
                value={expiryDate}
                onChangeText={formatExpiryDate}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="CVV"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
                maxLength={3}
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
          
          <View style={styles.saveCardContainer}>
            <Text style={styles.saveCardText}>Save card for future payments</Text>
            <Switch
              value={saveCard}
              onValueChange={setSaveCard}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={saveCard ? colors.primary : colors.gray[100]}
            />
          </View>
          
          <View style={styles.addCardActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowAddCard(false)}
              style={styles.cancelButton}
            />
            
            <Button
              title="Add Card"
              onPress={handleAddCard}
              style={styles.confirmButton}
            />
          </View>
        </View>
      )}
      
      <View style={styles.universitySection}>
        <Text style={styles.sectionTitle}>University Payment</Text>
        <Text style={styles.sectionDescription}>
          Connect your university account to pay for rides directly through your student account
        </Text>
        
        <TouchableOpacity 
          style={styles.universityButton}
          activeOpacity={0.7}
        >
          <School size={20} color={colors.primary} />
          <Text style={styles.universityButtonText}>Connect University Account</Text>
          <ChevronRight size={16} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.securityNote}>
        <AlertCircle size={16} color={colors.gray[600]} />
        <Text style={styles.securityText}>
          Your payment information is securely stored and processed
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  methodsContainer: {
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    color: colors.gray[600],
  },
  methodActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
    marginLeft: 4,
  },
  setDefaultButton: {
    marginBottom: 8,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  addCardContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  saveCardText: {
    fontSize: 14,
    color: colors.text,
  },
  addCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
  },
  confirmButton: {
    flex: 1,
  },
  universitySection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
  universityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  universityButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: 8,
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