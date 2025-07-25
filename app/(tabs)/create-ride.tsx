import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Car, 
  Info
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { RideType } from '@/types';
import Toast from 'react-native-toast-message';

export default function CreateRideScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [rideType, setRideType] = useState<RideType>('carpool');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('4');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Car size={64} color={colors.gray[300]} />
        <Text style={styles.authTitle}>Login to offer rides</Text>
        <Text style={styles.authDescription}>
          You need to be logged in to create and offer rides to other students
        </Text>
        <Button 
          title="Login" 
          onPress={() => router.push('/auth/login')}
          style={styles.authButton}
        />
      </View>
    );
  }
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  
  const handleCreateRide = () => {
    if (!user || user.verificationStatus !== 'approved') {
      Toast.show({ type: 'error', text1: 'You must be a verified student to offer a ride.' });
      return;
    }
    if (!origin || !destination || !price || !seats) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    // Combine date and time
    const departureDateTime = new Date(date);
    departureDateTime.setHours(time.getHours(), time.getMinutes());
    
    // In a real app, you would send this data to your backend
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Your ride has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    }, 1500);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ride Type</Text>
          
          <View style={styles.rideTypeContainer}>
            <TouchableOpacity
              style={[
                styles.rideTypeOption,
                rideType === 'carpool' && styles.selectedRideType
              ]}
              onPress={() => setRideType('carpool')}
              activeOpacity={0.7}
            >
              <Users size={24} color={rideType === 'carpool' ? colors.primary : colors.gray[500]} />
              <Text style={[
                styles.rideTypeText,
                rideType === 'carpool' && styles.selectedRideTypeText
              ]}>
                Carpool
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.rideTypeOption,
                rideType === 'chauffeur' && styles.selectedRideType
              ]}
              onPress={() => setRideType('chauffeur')}
              activeOpacity={0.7}
            >
              <Car size={24} color={rideType === 'chauffeur' ? colors.primary : colors.gray[500]} />
              <Text style={[
                styles.rideTypeText,
                rideType === 'chauffeur' && styles.selectedRideTypeText
              ]}>
                Chauffeur
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pickup Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pickup location"
                placeholderTextColor={colors.gray[400]}
                value={origin}
                onChangeText={setOrigin}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={colors.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter destination"
                placeholderTextColor={colors.gray[400]}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity 
              style={styles.inputWithIcon}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Clock size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ride Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price per Seat ($)</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter price per seat"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Seats</Text>
            <View style={styles.inputWithIcon}>
              <Users size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Number of available seats"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
                value={seats}
                onChangeText={setSeats}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Additional Information (Optional)</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Add any details about the ride, luggage space, etc."
                placeholderTextColor={colors.gray[400]}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
        </View>
        
        <Button
          title="Create Ride"
          onPress={handleCreateRide}
          isLoading={isLoading}
          style={styles.createButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  rideTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rideTypeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    marginHorizontal: 8,
  },
  selectedRideType: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rideTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[600],
    marginTop: 8,
  },
  selectedRideTypeText: {
    color: colors.primary,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  dateTimeText: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'center',
    paddingVertical: 12,
  },
  textAreaContainer: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 12,
  },
  textArea: {
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: 8,
    marginBottom: 24,
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